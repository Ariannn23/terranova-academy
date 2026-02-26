"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CalendarEventSchema } from "@/lib/validations/incident.schema";
import { EventType } from "@prisma/client";

// ==========================================
// ACCIONES PARA EL CALENDARIO ACADÉMICO
// ==========================================

export async function getEventsByMonth(
  month: number,
  year: number,
  academicYearId: string,
) {
  try {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const events = await prisma.calendarEvent.findMany({
      where: {
        academicYearId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      orderBy: { date: "asc" },
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Error in getEventsByMonth:", error);
    return { success: false, error: "Error al obtener eventos del calendario" };
  }
}

export async function createCalendarEvent(data: unknown) {
  const parsed = CalendarEventSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const event = await prisma.calendarEvent.create({
      data: parsed.data,
    });

    revalidatePath("/dashboard/calendario");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error in createCalendarEvent:", error);
    return { success: false, error: "Error al crear evento_calendario" };
  }
}

export async function updateCalendarEvent(id: string, data: unknown) {
  const parsed = CalendarEventSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const event = await prisma.calendarEvent.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/dashboard/calendario");
    return { success: true, data: event };
  } catch (error: any) {
    console.error("Error in updateCalendarEvent:", error);
    return { success: false, error: "Error al actualizar evento" };
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    await prisma.calendarEvent.delete({
      where: { id },
    });

    revalidatePath("/dashboard/calendario");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteCalendarEvent:", error);
    return { success: false, error: "Error al eliminar evento" };
  }
}

// Devuelve solo las FECHAS puras de todos los feriados del año, para usarse en validaciones iterativas
export async function getHolidayDates(academicYearId: string) {
  try {
    const holidays = await prisma.calendarEvent.findMany({
      where: {
        academicYearId,
        type: EventType.FERIADO,
      },
      select: {
        date: true,
        endDate: true,
      },
    });

    const holidayDates: Date[] = [];

    for (const h of holidays) {
      if (h.endDate) {
        // Generar cada día en el rango
        let currentDate = new Date(h.date);
        currentDate.setHours(0, 0, 0, 0);
        const limitDate = new Date(h.endDate);
        limitDate.setHours(23, 59, 59, 999);

        while (currentDate <= limitDate) {
          holidayDates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        const d = new Date(h.date);
        d.setHours(0, 0, 0, 0);
        holidayDates.push(d);
      }
    }

    return { success: true, data: holidayDates };
  } catch (error) {
    console.error("Error in getHolidayDates:", error);
    return { success: false, error: "Error al mapear feriados" };
  }
}
