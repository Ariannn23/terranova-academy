import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { CalendarHandlers, AttendanceRecord } from "../types";
import { getStatusColor, getStatusLabel } from "../hooks/useAttendanceCalendar";

interface CalendarGridProps {
  currentDate: Date;
  daysInMonth: Date[];
  previousMonthDays: string[];
  getDayStatus: (date: Date) => AttendanceRecord | undefined;
  handlers: CalendarHandlers;
}

export function CalendarGrid({
  currentDate,
  daysInMonth,
  previousMonthDays,
  getDayStatus,
  handlers,
}: CalendarGridProps) {
  return (
    <Card className="h-full">
      <CardHeader className="border-b shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
        <div>
          <CardTitle className="text-lg text-slate-800">
            Calendario Mensual
          </CardTitle>
          <CardDescription>Consulta el detalle por día de clase</CardDescription>
        </div>
        <div className="flex items-center gap-4 bg-slate-100 rounded-full p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlers.prevMonth}
            className="rounded-full hover:bg-white text-slate-600"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="w-40 text-center font-bold text-slate-800 uppercase tracking-wide text-sm">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlers.nextMonth}
            className="rounded-full hover:bg-white text-slate-600"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div
              key={day}
              className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {previousMonthDays.map((empty) => (
            <div
              key={empty}
              className="p-2 h-20 bg-slate-50/50 rounded-md border border-slate-100 border-dashed"
            />
          ))}

          {daysInMonth.map((date) => {
            const record = getDayStatus(date);
            const isCurrentDay = isToday(date);

            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "relative flex flex-col p-2 h-20 md:h-24 rounded-lg border transition-all cursor-default group",
                  getStatusColor(record?.status),
                  isCurrentDay && "ring-2 ring-blue-400 ring-offset-1",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                    isCurrentDay ? "bg-blue-600 text-white" : "text-inherit",
                  )}
                >
                  {date.getDate()}
                </span>

                {record && (
                  <div className="mt-auto hidden sm:flex flex-col items-center">
                    <span className="text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded-sm w-full text-center truncate bg-white/50 mix-blend-multiply">
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                )}

                {record && (
                  <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] pointer-events-none">
                    <div className="bg-slate-800 text-white text-xs rounded shadow-lg p-2">
                      <p className="font-bold mb-1">
                        {format(date, "d 'de' MMMM", { locale: es })}
                      </p>
                      <p>{getStatusLabel(record.status)}</p>
                      {record.justification && (
                        <p className="text-slate-300 mt-1 border-t border-slate-600 pt-1">
                          Nota: {record.justification}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
