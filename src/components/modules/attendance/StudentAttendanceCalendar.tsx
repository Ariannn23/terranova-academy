"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AttendanceStatus } from "@prisma/client";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { cn } from "@/lib/utils";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";

interface StudentAttendanceCalendarProps {
  enrollment: any;
  stats: any;
  history: any[];
}

export function StudentAttendanceCalendar({
  enrollment,
  stats,
  history,
}: StudentAttendanceCalendarProps) {
  const router = useRouter();
  const { student, section, academicYear } = enrollment;
  const [currentDate, setCurrentDate] = useState(new Date());

  const recordsMap = new Map(
    history.map((record) => {
      // Usamos el string del date formateado sin tiempo para la clave
      const dateKey = record.date.split("T")[0];
      return [dateKey, record];
    }),
  );

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startingDayIndex = getDay(monthStart); // 0 = Sunday, 1 = Monday...
  const startOffset = startingDayIndex === 0 ? 6 : startingDayIndex - 1; // Ajustar a Lunes como primer día

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const previousMonthDays = Array.from({ length: startOffset }).map(
    (_, i) => "empty-" + i,
  );

  const getDayStatus = (date: Date) => {
    // Normalizar la fecha a la zona local para hacer match con el string ISO devuelto por la API
    // (Asegurándonos de usar el componente 'YYYY-MM-DD' correctamente)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const isoString = `${year}-${month}-${day}`;

    return recordsMap.get(isoString);
  };

  const getStatusColor = (status: AttendanceStatus | undefined) => {
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
  };

  const getStatusLabel = (status: AttendanceStatus | undefined) => {
    switch (status) {
      case AttendanceStatus.PRESENTE:
        return "Presente";
      case AttendanceStatus.TARDANZA:
        return "Tardanza";
      case AttendanceStatus.FALTA_JUSTIFICADA:
        return "Falta (Justificada)";
      case AttendanceStatus.FALTA_INJUSTIFICADA:
        return "Falta";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Asistencia"
        description="Resumen y detalles de puntualidad del estudiante."
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        }
      />

      {/* Header Estudiante */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <StudentAvatar
              name={`${student.firstName} ${student.lastName}`}
              imageUrl={student.photoUrl}
              size="lg"
            />
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600">
                {student.code && (
                  <>
                    <span>
                      <strong>Cód:</strong>{" "}
                      <span className="text-emerald-700 font-medium">
                        {student.code}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  </>
                )}
                <span>
                  <strong>DNI:</strong> {student.dni}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-medium">
                  {section.gradeLevel.name} "{section.name}"
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estadísticas Globales */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                Resumen del Año
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {stats ? (
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b border-slate-100">
                    <span className="block text-sm text-slate-500 font-medium uppercase tracking-wider mb-2">
                      Porcentaje de Asistencia
                    </span>
                    <div className="text-5xl font-black text-blue-700">
                      {stats.percentage}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 font-medium">
                        Clases Totales
                      </span>
                      <span className="font-bold text-slate-900 text-lg">
                        {stats.totalDays}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
                      <CheckCircle2 className="w-6 h-6 mb-2 text-emerald-600" />
                      <span className="text-2xl font-bold">
                        {stats.present}
                      </span>
                      <span className="text-xs uppercase font-semibold">
                        Presente
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-lg text-amber-700 border border-amber-100">
                      <Clock className="w-6 h-6 mb-2 text-amber-500" />
                      <span className="text-2xl font-bold">{stats.late}</span>
                      <span className="text-xs uppercase font-semibold">
                        Tardanza
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg text-red-700 border border-red-100">
                      <XCircle className="w-6 h-6 mb-2 text-red-500" />
                      <span className="text-2xl font-bold">
                        {stats.unjustifiedAbsences}
                      </span>
                      <span className="text-xs uppercase font-semibold text-center">
                        Injustificada
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg text-blue-700 border border-blue-100">
                      <FileText className="w-6 h-6 mb-2 text-blue-500" />
                      <span className="text-2xl font-bold">
                        {stats.justifiedAbsences}
                      </span>
                      <span className="text-xs uppercase font-semibold text-center">
                        Justificada
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-10">
                  <p>No hay datos estadísticos disponibles.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendario Interactivo */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="border-b shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
              <div>
                <CardTitle className="text-lg text-slate-800">
                  Calendario Mensual
                </CardTitle>
                <CardDescription>
                  Consulta el detalle por día de clase
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 bg-slate-100 rounded-full p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMonth}
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
                  onClick={nextMonth}
                  className="rounded-full hover:bg-white text-slate-600"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-2 text-center mb-4">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-xs font-bold text-slate-400 uppercase tracking-wider py-2"
                    >
                      {day}
                    </div>
                  ),
                )}
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
                          isCurrentDay
                            ? "bg-blue-600 text-white"
                            : "text-inherit",
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

                      {/* Tooltip on hover if missing or just for detail */}
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
        </div>
      </div>
    </div>
  );
}
