"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  TeacherSchema,
  TeacherSchemaType,
} from "@/lib/validations/teacher.schema";
import { Prisma } from "@prisma/client";

/**
 * Obtener lista de docentes con filtros
 */
export async function getTeachers(params: {
  search?: string;
  specialty?: string;
  active?: boolean;
}) {
  const { search, specialty, active } = params;

  try {
    const where: Prisma.TeacherWhereInput = {};

    if (active !== undefined) {
      where.active = active;
    }

    if (specialty) {
      where.specialty = {
        contains: specialty,
        mode: "insensitive",
      };
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { dni: { contains: search } },
      ];
    }

    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: { lastName: "asc" },
      include: {
        sections: {
          include: {
            gradeLevel: true,
          },
        },
      },
    });

    return { success: true, data: teachers };
  } catch (error) {
    console.error("Error in getTeachers:", error);
    return { success: false, error: "Error al obtener la lista de docentes" };
  }
}

/**
 * Obtener detalle de un docente por ID
 */
export async function getTeacherById(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        sections: {
          where: { academicYear: { active: true } },
          include: {
            gradeLevel: true,
            academicYear: true,
          },
        },
        schedules: {
          where: { section: { academicYear: { active: true } } },
          include: {
            course: true,
            section: { include: { gradeLevel: true } },
          },
        },
      },
    });

    if (!teacher) {
      return { success: false, error: "Docente no encontrado" };
    }

    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error in getTeacherById:", error);
    return { success: false, error: "Error al obtener el detalle del docente" };
  }
}

/**
 * Crear un nuevo docente
 */
export async function createTeacher(data: unknown) {
  const parsed = TeacherSchema.safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  try {
    const teacher = await prisma.teacher.create({
      data: parsed.data,
    });

    revalidatePath("/dashboard/docentes");
    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error in createTeacher:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Ya existe un docente con ese DNI o Email",
        };
      }
    }
    return { success: false, error: "Error al registrar el docente" };
  }
}

/**
 * Actualizar datos de un docente
 */
export async function updateTeacher(id: string, data: unknown) {
  const parsed = TeacherSchema.partial().safeParse(data);

  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten() };
  }

  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/dashboard/docentes");
    revalidatePath(`/dashboard/docentes/${id}`);
    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error in updateTeacher:", error);
    return { success: false, error: "Error al actualizar el docente" };
  }
}

/**
 * Desactivar un docente (borrado lógico)
 */
export async function deactivateTeacher(id: string) {
  try {
    const teacher = await prisma.teacher.update({
      where: { id },
      data: { active: false },
    });

    revalidatePath("/dashboard/docentes");
    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error in deactivateTeacher:", error);
    return { success: false, error: "Error al desactivar el docente" };
  }
}
