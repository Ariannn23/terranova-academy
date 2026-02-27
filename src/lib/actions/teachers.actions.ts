"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTeachers() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { lastName: "asc" },
      include: {
        _count: {
          select: { sections: true, schedules: true },
        },
      },
    });
    return { success: true, data: teachers };
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return {
      success: false,
      error: "Error interno del servidor al cargar docentes.",
    };
  }
}

export async function getTeacherById(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        sections: {
          include: { gradeLevel: true, academicYear: true },
        },
        schedules: {
          include: { course: true, section: { include: { gradeLevel: true } } },
        },
      },
    });

    if (!teacher) {
      return { success: false, error: "Docente no encontrado." };
    }

    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error fetching teacher:", error);
    return { success: false, error: "Error interno del servidor." };
  }
}

export async function createTeacher(data: any) {
  try {
    // Check DNI
    const existingDni = await prisma.teacher.findUnique({
      where: { dni: data.dni },
    });
    if (existingDni)
      return { success: false, error: "El DNI ya está registrado." };

    // Check Email
    const existingEmail = await prisma.teacher.findUnique({
      where: { email: data.email },
    });
    if (existingEmail)
      return { success: false, error: "El email ya está registrado." };

    const teacher = await prisma.teacher.create({
      data: {
        dni: data.dni,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        photoUrl: data.photoUrl,
        active: data.active ?? true,
      },
    });

    revalidatePath("/dashboard/docentes");
    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error creating teacher:", error);
    return { success: false, error: "Error al crear el docente." };
  }
}

export async function updateTeacher(id: string, data: any) {
  try {
    // Check DNI uniqueness if changed
    if (data.dni) {
      const existingDni = await prisma.teacher.findUnique({
        where: { dni: data.dni },
      });
      if (existingDni && existingDni.id !== id) {
        return {
          success: false,
          error: "El DNI ya está en uso por otro docente.",
        };
      }
    }

    // Check Email uniqueness if changed
    if (data.email) {
      const existingEmail = await prisma.teacher.findUnique({
        where: { email: data.email },
      });
      if (existingEmail && existingEmail.id !== id) {
        return {
          success: false,
          error: "El email ya está en uso por otro docente.",
        };
      }
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        dni: data.dni,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        specialty: data.specialty,
        photoUrl: data.photoUrl,
        active: data.active,
      },
    });

    revalidatePath("/dashboard/docentes");
    revalidatePath(`/dashboard/docentes/${id}`);
    return { success: true, data: teacher };
  } catch (error) {
    console.error("Error updating teacher:", error);
    return { success: false, error: "Error al actualizar el docente." };
  }
}

export async function toggleTeacherStatus(id: string, active: boolean) {
  try {
    await prisma.teacher.update({
      where: { id },
      data: { active },
    });
    revalidatePath("/dashboard/docentes");
    return { success: true };
  } catch (error) {
    console.error("Error toggling teacher status:", error);
    return { success: false, error: "Error al cambiar estado del docente." };
  }
}
