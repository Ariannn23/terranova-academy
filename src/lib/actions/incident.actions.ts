"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { IncidentSchema } from "@/lib/validations/incident.schema";
import { IncidentSeverity } from "@prisma/client";

// ==========================================
// ACCIONES DE INCIDENCIAS (Comportamiento)
// ==========================================

export async function getIncidentById(id: string) {
  try {
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
  } catch (error) {
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
    const whereClause: any = {};

    if (filters?.sectionId) {
      whereClause.enrollment = { sectionId: filters.sectionId };
    }

    if (filters?.studentDni) {
      whereClause.enrollment = {
        ...whereClause.enrollment,
        student: { dni: { contains: filters.studentDni } },
      };
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
  const parsed = IncidentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

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
    return { success: true, data: incident };
  } catch (error) {
    console.error("Error in createIncident:", error);
    return { success: false, error: "Error al registrar la incidencia" };
  }
}

export async function updateIncident(id: string, data: unknown) {
  const parsed = IncidentSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
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
    return { success: true, data: incident };
  } catch (error: any) {
    console.error("Error in updateIncident:", error);
    return { success: false, error: "Error al actualizar la incidencia" };
  }
}

export async function deleteIncident(id: string) {
  try {
    const incident = await prisma.incident.delete({
      where: { id },
      include: {
        enrollment: {
          include: { student: { select: { dni: true } } },
        },
      },
    });

    revalidatePath(`/dashboard/estudiantes/${incident.enrollment.student.dni}`);
    return { success: true };
  } catch (error) {
    console.error("Error in deleteIncident:", error);
    return { success: false, error: "Error al eliminar la incidencia" };
  }
}
