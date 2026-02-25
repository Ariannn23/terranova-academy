"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  CourseSchema,
  SectionSchema,
  ScheduleSchema,
  ScheduleSchemaType,
} from "@/lib/validations/academic.schema";
import { Prisma } from "@prisma/client";

/**
 * Obtener la estructura académica jerárquica
 */
export async function getAcademicStructure() {
  try {
    const activeYear = await prisma.academicYear.findFirst({
      where: { active: true },
      include: {
        sections: {
          include: {
            gradeLevel: true,
            teacher: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!activeYear) {
      return { success: false, error: "No hay un año académico activo" };
    }

    // Agrupación por Niveles y Grados
    const levels = ["INICIAL", "PRIMARIA", "SECUNDARIA"];
    const structure = levels
      .map((level) => {
        const levelSections = activeYear.sections.filter(
          (s) => s.gradeLevel.level === level,
        );

        // Grados únicos en este nivel
        const gradeIds = Array.from(
          new Set(levelSections.map((s) => s.gradeLevelId)),
        );
        const grades = gradeIds
          .map((gid) => {
            const gradeSections = levelSections.filter(
              (s) => s.gradeLevelId === gid,
            );
            return {
              id: gid,
              name: gradeSections[0].gradeLevel.name,
              order: gradeSections[0].gradeLevel.order,
              sections: gradeSections.map((s) => ({
                id: s.id,
                name: s.name,
                tutor: s.teacher
                  ? `${s.teacher.firstName} ${s.teacher.lastName}`
                  : "Sin asignar",
              })),
            };
          })
          .sort((a, b) => a.order - b.order);

        return {
          name: level,
          grades,
        };
      })
      .filter((l) => l.grades.length > 0);

    return {
      success: true,
      data: {
        id: activeYear.id,
        year: activeYear.year,
        levels: structure,
      },
    };
  } catch (error) {
    console.error("Error in getAcademicStructure:", error);
    return {
      success: false,
      error: "Error al obtener la estructura académica",
    };
  }
}

/**
 * Obtener cursos de un grado
 */
export async function getCoursesByGradeLevel(gradeLevelId: string) {
  try {
    const courses = await prisma.course.findMany({
      where: { gradeLevelId, active: true },
      orderBy: { name: "asc" },
    });
    return { success: true, data: courses };
  } catch (error) {
    return { success: false, error: "Error al obtener los cursos" };
  }
}

/**
 * CRUD de Cursos
 */
export async function createCourse(data: unknown) {
  const parsed = CourseSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const course = await prisma.course.create({ data: parsed.data });
    revalidatePath("/dashboard/cursos");
    return { success: true, data: course };
  } catch (error) {
    return { success: false, error: "Error al crear el curso" };
  }
}

export async function updateCourse(id: string, data: unknown) {
  const parsed = CourseSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const course = await prisma.course.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/cursos");
    return { success: true, data: course };
  } catch (error) {
    return { success: false, error: "Error al actualizar el curso" };
  }
}

/**
 * CRUD de Secciones
 */
export async function createSection(data: unknown) {
  const parsed = SectionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const section = await prisma.section.create({ data: parsed.data });
    revalidatePath("/dashboard/secciones");
    return { success: true, data: section };
  } catch (error) {
    return { success: false, error: "Error al crear la sección" };
  }
}

/**
 * Asignar Tutor a Sección
 */
export async function assignTeacherToSection(
  sectionId: string,
  teacherId: string | null,
) {
  try {
    await prisma.section.update({
      where: { id: sectionId },
      data: { teacherId },
    });
    revalidatePath("/dashboard/secciones");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Error al asignar el docente" };
  }
}

/**
 * Horarios: Validación de Conflictos
 */
function timesOverlap(
  s1: { start: number; end: number },
  s2: { start: number; end: number },
) {
  return Math.max(s1.start, s2.start) < Math.min(s1.end, s2.end);
}

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export async function validateScheduleConflicts(
  teacherId: string,
  newSchedules: ScheduleSchemaType[],
) {
  try {
    // Obtener horarios existentes del docente en el año académico activo
    const existingSchedules = await prisma.schedule.findMany({
      where: {
        teacherId,
        section: { academicYear: { active: true } },
      },
      include: { section: { include: { gradeLevel: true } }, course: true },
    });

    const conflicts: string[] = [];

    for (const newItem of newSchedules) {
      const newRange = {
        start: timeToMinutes(newItem.startTime),
        end: timeToMinutes(newItem.endTime),
      };

      for (const existing of existingSchedules) {
        if (existing.dayOfWeek === newItem.dayOfWeek) {
          const existingRange = {
            start: timeToMinutes(existing.startTime),
            end: timeToMinutes(existing.endTime),
          };

          if (timesOverlap(newRange, existingRange)) {
            conflicts.push(
              `Conflicto el día ${newItem.dayOfWeek}: El docente ya tiene "${existing.course.name}" en ${existing.section.gradeLevel.name} "${existing.section.name}" de ${existing.startTime} a ${existing.endTime}`,
            );
          }
        }
      }
    }

    return { success: true, conflicts };
  } catch (error) {
    return { success: false, error: "Error al validar conflictos de horario" };
  }
}

/**
 * Guardar Horario de una Sección (Bulk)
 */
export async function saveSchedule(sectionId: string, scheduleData: any[]) {
  try {
    // Validar cada item
    const parsedData = z.array(ScheduleSchema).safeParse(scheduleData);
    if (!parsedData.success)
      return { success: false, error: "Datos de horario inválidos" };

    // Usar transacción para limpiar y guardar
    await prisma.$transaction([
      prisma.schedule.deleteMany({ where: { sectionId } }),
      prisma.schedule.createMany({
        data: parsedData.data.map((item) => ({ ...item, sectionId })),
      }),
    ]);

    revalidatePath(`/dashboard/horarios/${sectionId}`);
    return { success: true };
  } catch (error) {
    console.error("Error in saveSchedule:", error);
    return { success: false, error: "Error al guardar el horario" };
  }
}

/**
 * Obtener Horarios
 */
export async function getScheduleBySection(sectionId: string) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { sectionId },
      include: { course: true, teacher: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return { success: true, data: schedules };
  } catch (error) {
    return { success: false, error: "Error al obtener el horario" };
  }
}

export async function getScheduleByTeacher(teacherId: string) {
  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        teacherId,
        section: { academicYear: { active: true } },
      },
      include: { section: { include: { gradeLevel: true } }, course: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
    return { success: true, data: schedules };
  } catch (error) {
    return { success: false, error: "Error al obtener el horario del docente" };
  }
}
