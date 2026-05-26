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
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

/**
 * Obtener la estructura académica jerárquica
 */
export async function getAcademicStructure() {
  try {
    await requireAuth();

    // ⚠️ ANTES: sections: { include: { teacher: { select: {...} } } }
    // Prisma genera SELECT FROM "Teacher" WHERE id IN (null, null, ...) cuando
    // teacherId = null — incluso con `select` en vez de `include: true`.
    // El bug ocurre porque Prisma hace un segundo SELECT para resolver la relación
    // y pasa los teacherIds (incluidos los nulls) directamente al IN().
    //
    // FIX: Traemos secciones SIN teacher, luego teachers activos en paralelo,
    // y resolvemos el join en memoria con un Map (idéntico a getActiveSectionsForSchedules).
    const [activeYear, teachers] = await Promise.all([
      prisma.academicYear.findFirst({
        where: { active: true },
        include: {
          sections: {
            include: {
              gradeLevel: true,
              // teacher omitido — se resuelve en memoria
            },
          },
        },
      }),
      prisma.teacher.findMany({
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    if (!activeYear) {
      return { success: false, error: "No hay un año académico activo" };
    }

    // Índice O(1) por id de docente
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    // Inyectar docente en cada sección (null-safe)
    const sectionsWithTeacher = activeYear.sections.map((s) => ({
      ...s,
      teacher: s.teacherId ? (teacherMap.get(s.teacherId) ?? null) : null,
    }));

    const levels = ["INICIAL", "PRIMARIA", "SECUNDARIA"];
    const structure = levels
      .map((level) => {
        const levelSections = sectionsWithTeacher.filter(
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
    await requireAuth();

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
  await requireRole(ROLE_GROUPS.ACADEMIC);

  const parsed = CourseSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const course = await prisma.course.create({ data: parsed.data });
    revalidatePath("/dashboard/cursos");
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.COURSE,
      entityId: course.id,
      newValue: course,
      metadata: { module: "academic", operation: "create_course" },
    });
    return { success: true, data: course };
  } catch (error) {
    return { success: false, error: "Error al crear el curso" };
  }
}

export async function updateCourse(id: string, data: unknown) {
  await requireRole(ROLE_GROUPS.ACADEMIC);

  const parsed = CourseSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const oldCourse = await prisma.course.findUnique({ where: { id } });
    const course = await prisma.course.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/cursos");
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.COURSE,
      entityId: course.id,
      oldValue: oldCourse,
      newValue: course,
      metadata: { module: "academic", operation: "update_course" },
    });
    return { success: true, data: course };
  } catch (error) {
    return { success: false, error: "Error al actualizar el curso" };
  }
}

/**
 * CRUD de Secciones
 */
export async function createSection(data: unknown) {
  await requireRole(ROLE_GROUPS.ADMINISTRATION);

  const parsed = SectionSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const section = await prisma.section.create({ data: parsed.data });
    revalidatePath("/dashboard/secciones");
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.SECTION,
      entityId: section.id,
      newValue: section,
      metadata: { module: "academic", operation: "create_section" },
    });
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
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    const oldSection = await prisma.section.findUnique({
      where: { id: sectionId },
      select: { id: true, teacherId: true },
    });
    const section = await prisma.section.update({
      where: { id: sectionId },
      data: { teacherId },
    });
    revalidatePath("/dashboard/secciones");
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.SECTION,
      entityId: sectionId,
      oldValue: oldSection,
      newValue: { teacherId: section.teacherId },
      metadata: { module: "academic", operation: "assign_teacher_to_section" },
    });
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
    await requireRole(ROLE_GROUPS.ACADEMIC);

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
    await requireRole(ROLE_GROUPS.ACADEMIC);

    // Validar cada item
    const parsedData = z.array(ScheduleSchema).safeParse(scheduleData);
    if (!parsedData.success)
      return { success: false, error: "Datos de horario inválidos" };

    // Usar transacción para limpiar y guardar
    const previousSchedules = await prisma.schedule.findMany({
      where: { sectionId },
      select: {
        id: true,
        courseId: true,
        teacherId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
    });

    await prisma.$transaction([
      prisma.schedule.deleteMany({ where: { sectionId } }),
      prisma.schedule.createMany({
        data: parsedData.data.map((item) => ({ ...item, sectionId })),
      }),
    ]);

    revalidatePath(`/dashboard/horarios/${sectionId}`);
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.SECTION,
      entityId: sectionId,
      oldValue: { schedules: previousSchedules },
      newValue: { schedules: parsedData.data },
      metadata: {
        module: "academic",
        operation: "save_schedule",
        scheduleCount: parsedData.data.length,
      },
    });
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
    await requireRole(ROLE_GROUPS.ACADEMIC);

    // ⚠️ include: { teacher: true } genera un sub-SELECT adicional de Prisma.
    // Usamos selects explícitos + join en memoria para evitar queries inválidas.
    const [schedules, teachers] = await Promise.all([
      prisma.schedule.findMany({
        where: { sectionId },
        include: { course: true },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      }),
      prisma.teacher.findMany({
        where: { active: true },
        select: { id: true, firstName: true, lastName: true },
      }),
    ]);

    const teacherMap = new Map(teachers.map((t) => [t.id, t]));
    const schedulesWithTeacher = schedules.map((s) => ({
      ...s,
      teacher: teacherMap.get(s.teacherId) ?? null,
    }));

    return { success: true, data: schedulesWithTeacher };
  } catch (error) {
    return { success: false, error: "Error al obtener el horario" };
  }
}


export async function getScheduleByTeacher(teacherId: string) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

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
/**
 * Crear un año académico (para testing o nuevos años)
 * Si setActive=true, copia automáticamente las secciones del año anterior
 */
export async function createAcademicYear(year: number, startDate: Date, endDate: Date, setActive: boolean = false) {
  try {
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    if (year < 2000 || year > 2100) {
      return { success: false, error: "Año inválido" };
    }

    // IMPORTANTE: Obtener el año anterior FUERA de la transacción para evitar issues de caché
    const previousActiveYear = setActive
      ? await prisma.academicYear.findFirst({
          where: { active: true },
          include: { sections: true },
        })
      : null;

    // Usar transacción para garantizar consistencia
    const academicYear = await prisma.$transaction(async (tx) => {
      // Desactivar otros años académicos si es necesario
      if (setActive) {
        await tx.academicYear.updateMany({
          where: { active: true },
          data: { active: false },
        });
      }

      // Crear o actualizar el año académico
      const newAcademicYear = await tx.academicYear.upsert({
        where: { year },
        update: {
          startDate,
          endDate,
          active: setActive,
        },
        create: {
          year,
          startDate,
          endDate,
          active: setActive,
        },
      });

      // Si setActive y hay un año anterior con secciones, copiarlas
      if (setActive && previousActiveYear && previousActiveYear.sections.length > 0) {
        // Copiar secciones del año anterior al nuevo año
        for (const section of previousActiveYear.sections) {
          await tx.section.upsert({
            where: {
              gradeLevelId_academicYearId: {
                gradeLevelId: section.gradeLevelId,
                academicYearId: newAcademicYear.id,
              },
            },
            update: { name: section.name, teacherId: section.teacherId },
            create: {
              name: section.name,
              gradeLevelId: section.gradeLevelId,
              academicYearId: newAcademicYear.id,
              teacherId: section.teacherId,
            },
          });
        }
      }

      return newAcademicYear;
    });

    revalidatePath("/dashboard");
    return { success: true, data: academicYear };
  } catch (error) {
    console.error("Error en createAcademicYear:", error);
    return { success: false, error: "Error al crear el año académico" };
  }
}

/**
 * Debug: Ver exactamente qué año está activo y sus fechas
 */
export async function debugActiveYear() {
  try {
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    const activeYear = await prisma.academicYear.findFirst({
      where: { active: true },
    });

    if (!activeYear) {
      return { success: true, data: null, message: "No hay año activo" };
    }

    return {
      success: true,
      data: {
        year: activeYear.year,
        active: activeYear.active,
        startDate: activeYear.startDate.toISOString(),
        endDate: activeYear.endDate.toISOString(),
        startDateObj: { date: activeYear.startDate.toLocaleDateString(), time: activeYear.startDate.toLocaleTimeString() },
        endDateObj: { date: activeYear.endDate.toLocaleDateString(), time: activeYear.endDate.toLocaleTimeString() },
        today: new Date().toLocaleDateString(),
        todayObj: new Date(),
        isWithinRange: new Date() >= activeYear.startDate && new Date() <= activeYear.endDate,
      },
    };
  } catch (error) {
    console.error("Error en debugActiveYear:", error);
    return { success: false, error: "Error al obtener año activo" };
  }
}
export async function deleteAcademicYear2026() {
  try {
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    // Primero eliminar todas las secciones del 2026
    const year2026 = await prisma.academicYear.findUnique({
      where: { year: 2026 },
      include: { sections: true },
    });

    if (!year2026) {
      return { success: true, message: "Año 2026 no existe" };
    }

    // Usar transacción para garantizar consistencia
    await prisma.$transaction(async (tx) => {
      // Eliminar secciones
      if (year2026.sections.length > 0) {
        await tx.section.deleteMany({
          where: { academicYearId: year2026.id },
        });
      }

      // Eliminar el año
      await tx.academicYear.delete({
        where: { id: year2026.id },
      });

      // Reactivar el 2025 como año activo
      await tx.academicYear.updateMany({
        where: { year: 2025 },
        data: { active: true },
      });
    });

    revalidatePath("/dashboard");
    return { success: true, message: "Año 2026 eliminado y año 2025 reactivado" };
  } catch (error) {
    console.error("Error en deleteAcademicYear2026:", error);
    return { success: false, error: "Error al eliminar el año 2026" };
  }
}
