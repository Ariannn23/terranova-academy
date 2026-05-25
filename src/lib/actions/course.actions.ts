"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";

export async function getCourses() {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const courses = await prisma.course.findMany({
      orderBy: [{ gradeLevel: { order: "asc" } }, { name: "asc" }],
      include: {
        gradeLevel: true,
        _count: {
          select: { schedules: true },
        },
      },
    });
    return { success: true, data: courses };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      success: false,
      error: "Error interno del servidor al cargar cursos.",
    };
  }
}

export async function createCourse(data: {
  name: string;
  gradeLevelId: string;
  hoursPerWeek: number;
}) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const existing = await prisma.course.findUnique({
      where: {
        name_gradeLevelId: {
          name: data.name,
          gradeLevelId: data.gradeLevelId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "Este curso ya existe para este grado." };
    }

    const course = await prisma.course.create({
      data: {
        name: data.name,
        gradeLevelId: data.gradeLevelId,
        hoursPerWeek: data.hoursPerWeek,
      },
    });

    revalidatePath("/dashboard/cursos");
    return { success: true, data: course };
  } catch (error) {
    console.error("Error creating course:", error);
    return { success: false, error: "Error al crear el curso." };
  }
}

export async function updateCourse(
  id: string,
  data: {
    name?: string;
    gradeLevelId?: string;
    hoursPerWeek?: number;
    active?: boolean;
  },
) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    if (data.name && data.gradeLevelId) {
      const existing = await prisma.course.findUnique({
        where: {
          name_gradeLevelId: {
            name: data.name,
            gradeLevelId: data.gradeLevelId,
          },
        },
      });
      if (existing && existing.id !== id) {
        return {
          success: false,
          error: "Este curso ya existe para este grado.",
        };
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/cursos");
    return { success: true, data: course };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: "Error al actualizar el curso." };
  }
}
