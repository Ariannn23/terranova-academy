import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceStats } from "../types";

export function CalendarStats({ stats }: { stats: AttendanceStats | null }) {
  return (
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
                <span className="text-slate-600 font-medium">Clases Totales</span>
                <span className="font-bold text-slate-900 text-lg">
                  {stats.totalDays}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 mb-2 text-emerald-600" />
                <span className="text-2xl font-bold">
                  {stats.present ?? stats.presente ?? 0}
                </span>
                <span className="text-xs uppercase font-semibold">Presente</span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-amber-50 rounded-lg text-amber-700 border border-amber-100">
                <Clock className="w-6 h-6 mb-2 text-amber-500" />
                <span className="text-2xl font-bold">
                  {stats.late ?? stats.tardanza ?? 0}
                </span>
                <span className="text-xs uppercase font-semibold">Tardanza</span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-red-50 rounded-lg text-red-700 border border-red-100">
                <XCircle className="w-6 h-6 mb-2 text-red-500" />
                <span className="text-2xl font-bold">
                  {stats.unjustifiedAbsences ?? stats.injustificada ?? 0}
                </span>
                <span className="text-xs uppercase font-semibold text-center">
                  Injustificada
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg text-blue-700 border border-blue-100">
                <FileText className="w-6 h-6 mb-2 text-blue-500" />
                <span className="text-2xl font-bold">
                  {stats.justifiedAbsences ?? stats.justificada ?? 0}
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
  );
}
