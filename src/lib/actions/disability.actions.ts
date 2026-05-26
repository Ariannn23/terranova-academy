"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  DisabilitySchema,
  ResolveDisabilitySchema,
} from "@/lib/validations/incident.schema";
import { StudentStatus } from "@prisma/client";
import { calculateStudentStatus } from "@/lib/utils/student-status";
import { getStudentGrades } from "@/lib/actions/grade.actions";
import { getAttendanceStats } from "@/lib/actions/attendance.actions";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

// ==========================================
// ACCIONES DE INHABILITACIONES / SUSPENSIONES
// ==========================================

export async function getActiveDisabilities(sectionId?: string) {
  try {
    await requireRole(ROLE_GROUPS.DISCIPLINE);

    const whereClause: any = { active: true };
    if (sectionId) {
      whereClause.enrollment = { sectionId };
    }

    const disabilities = await prisma.disabilityRecord.findMany({
      where: whereClause,
      include: {
        enrollment: {
          include: {
            student: { select: { firstName: true, lastName: true, dni: true } },
            section: {
              select: {
                name: true,
                gradeLevel: { select: { name: true, level: true } },
              },
            },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return { success: true, data: disabilities };
  } catch (error) {
    console.error("Error in getActiveDisabilities:", error);
    return {
      success: false,
      error: "Error al obtener inhabilitaciones activas",
    };
  }
}

export async function getDisabilitiesByEnrollment(enrollmentId: string) {
  try {
    await requireAuth();

    const disabilities = await prisma.disabilityRecord.findMany({
      where: { enrollmentId },
      orderBy: { startDate: "desc" },
    });
    return { success: true, data: disabilities };
  } catch (error) {
    console.error("Error in getDisabilitiesByEnrollment:", error);
    return {
      success: false,
      error: "Error al obtener historial de suspensiones",
    };
  }
}

export async function createDisability(data: unknown) {
  await requireRole(ROLE_GROUPS.DISCIPLINE);

  const parsed = DisabilitySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const targetEnrollment = await prisma.enrollment.findUnique({
      where: { id: parsed.data.enrollmentId },
      select: {
        id: true,
        active: true,
        studentId: true,
        student: { select: { status: true } },
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Verificar si ya hay una activa
      const current = await tx.disabilityRecord.findFirst({
        where: { enrollmentId: parsed.data.enrollmentId, active: true },
      });

      if (current) {
        throw new Error("El alumno ya se encuentra inhabilitado actualmente.");
      }

      // 2. Crear el registro de inhabilitación
      const disability = await tx.disabilityRecord.create({
        data: {
          ...parsed.data,
          active: true,
        },
        include: {
          enrollment: {
            include: { student: true },
          },
        },
      });

      // 3. Imponer la regla de oro: MARCAR ALUMNO COMO INHABILITADO y MATRICULA COMO INACTIVA
      await tx.student.update({
        where: { id: disability.enrollment.studentId },
        data: { status: StudentStatus.INHABILITADO },
      });

      await tx.enrollment.update({
        where: { id: disability.enrollmentId },
        data: { active: false },
      });

      // Reflejar el nuevo estatus en la respuesta que devolvemos
      disability.enrollment.student.status = StudentStatus.INHABILITADO;

      return disability;
    });

    revalidatePath(`/dashboard/estudiantes/${result.enrollment.student.dni}`);
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.DISABILITY,
      entityId: result.id,
      oldValue: {
        enrollmentActive: targetEnrollment?.active,
        studentStatus: targetEnrollment?.student.status,
      },
      newValue: {
        enrollmentId: result.enrollmentId,
        studentId: result.enrollment.studentId,
        reason: result.reason,
        active: result.active,
        studentStatus: result.enrollment.student.status,
      },
      metadata: {
        module: "disabilities",
        operation: "create_disability",
      },
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in createDisability:", error);
    return {
      success: false,
      error: error.message || "Error al inhabilitar estudiante",
    };
  }
}

export async function resolveDisability(data: unknown) {
  await requireRole(ROLE_GROUPS.DISCIPLINE);

  const parsed = ResolveDisabilitySchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  const { id, resolvedNote } = parsed.data;

  try {
    // 1. Obtener la inhabilitación para saber el enrollmentId
    const currentDisability = await prisma.disabilityRecord.findUnique({
      where: { id },
      include: { enrollment: { include: { student: true } } },
    });

    if (!currentDisability) {
      throw new Error("Inhabilitación no encontrada");
    }

    // 2. Obtener datos externos ANTES de la transacción
    const [gradesRes, attendanceRes] = await Promise.all([
      getStudentGrades(currentDisability.enrollmentId),
      getAttendanceStats(currentDisability.enrollmentId),
    ]);

    // 3. Calcular estatus
    const failingCoursesCount = gradesRes.success
      ? (gradesRes.data || []).filter(
          (g: any) => g.period === "FINAL" && (g.score || 0) < 11,
        ).length
      : 0;

    const attendancePercentage = attendanceRes.success
      ? (attendanceRes.data?.percentage ?? 100)
      : 100;

    const totalCoursesCount = gradesRes.success
      ? new Set((gradesRes.data || []).map((g: any) => g.courseId)).size || 1
      : 1;

    const finalGrades = gradesRes.success
      ? (gradesRes.data || []).filter(
          (g: any) => g.period === "FINAL" && typeof g.score === "number",
        )
      : [];

    const averageScore =
      finalGrades.length > 0
        ? finalGrades.reduce(
            (acc: number, curr: any) => acc + (curr.score || 0),
            0,
          ) / finalGrades.length
        : 20;

    const newStatus = calculateStudentStatus(
      attendancePercentage,
      failingCoursesCount,
      totalCoursesCount,
      averageScore,
    );

    // 4. Ejecutar la transacción limpia
    const result = await prisma.$transaction(async (tx) => {
      const disability = await tx.disabilityRecord.update({
        where: { id },
        data: {
          active: false,
          resolvedAt: new Date(),
          resolvedNote: resolvedNote,
        },
        include: {
          enrollment: {
            include: { student: true },
          },
        },
      });

      await tx.student.update({
        where: { id: disability.enrollment.studentId },
        data: { status: newStatus },
      });

      // Reactivar la matrícula ya que la inhabilitación se levantó
      await tx.enrollment.update({
        where: { id: disability.enrollmentId },
        data: { active: true },
      });

      disability.enrollment.student.status = newStatus;
      disability.enrollment.active = true;
      return disability;
    });

    revalidatePath(`/dashboard/estudiantes/${result.enrollment.student.dni}`);
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.DISABILITY,
      entityId: result.id,
      oldValue: {
        active: currentDisability.active,
        studentStatus: currentDisability.enrollment.student.status,
        enrollmentActive: currentDisability.enrollment.active,
      },
      newValue: {
        active: result.active,
        resolvedAt: result.resolvedAt,
        studentStatus: result.enrollment.student.status,
        enrollmentActive: result.enrollment.active,
      },
      metadata: {
        module: "disabilities",
        operation: "resolve_disability",
        enrollmentId: result.enrollmentId,
        studentId: result.enrollment.studentId,
        reason: result.reason,
      },
    });
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in resolveDisability:", error);
    return {
      success: false,
      error: error.message || "Error al resolver la inhabilitación",
    };
  }
}
