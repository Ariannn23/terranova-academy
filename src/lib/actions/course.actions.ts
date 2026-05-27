"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

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
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.COURSE,
      entityId: course.id,
      newValue: course,
      metadata: { module: "courses" },
    });
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
    const oldCourse = await prisma.course.findUnique({ where: { id } });

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
    await createAuditLog({
      action:
        data.active !== undefined
          ? AuditAction.CHANGE_STATUS
          : AuditAction.UPDATE,
      entity: AuditEntity.COURSE,
      entityId: course.id,
      oldValue: oldCourse,
      newValue: course,
      metadata: { module: "courses" },
    });
    return { success: true, data: course };
  } catch (error) {
    console.error("Error updating course:", error);
    return { success: false, error: "Error al actualizar el curso." };
  }
}
