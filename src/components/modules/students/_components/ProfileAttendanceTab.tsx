import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ATTENDANCE_LABELS } from "@/lib/utils/student.utils";
import type { StudentAttendanceView } from "@/types/student";

interface ProfileAttendanceTabProps {
  attendances: StudentAttendanceView[];
  attendanceStats: Record<string, number>;
}

export function ProfileAttendanceTab({
  attendances,
  attendanceStats,
}: ProfileAttendanceTabProps) {
  const sortedAttendances = [...(attendances || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Resumen de Asistencia */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ATTENDANCE_LABELS).map(([key, config]) => {
          const count = attendanceStats[key] || 0;
          return (
            <Card key={key}>
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-xs text-slate-500 font-medium uppercase mb-2">
                  {config.label}
                </p>
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${config.color} text-xl font-bold`}
                >
                  {count}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Historial Detallado */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-blue-600" />
            Historial de Inasistencias y Tardanzas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {sortedAttendances.length === 0 ? (
             <p className="text-slate-400 text-sm italic text-center py-6">
              El alumno no tiene inasistencias ni tardanzas registradas
            </p>
          ) : (
            <div className="space-y-4">
              {sortedAttendances
                .filter((a) => a.status !== "PRESENTE")
                .map((a) => {
                  const labelCfg = ATTENDANCE_LABELS[a.status];
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-slate-900 font-medium">
                            {format(new Date(a.date), "EEEE dd 'de' MMMM", {
                              locale: es,
                            })}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${labelCfg.color} border-0`}
                          >
                            {labelCfg.label}
                          </Badge>
                        </div>
                        {a.justification && (
                          <p className="text-sm text-slate-600 mt-2 flex gap-2">
                            <span className="font-medium">Justificación:</span>{" "}
                            {a.justification}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              {sortedAttendances.filter((a) => a.status !== "PRESENTE")
                .length === 0 && (
                <p className="text-slate-500 text-sm text-center italic py-4">
                  Excelente asistencia. Solo existen registros de &quot;Presente&quot;.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
