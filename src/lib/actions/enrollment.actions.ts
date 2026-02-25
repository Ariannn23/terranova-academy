"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  EnrollmentSchema,
  SectionTransferSchema,
} from "@/lib/validations/enrollment.schema";
import { Prisma, Level, StudentStatus } from "@prisma/client";
import { addMonths, startOfMonth, format } from "date-fns";

/**
 * Obtener lista de matrículas con filtros
 */
export async function getEnrollments(params: {
  page?: number;
  limit?: number;
  search?: string;
  academicYearId?: string;
  level?: Level;
  gradeLevelId?: string;
  active?: boolean;
}) {
  const {
    page = 1,
    limit = 10,
    search,
    academicYearId,
    level,
    gradeLevelId,
    active,
  } = params;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.EnrollmentWhereInput = {};

    if (academicYearId) where.academicYearId = academicYearId;
    if (active !== undefined) where.active = active;

    if (level || gradeLevelId) {
      where.section = {
        ...(gradeLevelId ? { gradeLevelId } : {}),
        ...(level ? { gradeLevel: { level } } : {}),
      };
    }

    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { dni: { contains: search } },
        ],
      };
    }

    const [enrollments, total] = await prisma.$transaction([
      prisma.enrollment.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: true,
          section: {
            include: { gradeLevel: true },
          },
          academicYear: true,
        },
        orderBy: { enrollDate: "desc" },
      }),
      prisma.enrollment.count({ where }),
    ]);

    return {
      success: true,
      data: enrollments,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Error in getEnrollments:", error);
    return { success: false, error: "Error al obtener las matrículas" };
  }
}

/**
 * Obtener detalle de matrícula por ID
 */
export async function getEnrollmentById(id: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: { include: { guardians: true } },
        section: { include: { gradeLevel: true, teacher: true } },
        academicYear: true,
        gradeRecords: { include: { course: true } },
        payments: { include: { concept: true }, orderBy: { dueDate: "asc" } },
        attendances: { orderBy: { date: "desc" }, take: 30 },
        incidents: { orderBy: { date: "desc" } },
      },
    });

    if (!enrollment)
      return { success: false, error: "Matrícula no encontrada" };

    return { success: true, data: enrollment };
  } catch (error) {
    console.error("Error in getEnrollmentById:", error);
    return { success: false, error: "Error al obtener el detalle" };
  }
}

/**
 * Obtener matrículas por sección
 */
export async function getEnrollmentsBySection(sectionId: string) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { sectionId, active: true },
      include: {
        student: true,
        section: { include: { gradeLevel: true } },
      },
      orderBy: { student: { lastName: "asc" } },
    });

    return { success: true, data: enrollments };
  } catch (error) {
    console.error("Error in getEnrollmentsBySection:", error);
    return { success: false, error: "Error al obtener alumnos de la sección" };
  }
}

/**
 * Crear Matrícula con generación automática de pagos
 */
export async function createEnrollment(data: unknown) {
  const parsed = EnrollmentSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    // 1. Obtener datos del año académico y conceptos de pago (MENSUALIDAD)
    const [academicYear, monthlyConcepts] = await Promise.all([
      prisma.academicYear.findUnique({
        where: { id: parsed.data.academicYearId },
      }),
      prisma.paymentConcept.findMany({
        where: { type: "MENSUALIDAD", active: true },
      }),
    ]);

    if (!academicYear)
      return { success: false, error: "Año académico no encontrado" };

    // 2. Crear la matrícula y los pagos en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Validar @@unique([studentId, academicYearId])
      const existing = await tx.enrollment.findUnique({
        where: {
          studentId_academicYearId: {
            studentId: parsed.data.studentId,
            academicYearId: parsed.data.academicYearId,
          },
        },
      });

      if (existing) throw new Error("ALREADY_ENROLLED");

      const enrollment = await tx.enrollment.create({
        data: parsed.data,
      });

      // 3. Generar pagos mensuales automáticos
      const payments = [];
      const start = new Date(academicYear.startDate);
      const end = new Date(academicYear.endDate);

      // Lógica simplificada: un pago por mes desde inicio hasta fin del año lectivo
      let currentDate = startOfMonth(start);
      const endLimit = startOfMonth(end);

      while (currentDate <= endLimit) {
        for (const concept of monthlyConcepts) {
          payments.push({
            enrollmentId: enrollment.id,
            conceptId: concept.id,
            amount: concept.amount,
            dueDate: new Date(currentDate), // Se clona la fecha para evitar mutaciones
            status: "PENDIENTE" as const,
          });
        }
        currentDate = addMonths(currentDate, 1);
      }

      if (payments.length > 0) {
        await tx.payment.createMany({ data: payments });
      }

      return enrollment;
    });

    revalidatePath("/dashboard/matriculas");
    return { success: true, data: result };
  } catch (error: any) {
    if (error.message === "ALREADY_ENROLLED") {
      return {
        success: false,
        error: "El estudiante ya está matriculado en este año lectivo",
      };
    }
    console.error("Error in createEnrollment:", error);
    return { success: false, error: "Error al procesar la matrícula" };
  }
}

/**
 * Actualizar Matrícula
 */
export async function updateEnrollment(id: string, data: unknown) {
  const parsed = EnrollmentSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/dashboard/matriculas");
    revalidatePath(`/dashboard/matriculas/${id}`);
    return { success: true, data: enrollment };
  } catch (error) {
    console.error("Error in updateEnrollment:", error);
    return { success: false, error: "Error al actualizar la matrícula" };
  }
}

/**
 * Traslado de sección
 */
export async function transferSection(
  enrollmentId: string,
  newSectionId: string,
  reason: string,
) {
  const parsed = SectionTransferSchema.safeParse({
    enrollmentId,
    newSectionId,
    reason,
  });
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment)
      return { success: false, error: "Matrícula no encontrada" };

    const updatedNotes =
      `${enrollment.notes || ""}\n[Traslado ${format(new Date(), "dd/MM/yyyy")}]: ${reason}`.trim();

    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        sectionId: newSectionId,
        notes: updatedNotes,
      },
    });

    revalidatePath(`/dashboard/matriculas/${enrollmentId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in transferSection:", error);
    return { success: false, error: "Error al realizar el traslado" };
  }
}

/**
 * Importación masiva de matrículas
 */
export async function importEnrollments(data: any[]) {
  const results = {
    created: 0,
    failed: 0,
    errors: [] as string[],
  };

  for (const row of data) {
    try {
      const res = await createEnrollment(row);
      if (res.success) {
        results.created++;
      } else {
        results.failed++;
        results.errors.push(
          `DNI/ID ${row.studentId}: ${JSON.stringify(res.error)}`,
        );
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Error crítico en fila ${row.studentId}`);
    }
  }

  return results;
}
