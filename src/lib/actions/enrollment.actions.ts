"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  EnrollmentSchema,
  SectionTransferSchema,
} from "@/lib/validations/enrollment.schema";
import { Prisma, Level, StudentStatus } from "@prisma/client";
import { addMonths, startOfMonth, format } from "date-fns";

// ==========================================
// ACCIONES PARA MATRÍCULAS (ENROLLMENT)
// ==========================================

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
    // 1. Obtener datos del año académico y conceptos de pago
    const [academicYear, monthlyConcepts, enrollmentConcepts] =
      await Promise.all([
        prisma.academicYear.findUnique({
          where: { id: parsed.data.academicYearId },
        }),
        prisma.paymentConcept.findMany({
          where: { type: "MENSUALIDAD", active: true, amount: { gt: 0 } },
          orderBy: { amount: "desc" },
        }),
        prisma.paymentConcept.findMany({
          where: { type: "MATRICULA", active: true },
        }),
      ]);

    if (!academicYear)
      return { success: false, error: "Año académico no encontrado" };

    // 2. Crear la matrícula y los pagos en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // A. Validar @@unique([studentId, academicYearId])
      const existing = await tx.enrollment.findUnique({
        where: {
          studentId_academicYearId: {
            studentId: parsed.data.studentId,
            academicYearId: parsed.data.academicYearId,
          },
        },
      });

      if (existing) throw new Error("ALREADY_ENROLLED");

      // B. Verificar/Generar código de estudiante si no tiene
      const student = await tx.student.findUnique({
        where: { id: parsed.data.studentId },
        select: { id: true, code: true },
      });

      if (student && !student.code) {
        // Obtener el nivel para el prefijo
        const section = await tx.section.findUnique({
          where: { id: parsed.data.sectionId },
          include: { gradeLevel: true },
        });

        if (section) {
          const levelPrefix =
            section.gradeLevel.level === "INICIAL"
              ? "I"
              : section.gradeLevel.level === "PRIMARIA"
                ? "P"
                : "S";
          const yearPrefix = academicYear.year.toString();
          const searchPrefix = `${yearPrefix}${levelPrefix}`;

          // Buscar el último código con ese prefijo
          const lastStudentWithCode = await tx.student.findFirst({
            where: { code: { startsWith: searchPrefix } },
            orderBy: { code: "desc" },
          });

          let sequence = 1;
          if (lastStudentWithCode && lastStudentWithCode.code) {
            const lastSeqStr = lastStudentWithCode.code.slice(
              searchPrefix.length,
            );
            sequence = parseInt(lastSeqStr, 10) + 1;
          }

          const newCode = `${searchPrefix}${sequence.toString().padStart(4, "0")}`;
          await tx.student.update({
            where: { id: student.id },
            data: { code: newCode },
          });
        }
      }

      const enrollment = await tx.enrollment.create({
        data: parsed.data,
      });

      // 3. Generar pagos automáticos
      const payments = [];

      // A. Cuota de Matrícula (Solo la primera activa encontrada)
      if (enrollmentConcepts.length > 0) {
        const enrollmentConcept = enrollmentConcepts[0];
        // Normalizar fecha al inicio de marzo a las 12:00 para coincidir con el primer mes si es marzo
        // o simplemente a las 12:00 de hoy para evitar problemas de micro-segundos en el sort
        const todayAtNoon = new Date();
        todayAtNoon.setHours(12, 0, 0, 0);

        payments.push({
          enrollmentId: enrollment.id,
          conceptId: enrollmentConcept.id,
          amount: enrollmentConcept.amount,
          dueDate: todayAtNoon, // Vence hoy normalizado
          status: "PENDIENTE" as const,
        });
      }

      // B. Pensiones Mensuales (MARZO a DICIEMBRE = 10 cuotas)
      const academicYearValue = academicYear.year; // e.g., 2026

      // Usar solo el primer concepto de mensualidad para evitar duplicados accidentales
      const monthlyConcept = monthlyConcepts[0];

      if (monthlyConcept) {
        // Forzar inicio en Marzo (mes 2, ya que Enero es 0)
        let currentDate = new Date(academicYearValue, 2, 1, 12, 0, 0);
        // Forzar fin en Diciembre (mes 11)
        const endLimit = new Date(academicYearValue, 11, 1, 12, 0, 0);

        while (currentDate <= endLimit) {
          payments.push({
            enrollmentId: enrollment.id,
            conceptId: monthlyConcept.id,
            amount: monthlyConcept.amount,
            dueDate: new Date(currentDate),
            status: "PENDIENTE" as const,
          });
          currentDate = addMonths(currentDate, 1);
        }
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

/**
 * Obtener datos para el Wizard de Matrícula
 */
export async function getWizardData() {
  try {
    const students = await prisma.student.findMany({
      where: { status: "ACTIVO" },
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
        photoUrl: true,
        enrollments: {
          where: { active: true },
          select: { id: true },
        },
      },
    });

    const academicYears = await prisma.academicYear.findMany({
      where: { active: true },
      orderBy: { year: "desc" },
    });

    // Solo retornamos estudiantes que no tienen matrícula activa
    const eligibleStudents = students.filter((s) => s.enrollments.length === 0);

    const sections = await prisma.section.findMany({
      where: {
        academicYearId: academicYears[0]?.id,
      },
      include: {
        gradeLevel: true,
        _count: {
          select: { enrollments: { where: { active: true } } },
        },
      },
      orderBy: [{ gradeLevel: { order: "asc" } }, { name: "asc" }],
    });

    const mappedSections = sections.map((s) => ({
      id: s.id,
      name: s.name,
      capacity: 30, // Defecto si no existe en BD
      occupied: s._count.enrollments,
      gradeLevelId: s.gradeLevelId,
      grade: s.gradeLevel.name,
      level: s.gradeLevel.level,
    }));

    return {
      success: true,
      data: {
        students: eligibleStudents,
        sections: mappedSections,
        academicYears,
      },
    };
  } catch (error) {
    console.error("Error obteniendo datos del wizard:", error);
    return { success: false, error: "Error de conexión al cargar datos base." };
  }
}

/**
 * Cambiar estado de matrícula (activar/desactivar)
 */
export async function toggleEnrollmentStatus(id: string, newStatus: boolean) {
  try {
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: { active: newStatus },
    });
    revalidatePath("/dashboard/matriculas");
    return { success: true, data: updatedEnrollment };
  } catch (error) {
    console.error("Error toggling enrollment status:", error);
    return {
      success: false,
      error: "Error interno del servidor al cambiar el estado de la matrícula.",
    };
  }
}
