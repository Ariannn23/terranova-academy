"use server";

// lib/actions/attendance.actions.ts — Server Actions para Asistencia

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  SaveAttendanceBatchSchema,
  JustifyAbsenceSchema,
  CriticalAttendanceFilterSchema,
  SectionAttendanceReportSchema,
} from "@/lib/validations/attendance.schema";
import { calculateStudentStatus } from "@/lib/utils/student-status";
import { RISK_ABSENCE_PERCENT } from "@/lib/constants";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

/**
 * Obtener lista de asistencia de una sección en una fecha específica
 * Incluye todos los alumnos inscritos con su estado de asistencia
 */
export async function getAttendanceBySection(sectionId: string, date: Date) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    // Validar sectionId
    if (!sectionId || sectionId.trim().length === 0) {
      return { success: false, error: "ID de sección inválido" };
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Obtener todos los alumnos inscritos en la sección
    const enrollments = await prisma.enrollment.findMany({
      where: {
        sectionId,
        active: true,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            dni: true,
          },
        },
      },
    });

    if (enrollments.length === 0) {
      return {
        success: false,
        error: "No hay matrículas activas en esta sección",
      };
    }

    // Obtener registros de asistencia para esa fecha
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollmentId: { in: enrollments.map((e) => e.id) },
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Combinar datos: alumno + asistencia
    const result = enrollments.map((enrollment) => {
      const attendance = attendances.find(
        (a) => a.enrollmentId === enrollment.id,
      );
      return {
        id: enrollment.id,
        enrollmentId: enrollment.id,
        studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        studentDni: enrollment.student.dni,
        attendance: attendance
          ? {
              id: attendance.id,
              status: attendance.status,
              justification: attendance.justification,
              date: attendance.date.toISOString(),
            }
          : null,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error en getAttendanceBySection:", error);
    return {
      success: false,
      error: "Error al obtener asistencia de la sección",
    };
  }
}

/**
 * Obtener historial de asistencia de un alumno
 * Filtrable por mes y año. Si no se proporcionan, retorna todo el historial
 */
export async function getAttendanceByStudent(
  enrollmentId: string,
  month?: number,
  year?: number,
) {
  try {
    await requireAuth();

    if (!enrollmentId || enrollmentId.trim().length === 0) {
      return { success: false, error: "ID de matrícula inválido" };
    }

    // Validar mes y año si se proporcionan
    if (month && (month < 1 || month > 12)) {
      return { success: false, error: "Mes inválido (1-12)" };
    }
    if (year && year < 2000) {
      return { success: false, error: "Año inválido" };
    }

    // Verificar que la matrícula existe — select solo los campos necesarios
    // en lugar de include: { student: true, section: true } que trae todas las columnas
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      select: {
        id: true,
        student: { select: { firstName: true, lastName: true, dni: true } },
        section: { select: { name: true } },
      },
    });

    if (!enrollment) {
      return { success: false, error: "Matrícula no encontrada" };
    }

    // Construir filtro de fechas
    let dateFilter: Prisma.DateTimeFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter = { gte: startDate, lte: endDate };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = { gte: startDate, lte: endDate };
    }

    // Obtener historial
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollmentId,
        ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
      },
      orderBy: { date: "asc" },
    });

    return {
      success: true,
      data: {
        student: {
          name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          dni: enrollment.student.dni,
        },
        section: enrollment.section.name,
        records: attendances.map((a) => ({
          ...a,
          date: a.date.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Error en getAttendanceByStudent:", error);
    return {
      success: false,
      error: "Error al obtener historial de asistencia",
    };
  }
}

/**
 * Guardar registros de asistencia en lote (upsert por enrollmentId+date)
 * Después de guardar, recalcula el estado del estudiante
 */
export async function saveAttendance(input: unknown) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const parsed = SaveAttendanceBatchSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }

    const { records } = parsed.data;

    // Obtener el año académico activo para validar fechas
    const activeYear = await prisma.academicYear.findFirst({
      where: { active: true },
    });

    if (!activeYear) {
      return { success: false, error: "No hay año académico activo" };
    }

    // Validar que los registros están dentro del rango académico
    for (const record of records) {
      if (
        record.date < activeYear.startDate ||
        record.date > activeYear.endDate
      ) {
        return {
          success: false,
          error: `La fecha ${record.date.toLocaleDateString()} está fuera del año académico`,
        };
      }
    }

    // Upsert: crear o actualizar registros
    const results = await Promise.all(
      records.map((record) =>
        prisma.attendance.upsert({
          where: {
            enrollmentId_date: {
              enrollmentId: record.enrollmentId,
              date: new Date(record.date),
            },
          },
          update: {
            status: record.status,
            justification: record.justification,
          },
          create: {
            enrollmentId: record.enrollmentId,
            date: new Date(record.date),
            status: record.status,
            justification: record.justification,
          },
        }),
      ),
    );

    // Recalcular estado de estudiantes después de guardar asistencia
    const uniqueEnrollmentIds = Array.from(
      new Set(records.map((r) => r.enrollmentId)),
    );

    for (const enrollmentId of uniqueEnrollmentIds) {
      await updateStudentStatusByEnrollment(enrollmentId);
    }

    revalidatePath("/dashboard/asistencia");
    const statusCounts = records.reduce<Record<string, number>>((acc, record) => {
      acc[record.status] = (acc[record.status] ?? 0) + 1;
      return acc;
    }, {});

    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.ATTENDANCE,
      newValue: {
        records: records.map((record) => ({
          enrollmentId: record.enrollmentId,
          date: record.date,
          status: record.status,
          hasJustification: !!record.justification,
        })),
      },
      metadata: {
        module: "attendance",
        affectedCount: results.length,
        statusCounts,
      },
    });

    return {
      success: true,
      data: { recordsSaved: results.length },
    };
  } catch (error) {
    console.error("Error en saveAttendance:", error);
    return { success: false, error: "Error al guardar asistencia" };
  }
}

/**
 * Justificar una falta: cambiar de FALTA_INJUSTIFICADA a FALTA_JUSTIFICADA
 */
export async function justifyAbsence(input: unknown) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const parsed = JustifyAbsenceSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }

    const { attendanceId, justification, justifiedBy } = parsed.data;

    // Verificar que el registro existe
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      return { success: false, error: "Registro de asistencia no encontrado" };
    }

    // No permitir justificar si no es una falta injustificada
    if (attendance.status !== "FALTA_INJUSTIFICADA") {
      return {
        success: false,
        error: "Solo se pueden justificar faltas injustificadas",
      };
    }

    // Actualizar registro
    const updated = await prisma.attendance.update({
      where: { id: attendanceId },
      data: {
        status: "FALTA_JUSTIFICADA",
        justification,
        justifiedBy,
      },
    });

    // Recalcular estado del estudiante
    await updateStudentStatusByEnrollment(attendance.enrollmentId);

    revalidatePath("/dashboard/asistencia");
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.ATTENDANCE,
      entityId: updated.id,
      oldValue: {
        status: attendance.status,
        justification: attendance.justification,
        justifiedBy: attendance.justifiedBy,
      },
      newValue: {
        status: updated.status,
        justification: updated.justification,
        justifiedBy: updated.justifiedBy,
      },
      metadata: {
        module: "attendance",
        operation: "justify_absence",
        enrollmentId: attendance.enrollmentId,
      },
    });

    return {
      success: true,
      data: {
        ...updated,
        date: updated.date.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error en justifyAbsence:", error);
    return { success: false, error: "Error al justificar falta" };
  }
}

/**
 * Obtener estadísticas de asistencia de un alumno
 * Retorna: total de días, presentes, tardanzas, faltas justificadas, faltas injustificadas, porcentaje
 */
export async function getAttendanceStats(enrollmentId: string) {
  try {
    await requireAuth();

    if (!enrollmentId || enrollmentId.trim().length === 0) {
      return { success: false, error: "ID de matrícula inválido" };
    }

    // Verificar que la matrícula existe
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { academicYear: true },
    });

    if (!enrollment || !enrollment.active) {
      return { success: false, error: "Matrícula no encontrada o inactiva" };
    }

    // Obtener todos los registros de asistencia
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollmentId,
        date: {
          gte: enrollment.academicYear.startDate,
          lte: enrollment.academicYear.endDate,
        },
      },
    });

    // Obtener días festivos en el año académico
    const holidays = await prisma.calendarEvent.findMany({
      where: {
        academicYearId: enrollment.academicYearId,
        type: "FERIADO",
      },
    });

    const holidayDates = holidays.map(
      (h) => h.date.toISOString().split("T")[0],
    );

    // Filtrar asistencias que no sean en días festivos
    const validAttendances = attendances.filter((a) => {
      const dateStr = a.date.toISOString().split("T")[0];
      return !holidayDates.includes(dateStr);
    });

    // Contar estados
    const presente = validAttendances.filter(
      (a) => a.status === "PRESENTE",
    ).length;
    const tardanza = validAttendances.filter(
      (a) => a.status === "TARDANZA",
    ).length;
    const justificada = validAttendances.filter(
      (a) => a.status === "FALTA_JUSTIFICADA",
    ).length;
    const injustificada = validAttendances.filter(
      (a) => a.status === "FALTA_INJUSTIFICADA",
    ).length;

    const totalDays = validAttendances.length;
    const percentage = totalDays > 0 ? (presente / totalDays) * 100 : 0;

    return {
      success: true,
      data: {
        totalDays,
        presente,
        tardanza,
        justificada,
        injustificada,
        percentage: Math.round(percentage * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Error en getAttendanceStats:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas de asistencia",
    };
  }
}

/**
 * Obtener alumnos con asistencia crítica (>20% faltas injustificadas)
 * Opcional: filtrar por sección
 */
export async function getCriticalAttendance(input?: unknown) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    let parsedData: { sectionId?: string } = {};

    if (input) {
      const parsed = CriticalAttendanceFilterSchema.safeParse(input);
      if (!parsed.success) {
        return { success: false, error: parsed.error };
      }
      parsedData = parsed.data;
    }

    const { sectionId } = parsedData;

    // Obtener matrículas activas — solo los campos que necesitamos
    const enrollments = await prisma.enrollment.findMany({
      where: { active: true, ...(sectionId ? { sectionId } : {}) },
      select: {
        id: true,
        academicYearId: true,
        student: { select: { firstName: true, lastName: true, dni: true } },
        section: {
          select: { name: true, gradeLevel: { select: { name: true } } },
        },
      },
    });

    if (enrollments.length === 0) {
      return { success: true, data: { count: 0, students: [] } };
    }

    // ── ANTES: 2 queries por alumno dentro de un for loop = N+1 ──────────
    // ── DESPUÉS: 2 queries totales, independientemente del nº de alumnos ─

    const enrollmentIds = enrollments.map((e) => e.id);
    // Obtener todos los años académicos únicos para traer los feriados de una vez
    const uniqueYearIds = Array.from(new Set(enrollments.map((e) => e.academicYearId)));

    // 1 sola query para todas las asistencias de todos los alumnos
    // 1 sola query para todos los días festivos de los años involucrados
    const [allAttendances, allHolidays] = await Promise.all([
      prisma.attendance.findMany({
        where: { enrollmentId: { in: enrollmentIds } },
        select: { enrollmentId: true, date: true, status: true },
      }),
      prisma.calendarEvent.findMany({
        where: {
          academicYearId: { in: uniqueYearIds },
          type: "FERIADO",
        },
        select: { academicYearId: true, date: true },
      }),
    ]);

    // Construir un Set de fechas festivas por año académico para O(1) lookup
    const holidaysByYear = new Map<string, Set<string>>();
    for (const h of allHolidays) {
      if (!holidaysByYear.has(h.academicYearId)) {
        holidaysByYear.set(h.academicYearId, new Set());
      }
      holidaysByYear
        .get(h.academicYearId)!
        .add(h.date.toISOString().split("T")[0]);
    }

    // Agrupar asistencias por enrollmentId en memoria
    const attendanceByEnrollment = new Map<string, typeof allAttendances>();
    for (const a of allAttendances) {
      if (!attendanceByEnrollment.has(a.enrollmentId)) {
        attendanceByEnrollment.set(a.enrollmentId, []);
      }
      attendanceByEnrollment.get(a.enrollmentId)!.push(a);
    }

    // Calcular porcentaje de faltas injustificadas en memoria (sin más queries)
    const criticalStudents = [];

    for (const enrollment of enrollments) {
      const yearHolidays =
        holidaysByYear.get(enrollment.academicYearId) ?? new Set<string>();
      const attendances = attendanceByEnrollment.get(enrollment.id) ?? [];

      const validAttendances = attendances.filter(
        (a) => !yearHolidays.has(a.date.toISOString().split("T")[0]),
      );

      const totalDays = validAttendances.length;
      if (totalDays === 0) continue;

      const injustificada = validAttendances.filter(
        (a) => a.status === "FALTA_INJUSTIFICADA",
      ).length;
      const injustificadaPercent = (injustificada / totalDays) * 100;

      if (injustificadaPercent > RISK_ABSENCE_PERCENT) {
        criticalStudents.push({
          enrollmentId: enrollment.id,
          studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
          studentDni: enrollment.student.dni,
          section: enrollment.section.name,
          level: enrollment.section.gradeLevel.name,
          unjustifiedAbsences: injustificada,
          totalDays,
          percentage: Math.round(injustificadaPercent * 100) / 100,
        });
      }
    }

    return {
      success: true,
      data: {
        count: criticalStudents.length,
        students: criticalStudents.sort((a, b) => b.percentage - a.percentage),
      },
    };
  } catch (error) {
    console.error("Error en getCriticalAttendance:", error);
    return { success: false, error: "Error al obtener asistencia crítica" };
  }
}

/**
 * Obtener reporte completo de asistencia de una sección para un mes específico
 * Retorna planilla con todos los alumnos y días del mes
 */
export async function getSectionAttendanceReport(input: unknown) {
  try {
    await requireRole(ROLE_GROUPS.ACADEMIC);

    const parsed = SectionAttendanceReportSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false, error: parsed.error };
    }

    const { sectionId, month, year } = parsed.data;

    // Validar sectionId
    if (!sectionId || sectionId.trim().length === 0) {
      return { success: false, error: "ID de sección inválido" };
    }

    // Obtener sección con contexto
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        gradeLevel: true,
        academicYear: true,
        enrollments: {
          where: { active: true },
          include: { student: true },
        },
      },
    });

    if (!section) {
      return { success: false, error: "Sección no encontrada" };
    }

    // Definir rango de fechas del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Obtener todos los registros de asistencia del mes
    const attendances = await prisma.attendance.findMany({
      where: {
        enrollmentId: { in: section.enrollments.map((e) => e.id) },
        date: { gte: startDate, lte: endDate },
      },
    });

    // Obtener días festivos en el mes
    const holidays = await prisma.calendarEvent.findMany({
      where: {
        academicYearId: section.academicYearId,
        type: "FERIADO",
        date: { gte: startDate, lte: endDate },
      },
    });

    const holidayDates = holidays.map(
      (h) => h.date.toISOString().split("T")[0],
    );

    // Generar lista de todos los días del mes (excluyendo festivos)
    const allDays: Date[] = [];
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = date.toISOString().split("T")[0];
      if (!holidayDates.includes(dateStr)) {
        allDays.push(date);
      }
    }

    // Construir planilla por alumno
    const planilla = section.enrollments.map((enrollment) => {
      const studentAttendances = attendances.filter(
        (a) => a.enrollmentId === enrollment.id,
      );

      const dayStatuses = allDays.map((date) => {
        const dateStr = date.toISOString().split("T")[0];
        const attendance = studentAttendances.find((a) => {
          const aDateStr = a.date.toISOString().split("T")[0];
          return aDateStr === dateStr;
        });

        return {
          date: dateStr,
          status: attendance?.status || "NO_REGISTRADO",
          attendanceDate: attendance ? attendance.date.toISOString() : null,
        };
      });

      // Calcular resumen
      const presente = dayStatuses.filter(
        (d) => d.status === "PRESENTE",
      ).length;
      const tardanza = dayStatuses.filter(
        (d) => d.status === "TARDANZA",
      ).length;
      const justificada = dayStatuses.filter(
        (d) => d.status === "FALTA_JUSTIFICADA",
      ).length;
      const injustificada = dayStatuses.filter(
        (d) => d.status === "FALTA_INJUSTIFICADA",
      ).length;

      return {
        enrollmentId: enrollment.id,
        studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
        studentDni: enrollment.student.dni,
        dayRecords: dayStatuses,
        summary: {
          presente,
          tardanza,
          justificada,
          injustificada,
          total: dayStatuses.length,
        },
      };
    });

    return {
      success: true,
      data: {
        section: section.name,
        level: section.gradeLevel.name,
        period: `${month}/${year}`,
        totalDays: allDays.length,
        totalHolidays: holidays.length,
        planilla,
      },
    };
  } catch (error) {
    console.error("Error en getSectionAttendanceReport:", error);
    return { success: false, error: "Error al generar reporte de asistencia" };
  }
}

async function updateStudentStatusByEnrollment(enrollmentId: string) {
  try {
    if (!enrollmentId || enrollmentId.trim().length === 0) {
      return;
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { student: true, academicYear: true },
    });

    if (!enrollment) return;

    const classStartDate = new Date(enrollment.academicYear.year, 2, 1);

    const attendances = await prisma.attendance.findMany({
      where: {
        enrollmentId,
        date: {
          gte: classStartDate,
          lte: enrollment.academicYear.endDate,
        },
      },
    });

    const holidays = await prisma.calendarEvent.findMany({
      where: {
        academicYearId: enrollment.academicYearId,
        type: "FERIADO",
      },
    });

    const holidayDates = holidays.map(
      (h) => h.date.toISOString().split("T")[0],
    );

    const validAttendances = attendances.filter((a) => {
      const dateStr = a.date.toISOString().split("T")[0];
      return !holidayDates.includes(dateStr);
    });

    const presente = validAttendances.filter(
      (a) => a.status === "PRESENTE",
    ).length;

    const totalDays = validAttendances.length;

    if (totalDays < 10) {
      return;
    }

    const attendancePercent = (presente / totalDays) * 100;
    const grades = await prisma.gradeRecord.findMany({
      where: { enrollmentId },
    });

    const failingCourses = grades.filter(
      (g) => g.score !== null && g.score < 11,
    ).length;

    const totalCourses = grades.length;

    const average =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length
        : 20;

    const newStatus = calculateStudentStatus(
      attendancePercent,
      failingCourses,
      totalCourses,
      average,
    );

    if (newStatus !== enrollment.student.status) {
      await prisma.student.update({
        where: { id: enrollment.student.id },
        data: { status: newStatus },
      });
    }
  } catch (error) {
    console.error("Error en updateStudentStatusByEnrollment:", error);
  }
}
