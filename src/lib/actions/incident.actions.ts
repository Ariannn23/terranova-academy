"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { IncidentSchema } from "@/lib/validations/incident.schema";
import { IncidentSeverity, Prisma } from "@prisma/client";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

// ==========================================
// ACCIONES DE INCIDENCIAS (Comportamiento)
// ==========================================

export async function getIncidentById(id: string) {
  try {
    await requireRole(ROLE_GROUPS.DISCIPLINE);

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true,
            section: {
              include: { gradeLevel: true },
            },
          },
        },
      },
    });

    if (!incident) return { success: false, error: "Incidencia no encontrada" };

    return { success: true, data: incident };
  } catch {
    return {
      success: false,
      error: "Error al obtener el detalle de la incidencia",
    };
  }
}
export async function getIncidents(filters?: {
  sectionId?: string;
  studentDni?: string;
  severity?: IncidentSeverity;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    await requireRole(ROLE_GROUPS.DISCIPLINE);

    const whereClause: Prisma.IncidentWhereInput = {};

    const enrollmentWhere: Prisma.EnrollmentWhereInput = {};

    if (filters?.sectionId) {
      enrollmentWhere.sectionId = filters.sectionId;
    }

    if (filters?.studentDni) {
      enrollmentWhere.student = { dni: { contains: filters.studentDni } };
    }

    if (filters?.sectionId || filters?.studentDni) {
      whereClause.enrollment = enrollmentWhere;
    }

    if (filters?.severity) {
      whereClause.severity = filters.severity;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.date = {};
      if (filters.startDate) whereClause.date.gte = filters.startDate;
      if (filters.endDate) whereClause.date.lte = filters.endDate;
    }

    const incidents = await prisma.incident.findMany({
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
      orderBy: { date: "desc" },
    });

    return { success: true, data: incidents };
  } catch (error) {
    console.error("Error in getIncidents:", error);
    return { success: false, error: "Error al obtener las incidencias" };
  }
}

export async function getIncidentsByEnrollment(enrollmentId: string) {
  try {
    await requireAuth();

    const incidents = await prisma.incident.findMany({
      where: { enrollmentId },
      orderBy: { date: "desc" },
    });
    return { success: true, data: incidents };
  } catch (error) {
    console.error("Error in getIncidentsByEnrollment:", error);
    return {
      success: false,
      error: "Error al obtener historial disciplinario",
    };
  }
}

export async function createIncident(data: unknown) {
  await requireRole(ROLE_GROUPS.DISCIPLINE);

  const parsed = IncidentSchema.safeParse(data);
  if (!parsed.success) {
    const messages = parsed.error.errors.map((e) => e.message).join(", ");
    return { success: false, error: messages };
  }

  try {
    // Verificar temporalmente que la matrícula existe
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: parsed.data.enrollmentId },
      select: { active: true },
    });

    if (!enrollment) {
      return { success: false, error: "Matrícula no encontrada" };
    }

    const incident = await prisma.incident.create({
      data: parsed.data,
      include: {
        enrollment: {
          include: { student: { select: { dni: true } } },
        },
      },
    });

    revalidatePath(`/dashboard/estudiantes/${incident.enrollment.student.dni}`);
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.INCIDENT,
      entityId: incident.id,
      newValue: {
        enrollmentId: incident.enrollmentId,
        date: incident.date,
        severity: incident.severity,
        description: incident.description,
        action: incident.action,
      },
      metadata: {
        module: "incidents",
        severity: incident.severity,
      },
    });
    return { success: true, data: incident };
  } catch (error) {
    console.error("Error in createIncident:", error);
    return { success: false, error: "Error al registrar la incidencia" };
  }
}

export async function updateIncident(id: string, data: unknown) {
  await requireRole(ROLE_GROUPS.DISCIPLINE);

  const parsed = IncidentSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const oldIncident = await prisma.incident.findUnique({
      where: { id },
      select: {
        id: true,
        enrollmentId: true,
        date: true,
        severity: true,
        description: true,
        action: true,
      },
    });

    const incident = await prisma.incident.update({
      where: { id },
      data: parsed.data,
      include: {
        enrollment: {
          include: { student: { select: { dni: true } } },
        },
      },
    });

    revalidatePath(`/dashboard/estudiantes/${incident.enrollment.student.dni}`);
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.INCIDENT,
      entityId: incident.id,
      oldValue: oldIncident,
      newValue: {
        enrollmentId: incident.enrollmentId,
        date: incident.date,
        severity: incident.severity,
        description: incident.description,
        action: incident.action,
      },
      metadata: {
        module: "incidents",
      },
    });
    return { success: true, data: incident };
  } catch (error) {
    console.error("Error in updateIncident:", error);
    return { success: false, error: "Error al actualizar la incidencia" };
  }
}

export async function deleteIncident(id: string) {
  try {
    await requireRole(ROLE_GROUPS.DISCIPLINE);

    const incident = await prisma.incident.delete({
      where: { id },
      include: {
        enrollment: {
          include: { student: { select: { dni: true } } },
        },
      },
    });

    revalidatePath(`/dashboard/estudiantes/${incident.enrollment.student.dni}`);
    await createAuditLog({
      action: AuditAction.DELETE,
      entity: AuditEntity.INCIDENT,
      entityId: incident.id,
      oldValue: {
        enrollmentId: incident.enrollmentId,
        date: incident.date,
        severity: incident.severity,
        description: incident.description,
        action: incident.action,
      },
      metadata: {
        module: "incidents",
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error in deleteIncident:", error);
    return { success: false, error: "Error al eliminar la incidencia" };
  }
}
