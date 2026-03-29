"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSectionSchedule(sectionId: string) {
  try {
    // Fetch section and active teachers in parallel.
    // ⚠️ include: { teacher: true } inside schedules causes Prisma to generate
    //    SELECT FROM "Teacher" WHERE id IN (...) — which returns null entries when
    //    teacherId is null. We avoid this by joining teachers in memory instead.
    const [section, teachers] = await Promise.all([
      prisma.section.findUnique({
        where: { id: sectionId },
        include: {
          gradeLevel: {
            include: { courses: true },
          },
          schedules: {
            include: {
              course: true,
              // teacher omitted — joined in memory below
            },
          },
        },
      }),
      prisma.teacher.findMany({
        where: { active: true },
        orderBy: { lastName: "asc" },
      }),
    ]);

    if (!section) return { success: false, error: "Sección no encontrada." };

    // Build teacher map for O(1) lookup
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    // Attach teacher to each schedule block (null-safe)
    const schedulesWithTeacher = section.schedules.map((s: any) => ({
      ...s,
      teacher: s.teacherId ? (teacherMap.get(s.teacherId) ?? null) : null,
    }));

    return {
      success: true,
      data: {
        section,
        schedules: schedulesWithTeacher,
        courses: section.gradeLevel.courses,
        teachers,
      },
    };
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return {
      success: false,
      error: "Error interno del servidor al cargar el horario.",
    };
  }
}


export async function checkTeacherConflict(
  teacherId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  currentScheduleId?: string,
) {
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const newStart = parseTime(startTime);
  const newEnd = parseTime(endTime);

  const teacherSchedules = await prisma.schedule.findMany({
    where: {
      teacherId,
      dayOfWeek,
      ...(currentScheduleId ? { id: { not: currentScheduleId } } : {}),
    },
    include: {
      section: { include: { gradeLevel: true } },
    },
  });

  for (const ts of teacherSchedules) {
    const tsStart = parseTime(ts.startTime);
    const tsEnd = parseTime(ts.endTime);

    // Check overlap: (StartA < EndB) and (EndA > StartB)
    if (newStart < tsEnd && newEnd > tsStart) {
      return {
        hasConflict: true,
        conflictingSection: `${ts.section.gradeLevel.name} "${ts.section.name}"`,
      };
    }
  }

  return { hasConflict: false };
}

export async function saveScheduleBlock(data: {
  id?: string;
  sectionId: string;
  courseId: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  try {
    // 1. Conflict Check
    const conflict = await checkTeacherConflict(
      data.teacherId,
      data.dayOfWeek,
      data.startTime,
      data.endTime,
      data.id,
    );

    if (conflict.hasConflict) {
      return {
        success: false,
        error: `Conflicto de horario: El docente ya está dictando clase en ${conflict.conflictingSection} en este mismo bloque horario.`,
      };
    }

    // 2. Save or Update
    let schedule;
    if (data.id) {
      schedule = await prisma.schedule.update({
        where: { id: data.id },
        data: {
          courseId: data.courseId,
          teacherId: data.teacherId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });
    } else {
      schedule = await prisma.schedule.create({
        data: {
          sectionId: data.sectionId,
          courseId: data.courseId,
          teacherId: data.teacherId,
          dayOfWeek: data.dayOfWeek,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });
    }

    revalidatePath(`/dashboard/horarios/${data.sectionId}/editar`);
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Error saving schedule block:", error);
    return { success: false, error: "Error al guardar el bloque de horario." };
  }
}

export async function deleteScheduleBlock(id: string, sectionId: string) {
  try {
    await prisma.schedule.delete({ where: { id } });
    revalidatePath(`/dashboard/horarios/${sectionId}/editar`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting block:", error);
    return { success: false, error: "Error eliminando el bloque de horario" };
  }
}

export async function getActiveSectionsForSchedules() {
  try {
    const activeYear = await prisma.academicYear.findFirst({
      where: { active: true },
      select: { id: true },
    });

    if (!activeYear) {
      return { success: false, error: "No hay año académico activo." };
    }

    // ── ANTES: include: { teacher: true } generaba la query inválida ──────────
    //   SELECT FROM "Teacher" WHERE "id" IN (null, null, null, ...) [1340ms]
    //   Causa: Prisma hace un segundo SELECT para los teacherId relacionados.
    //   Cuando teacherId = null en la Section, pasa null al IN() → query inválida.
    //
    // ── AHORA: Traemos secciones y docentes en paralelo, join en memoria ───────
    //   2 queries limpias, sin nulls en el IN(), sin roundtrip extra.
    const [sections, teachers] = await Promise.all([
      prisma.section.findMany({
        where: { academicYearId: activeYear.id },
        select: {
          id: true,
          name: true,
          teacherId: true,
          gradeLevelId: true,
          gradeLevel: { select: { id: true, name: true, level: true, order: true } },
          _count: { select: { schedules: true } },
        },
        orderBy: [{ gradeLevel: { order: "asc" } }, { name: "asc" }],
      }),
      prisma.teacher.findMany({
        where: { active: true },
        select: { id: true, firstName: true, lastName: true, photoUrl: true },
      }),
    ]);

    // Índice de docentes para O(1) lookup en memoria
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));

    // Unir docente a su sección (null-safe: si teacherId es null → teacher: null)
    const sectionsWithTeacher = sections.map((s) => ({
      ...s,
      teacher: s.teacherId ? (teacherMap.get(s.teacherId) ?? null) : null,
    }));

    return { success: true, data: sectionsWithTeacher };
  } catch (error) {
    console.error("Error fetching sections for schedules:", error);
    return {
      success: false,
      error: "Error interno al cargar la lista de secciones.",
    };
  }
}

