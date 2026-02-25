"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { StudentStatus, Level, Prisma } from "@prisma/client";
import { z } from "zod";
import {
  CreateStudentSchema,
  StudentSchema,
} from "@/lib/validations/student.schema";

/**
 * Obtiene la lista paginada de estudiantes con filtros.
 */
export async function getStudents(params: {
  page?: number;
  limit?: number;
  search?: string;
  level?: Level;
  gradeLevelId?: string;
  status?: StudentStatus;
}) {
  const { page = 1, limit = 10, search, level, gradeLevelId, status } = params;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.StudentWhereInput = {};

    // Búsqueda por nombre, apellido o DNI
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { dni: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filtro por estado
    if (status) {
      where.status = status;
    }

    // Filtros por nivel o grado (requieren verificar matrícula activa)
    if (level || gradeLevelId) {
      where.enrollments = {
        some: {
          active: true,
          academicYear: { active: true },
          section: {
            ...(gradeLevelId ? { gradeLevelId } : {}),
            ...(level ? { gradeLevel: { level } } : {}),
          },
        },
      };
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        include: {
          enrollments: {
            where: {
              active: true,
              academicYear: { active: true },
            },
            include: {
              section: {
                include: { gradeLevel: true },
              },
            },
            take: 1,
          },
        },
        orderBy: { lastName: "asc" },
      }),
      prisma.student.count({ where }),
    ]);

    return {
      success: true,
      data: {
        students,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al obtener la lista de estudiantes",
    };
  }
}

/**
 * Obtiene los datos completos de un estudiante por su ID.
 */
export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: true,
        enrollments: {
          include: {
            academicYear: true,
            section: {
              include: { gradeLevel: true },
            },
          },
          orderBy: { academicYear: { year: "desc" } },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado" };
    }

    return { success: true, data: student };
  } catch (error) {
    return {
      success: false,
      error: "Error al obtener los detalles del estudiante",
    };
  }
}

/**
 * Búsqueda rápida de estudiantes por nombre o DNI.
 */
export async function searchStudents(query: string) {
  if (!query || query.length < 2) return { success: true, data: [] };

  try {
    const students = await prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { dni: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { lastName: "asc" },
    });

    return { success: true, data: students };
  } catch (error) {
    return { success: false, error: "Error en la búsqueda de estudiantes" };
  }
}

/**
 * Registra un nuevo estudiante con sus apoderados.
 */
export async function createStudent(data: unknown) {
  const parsed = CreateStudentSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { guardians, ...studentData } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el estudiante
      const student = await tx.student.create({
        data: studentData,
      });

      // 2. Crear los apoderados vinculados
      // Nota: Usamos createMany para eficiencia si hay varios, o un bucle si preferimos
      for (const guardian of guardians) {
        await tx.guardian.create({
          data: {
            ...guardian,
            studentId: student.id,
          },
        });
      }

      return student;
    });

    revalidatePath("/dashboard/estudiantes");
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { success: false, error: "Ya existe un estudiante con ese DNI" };
      }
    }
    return { success: false, error: "Error al registrar el estudiante" };
  }
}

/**
 * Actualiza los datos personales de un estudiante.
 */
export async function updateStudent(id: string, data: unknown) {
  const parsed = StudentSchema.partial().safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  try {
    const student = await prisma.student.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/dashboard/estudiantes");
    revalidatePath(`/dashboard/estudiantes/${id}`);

    return { success: true, data: student };
  } catch (error) {
    console.error("Error in updateStudent:", error);
    return {
      success: false,
      error: "Error al actualizar los datos del estudiante",
    };
  }
}

/**
 * Cambia el estado de un estudiante con un motivo obligatorio.
 */
export async function changeStudentStatus(
  id: string,
  status: StudentStatus,
  reason: string,
) {
  if (!reason || reason.trim().length === 0) {
    return {
      success: false,
      error: "El motivo del cambio de estado es obligatorio",
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id },
        data: { status },
      });

      // Si el estado es INHABILITADO, registramos en DisabilityRecord si hay matrícula activa
      if (status === "INHABILITADO") {
        const activeEnrollment = await tx.enrollment.findFirst({
          where: {
            studentId: id,
            active: true,
            academicYear: { active: true },
          },
        });

        if (activeEnrollment) {
          await tx.disabilityRecord.create({
            data: {
              enrollmentId: activeEnrollment.id,
              reason: "OTRO",
              description: reason,
              active: true,
            },
          });
        }
      }

      return student;
    });

    revalidatePath("/dashboard/estudiantes");
    revalidatePath(`/dashboard/estudiantes/${id}/estado`);
    revalidatePath(`/dashboard/estudiantes/${id}`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error in changeStudentStatus:", error);
    return {
      success: false,
      error: "Error al cambiar el estado del estudiante",
    };
  }
}
