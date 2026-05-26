"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GradePeriod, StudentStatus } from "@prisma/client";
import { BatchGradeSchema } from "@/lib/validations/grade.schema";
import { calculateFinalScore, isPassing } from "@/lib/utils/grade-calculator";
import { calculateStudentStatus } from "@/lib/utils/student-status";
import { MIN_PASSING_SCORE } from "@/lib/constants";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

/**
 * Obtiene las notas de una sección para un curso y periodo específico.
 * Útil para llenar la grilla de ingreso de notas.
 */
export async function getGradesBySection(
  sectionId: string,
  courseId: string,
  period: GradePeriod,
) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const grades = await prisma.enrollment.findMany({
      where: {
        sectionId,
        active: true,
        academicYear: { active: true },
      },
      select: {
        id: true,
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
        gradeRecords: {
          where: { courseId, period },
          select: { score: true },
        },
      },
      orderBy: { student: { lastName: "asc" } },
    });

    return {
      success: true,
      data: grades.map((g) => ({
        enrollmentId: g.id,
        student: g.student,
        score: g.gradeRecords[0]?.score ?? null,
      })),
    };
  } catch (error) {
    console.error("Error in getGradesBySection:", error);
    return {
      success: false,
      error: "Error al obtener las notas de la sección",
    };
  }
}

/**
 * Guarda notas en lote para una sección/curso/periodo.
 * Realiza un upsert (crea si no existe, actualiza si existe).
 */
export async function saveGrades(data: unknown) {
  await requireRole(ROLE_GROUPS.ACADEMIC);

  const parsed = BatchGradeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  const { courseId, period, grades } = parsed.data;

  try {
    const oldGrades = await prisma.gradeRecord.findMany({
      where: {
        courseId,
        period,
        enrollmentId: { in: grades.map((grade) => grade.enrollmentId) },
      },
      select: {
        id: true,
        enrollmentId: true,
        courseId: true,
        period: true,
        score: true,
      },
    });

    // ── TRANSACCIÓN REDUCIDA: solo escrituras atómicas ─────────────────────
    // syncStudentStatus se movió FUERA (ver abajo). Esto reduce el tiempo que
    // la transacción mantiene abierta la conexión (y el COMMIT costoso).
    //
    // Antes: tx contenía upserts + calcFinal + syncStatus → COMMIT a 183ms
    // Ahora: tx contiene solo upserts + calcFinal upserts
    //
    // student.status es un campo denormalizado (caché del estado calculado).
    // Si el proceso falla después del COMMIT, las notas quedan guardadas y el
    // status se corrige en el siguiente guardado. Esto es aceptable.
    const result = await prisma.$transaction(
      async (tx) => {
        // ── FASE 1: Upserts de notas en paralelo ──────────────────────────
        await Promise.all(
          grades.map((item) =>
            tx.gradeRecord.upsert({
              where: {
                enrollmentId_courseId_period: {
                  enrollmentId: item.enrollmentId,
                  courseId,
                  period,
                },
              },
              update: { score: item.score },
              create: {
                enrollmentId: item.enrollmentId,
                courseId,
                period,
                score: item.score,
              },
            }),
          ),
        );

        // ── FASE 2: Recálculo de nota final en paralelo ───────────────────
        // Pasamos el score recién guardado para evitar un findMany extra por alumno.
        // internalCalculateFinalGrade solo necesita el score nuevo del periodo actual;
        // los otros periodos los trae con un findMany filtrado (P1–P4 sin el actual).
        if (period !== GradePeriod.FINAL) {
          await Promise.all(
            grades.map((item) =>
              internalCalculateFinalGrade(
                tx,
                item.enrollmentId,
                courseId,
                period,
                item.score,
              ),
            ),
          );
        }

        return { count: grades.length };
      },
      { maxWait: 15000, timeout: 15000 },
    );

    // ── FASE 3 (POST-TRANSACTION): Sync de estado del alumno ─────────────
    // Corre DESPUÉS del COMMIT con await — el semáforo está actualizado
    // antes de que la UI reciba la respuesta.
    // Usa prisma global (no tx, que ya no existe en este punto).
    // Si falla, las notas ya están guardadas correctamente en DB:
    // el error se loggea pero NO revierte nada ni rompe la respuesta.
    const uniqueEnrollmentIds = Array.from(
      new Set(grades.map((g) => g.enrollmentId)),
    );
    try {
      await Promise.all(
        uniqueEnrollmentIds.map((enrollmentId) =>
          syncStudentStatus(prisma, enrollmentId),
        ),
      );
    } catch (syncError) {
      console.error(
        "[saveGrades] syncStudentStatus post-tx falló:",
        syncError,
      );
      // No relanzamos — las notas están guardadas, solo el semáforo falló.
    }

    revalidatePath("/dashboard/notas");
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.GRADE,
      oldValue: oldGrades,
      newValue: grades.map((grade) => ({
        enrollmentId: grade.enrollmentId,
        courseId,
        period,
        score: grade.score,
      })),
      metadata: {
        module: "grades",
        courseId,
        period,
        affectedCount: result.count,
      },
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in saveGrades:", error);
    return {
      success: false,
      error:
        "Error al guardar las notas: " +
        String((error as any)?.message || error),
    };
  }
}


/**
 * Obtiene la boleta completa del estudiante (todos los cursos, todos los periodos).
 */
export async function getStudentGrades(enrollmentId: string) {
  try {
    await requireAuth();

    const records = await prisma.gradeRecord.findMany({
      where: { enrollmentId },
      include: { course: true },
      orderBy: [{ course: { name: "asc" } }, { period: "asc" }],
    });

    return { success: true, data: records };
  } catch (error) {
    console.error("Error in getStudentGrades:", error);
    return { success: false, error: "Error al obtener las notas del alumno" };
  }
}

/**
 * Calcula y guarda la nota FINAL de un curso para una matrícula.
 */
export async function calculateFinalGrade(
  enrollmentId: string,
  courseId: string,
) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const result = await prisma.$transaction(async (tx) => {
      return await internalCalculateFinalGrade(tx, enrollmentId, courseId);
    });
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.GRADE,
      entityId: result.id,
      newValue: {
        enrollmentId,
        courseId,
        period: result.period,
        score: result.score,
      },
      metadata: {
        module: "grades",
        operation: "calculate_final_grade",
      },
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in calculateFinalGrade:", error);
    return { success: false, error: "Error al calcular la nota final" };
  }
}

/**
 * Helper interno para transacciones que calcula la nota final.
 * Si se proveen `currentPeriod` y `currentScore`, se usa ese valor directamente
 * en lugar de releer el registro que acabamos de guardar (ahorra 1 query por alumno).
 */
async function internalCalculateFinalGrade(
  tx: any,
  enrollmentId: string,
  courseId: string,
  currentPeriod?: GradePeriod,
  currentScore?: number | null,
) {
  // Construir el conjunto de notas de periodos intermedios.
  // Si ya sabemos el score del periodo actual, solo pedimos los otros 3.
  const periodsToFetch = currentPeriod
    ? [GradePeriod.P1, GradePeriod.P2, GradePeriod.P3, GradePeriod.P4].filter(
        (p) => p !== currentPeriod,
      )
    : [GradePeriod.P1, GradePeriod.P2, GradePeriod.P3, GradePeriod.P4];

  const records = await tx.gradeRecord.findMany({
    where: {
      enrollmentId,
      courseId,
      period: { in: periodsToFetch },
    },
    select: { period: true, score: true },
  });

  // Construir mapa de scores: periodos de DB + el actual ya conocido
  const scoreMap = new Map<GradePeriod, number | null>(
    records.map((r: any) => [r.period, r.score]),
  );
  if (currentPeriod !== undefined) {
    scoreMap.set(currentPeriod, currentScore ?? null);
  }

  const getScore = (p: GradePeriod) => scoreMap.get(p) ?? null;

  const finalScore = calculateFinalScore(
    getScore(GradePeriod.P1),
    getScore(GradePeriod.P2),
    getScore(GradePeriod.P3),
    getScore(GradePeriod.P4),
  );

  return await tx.gradeRecord.upsert({
    where: {
      enrollmentId_courseId_period: {
        enrollmentId,
        courseId,
        period: GradePeriod.FINAL,
      },
    },
    update: { score: finalScore },
    create: {
      enrollmentId,
      courseId,
      period: GradePeriod.FINAL,
      score: finalScore,
    },
  });
}

/**
 * Sincroniza el estado (ACTIVO, OBSERVADO, etc.) de un estudiante basado en sus notas actuales.
 * Acepta tanto un cliente de transacción (tx) como el cliente global de Prisma.
 */
async function syncStudentStatus(client: any, enrollmentId: string) {
  const enrollment = await client.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      student: true,
      gradeRecords: { where: { period: GradePeriod.FINAL } },
      section: {
        include: {
          gradeLevel: {
            include: { courses: true },
          },
        },
      },
    },
  });

  if (!enrollment) return;

  const totalCourses = enrollment.section.gradeLevel.courses.length;
  const failingCourses = enrollment.gradeRecords.filter(
    (r: any) => !isPassing(r.score),
  ).length;

  const scores = enrollment.gradeRecords
    .map((r: any) => r.score)
    .filter((s: any) => s !== null);
  const average =
    scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

  // Por ahora simulamos asistencia al 100% hasta que el módulo de asistencia esté listo
  const attendancePercent = 100;

  const newStatus = calculateStudentStatus(
    attendancePercent,
    failingCourses,
    totalCourses,
    average,
  );

  if (enrollment.student.status !== newStatus) {
    await client.student.update({
      where: { id: enrollment.studentId },
      data: { status: newStatus },
    });
  }
}

/**
 * Alumnos jalando 2+ cursos en el año actual (basado en notas finales calculadas).
 */
export async function getStudentsAtRisk(sectionId: string) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId,
        active: true,
        academicYear: { active: true },
      },
      include: {
        student: true,
        gradeRecords: { where: { period: GradePeriod.FINAL } },
      },
    });

    const atRisk = enrollments.filter((e) => {
      const failingCount = e.gradeRecords.filter(
        (r) => !isPassing(r.score),
      ).length;
      return failingCount >= 2;
    });

    return { success: true, data: atRisk };
  } catch (error) {
    console.error("Error in getStudentsAtRisk:", error);
    return { success: false, error: "Error al obtener alumnos en riesgo" };
  }
}

/**
 * Reporte estadístico de una sección por periodo.
 */
export async function getSectionGradeReport(
  sectionId: string,
  period: GradePeriod,
) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const enrollments = await prisma.enrollment.findMany({
      where: { sectionId, active: true },
      include: {
        student: true,
        gradeRecords: { where: { period } },
      },
    });

    const stats = enrollments.map((e) => {
      const scores = e.gradeRecords
        .map((r) => r.score)
        .filter((s): s is number => s !== null);
      const studentAvg =
        scores.length > 0
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      return {
        studentId: e.student.id,
        name: `${e.student.lastName}, ${e.student.firstName}`,
        average: studentAvg,
        failingCount: e.gradeRecords.filter((r) => !isPassing(r.score)).length,
      };
    });

    const sectionAvg =
      stats.length > 0
        ? stats.reduce((a, b) => a + b.average, 0) / stats.length
        : 0;

    return {
      success: true,
      data: {
        average: Number(sectionAvg.toFixed(2)),
        totalStudents: stats.length,
        ranking: stats.sort((a, b) => b.average - a.average),
      },
    };
  } catch (error) {
    console.error("Error in getSectionGradeReport:", error);
    return {
      success: false,
      error: "Error al generar el reporte de la sección",
    };
  }
}

/**
 * Recalcula todas las notas finales y el estado de un alumno.
 */
export async function calculateAllFinalGrades(enrollmentId: string) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          section: { include: { gradeLevel: { include: { courses: true } } } },
        },
      });

      if (!enrollment) throw new Error("Matrícula no encontrada");

      for (const course of enrollment.section.gradeLevel.courses) {
        await internalCalculateFinalGrade(tx, enrollmentId, course.id);
      }

      await syncStudentStatus(tx, enrollmentId);
    });

    revalidatePath("/dashboard/notas");
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.GRADE,
      entityId: enrollmentId,
      newValue: { enrollmentId },
      metadata: {
        module: "grades",
        operation: "calculate_all_final_grades",
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error in calculateAllFinalGrades:", error);
    return { success: false, error: "Error al recalcular notas finales" };
  }
}
