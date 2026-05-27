import { useState, useMemo, useCallback } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from "date-fns";
import { AttendanceStatus } from "@prisma/client";
import { AttendanceRecord, CalendarHandlers } from "../types";

export function useAttendanceCalendar(history: AttendanceRecord[]) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const recordsMap = useMemo(() => {
    return new Map(
      history.map((record) => {
        const dateKey = typeof record.date === "string" 
           ? record.date.split("T")[0]
           : record.date.toISOString().split("T")[0];
        return [dateKey, record];
      }),
    );
  }, [history]);

  const prevMonth = useCallback(() => setCurrentDate((prev) => subMonths(prev, 1)), []);
  const nextMonth = useCallback(() => setCurrentDate((prev) => addMonths(prev, 1)), []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startingDayIndex = getDay(monthStart);
  const startOffset = startingDayIndex === 0 ? 6 : startingDayIndex - 1; 

  const daysInMonth = useMemo(() => eachDayOfInterval({ start: monthStart, end: monthEnd }), [monthStart, monthEnd]);
  
  const previousMonthDays = useMemo(() => Array.from({ length: startOffset }).map(
    (_, i) => "empty-" + i,
  ), [startOffset]);

  const getDayStatus = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const isoString = `${year}-${month}-${day}`;
    return recordsMap.get(isoString);
  }, [recordsMap]);

  const handlers: CalendarHandlers = {
    prevMonth,
    nextMonth
  };

  return {
    currentDate,
    daysInMonth,
    previousMonthDays,
    getDayStatus,
    handlers,
  };
}

// Helpers puros sin estado
export function getStatusColor(status: AttendanceStatus | undefined) {
  switch (status) {
    case AttendanceStatus.PRESENTE:
      return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
    case AttendanceStatus.TARDANZA:
      return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
    case AttendanceStatus.FALTA_JUSTIFICADA:
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
    case AttendanceStatus.FALTA_INJUSTIFICADA:
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
    default:
      return "bg-white text-slate-700 border-slate-200 hover:bg-slate-50";
  }
}

export function getStatusLabel(status: AttendanceStatus | undefined) {
  switch (status) {
    case AttendanceStatus.PRESENTE: return "Presente";
    case AttendanceStatus.TARDANZA: return "Tardanza";
    case AttendanceStatus.FALTA_JUSTIFICADA: return "Falta (Justificada)";
    case AttendanceStatus.FALTA_INJUSTIFICADA: return "Falta";
    default: return "";
  }
}
