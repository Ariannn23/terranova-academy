"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getStudents(
  query?: string,
  level?: string,
  status?: string,
) {
  try {
    const where: Prisma.StudentWhereInput = {};

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { dni: { contains: query } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (level) {
      where.enrollments = {
        some: {
          active: true,
          section: {
            gradeLevel: {
              level: level as any,
            },
          },
        },
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { active: true },
          include: {
            section: { include: { gradeLevel: true } },
          },
        },
      },
      orderBy: { lastName: "asc" },
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("Error listando estudiantes:", error);
    return { success: false, error: "Error al cargar la base de estudiantes" };
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: true,
        enrollments: {
          where: { active: true },
          include: {
            section: { include: { gradeLevel: true } },
          },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    return { success: true, data: student };
  } catch (error) {
    console.error("Error obteniendo estudiante:", error);
    return {
      success: false,
      error: "No se pudo cargar el perfil del estudiante.",
    };
  }
}

export async function createStudent(data: any) {
  try {
    const { student, guardian } = data;

    // Check if DNI already exists
    const existing = await prisma.student.findUnique({
      where: { dni: student.dni },
    });
    if (existing) {
      return {
        success: false,
        error: "Ya existe un estudiante registrado con el DNI ingresado.",
      };
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName: student.firstName,
        lastName: student.lastName,
        dni: student.dni,
        birthDate: new Date(student.birthDate),
        gender: student.gender,
        address: student.address,
        photoUrl: student.photoUrl,
        guardians: {
          create: {
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            dni: guardian.dni,
            relation: guardian.relation,
            phone: guardian.phone,
            email: guardian.email,
            isPrimary: true,
          },
        },
      },
    });

    return { success: true, data: newStudent };
  } catch (error) {
    console.error("Error creating student:", error);
    return {
      success: false,
      error: "Error interno del servidor al crear el registro.",
    };
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const { student, guardian } = data;

    // Check if DNI already exists for ANOTHER student
    const existing = await prisma.student.findUnique({
      where: { dni: student.dni },
    });
    if (existing && existing.id !== id) {
      return {
        success: false,
        error: "Ya existe otro estudiante registrado con ese DNI.",
      };
    }

    // Since we only have one primary guardian for now from the form, update it.
    // If not exists, find first guardian.
    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { guardians: true },
    });

    const guardianId = existingStudent?.guardians[0]?.id;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        firstName: student.firstName,
        lastName: student.lastName,
        dni: student.dni,
        birthDate: new Date(student.birthDate),
        gender: student.gender,
        address: student.address,
        photoUrl: student.photoUrl,
        guardians: {
          update: guardianId
            ? {
                where: { id: guardianId },
                data: {
                  firstName: guardian.firstName,
                  lastName: guardian.lastName,
                  dni: guardian.dni,
                  relation: guardian.relation,
                  phone: guardian.phone,
                  email: guardian.email,
                },
              }
            : undefined,
        },
      },
    });

    return { success: true, data: updatedStudent };
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      success: false,
      error: "Error interno del servidor al actualizar el registro.",
    };
  }
}

export async function toggleStudentStatus(id: string, newStatus: string) {
  try {
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { status: newStatus as any },
    });
    return { success: true, data: updatedStudent };
  } catch (error) {
    console.error("Error toggling student status:", error);
    return {
      success: false,
      error: "Error interno del servidor al cambiar el estado del estudiante.",
    };
  }
}
