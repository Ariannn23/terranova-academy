"use server";

import { prisma } from "@/lib/prisma";

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

    // Only return students without an active enrollment
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

export async function createEnrollment(
  studentId: string,
  sectionId: string,
  academicYearId: string,
) {
  try {
    const active = await prisma.enrollment.findFirst({
      where: { studentId, active: true },
    });

    if (active) {
      return {
        success: false,
        error: "El estudiante ya tiene una matrícula activa.",
      };
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId,
        sectionId,
        academicYearId,
        active: true,
      },
    });

    return { success: true, data: enrollment };
  } catch (error) {
    console.error("Error creando matrícula:", error);
    return {
      success: false,
      error: "Error en el servidor al matricular al alumno.",
    };
  }
}

export async function getEnrollments() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            dni: true,
            photoUrl: true,
          },
        },
        section: { include: { gradeLevel: true } },
        academicYear: true,
      },
      orderBy: { enrollDate: "desc" },
    });

    return { success: true, data: enrollments };
  } catch (error) {
    console.error("Error obteniendo matrículas:", error);
    return {
      success: false,
      error: "Error interno del servidor al obtener matrículas.",
    };
  }
}
