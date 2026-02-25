"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GradePeriod, StudentStatus } from "@prisma/client";
import { BatchGradeSchema } from "@/lib/validations/grade.schema";
import { calculateFinalScore, isPassing } from "@/lib/utils/grade-calculator";
import { calculateStudentStatus } from "@/lib/utils/student-status";
import { MIN_PASSING_SCORE } from "@/lib/constants";

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
  const parsed = BatchGradeSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  const { courseId, period, grades } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Guardar cada nota
      for (const item of grades) {
        await tx.gradeRecord.upsert({
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
        });

        // 2. Si el periodo no es 'FINAL', disparamos el cálculo de la nota final del curso
        if (period !== GradePeriod.FINAL) {
          await internalCalculateFinalGrade(tx, item.enrollmentId, courseId);
        }

        // 3. Sincronizar estado del alumno (Semáforo)
        await syncStudentStatus(tx, item.enrollmentId);
      }
      return { count: grades.length };
    });

    revalidatePath("/dashboard/notas");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in saveGrades:", error);
    return { success: false, error: "Error al guardar las notas" };
  }
}

/**
 * Obtiene la boleta completa del estudiante (todos los cursos, todos los periodos).
 */
export async function getStudentGrades(enrollmentId: string) {
  try {
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
    const result = await prisma.$transaction(async (tx) => {
      return await internalCalculateFinalGrade(tx, enrollmentId, courseId);
    });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in calculateFinalGrade:", error);
    return { success: false, error: "Error al calcular la nota final" };
  }
}

/**
 * Helper interno para transacciones que calcula la nota final.
 */
async function internalCalculateFinalGrade(
  tx: any,
  enrollmentId: string,
  courseId: string,
) {
  const records = await tx.gradeRecord.findMany({
    where: {
      enrollmentId,
      courseId,
      period: {
        in: [GradePeriod.P1, GradePeriod.P2, GradePeriod.P3, GradePeriod.P4],
      },
    },
  });

  const getScore = (p: GradePeriod) =>
    records.find((r: any) => r.period === p)?.score ?? null;

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
 */
async function syncStudentStatus(tx: any, enrollmentId: string) {
  const enrollment = await tx.enrollment.findUnique({
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
    await tx.student.update({
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
    return { success: true };
  } catch (error) {
    console.error("Error in calculateAllFinalGrades:", error);
    return { success: false, error: "Error al recalcular notas finales" };
  }
}
