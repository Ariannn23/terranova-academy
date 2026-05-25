"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { TeacherSchema } from "@/lib/validations/teacher.schema";
import { Prisma } from "@prisma/client";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";

/**
 * Obtener lista de docentes con filtros
 */
export async function getTeachers(params?: {
  search?: string;
  specialty?: string;
  active?: boolean;
}) {
  await requireAuth();

  const search = params?.search;
  const specialty = params?.specialty;
  const active = params?.active;

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
        _count: {
          select: { sections: true, schedules: true },
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
    await requireAuth();

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
  await requireRole(ROLE_GROUPS.ADMINISTRATION);

  const parsed = TeacherSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      details: parsed.error.flatten(),
    };
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
  await requireRole(ROLE_GROUPS.ADMINISTRATION);

  const parsed = TeacherSchema.partial().safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      details: parsed.error.flatten(),
    };
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
 * Cambiar estado (Activar/Desactivar)
 */
export async function toggleTeacherStatus(id: string, active: boolean) {
  try {
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    const teacher = await prisma.teacher.update({
      where: { id },
      data: { active },
    });

    revalidatePath("/dashboard/docentes");
    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error in toggleTeacherStatus:", error);
    return { success: false, error: "Error al cambiar estado del docente" };
  }
}
