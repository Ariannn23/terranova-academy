import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EnrollmentData } from "../types";

export function AcademicCycleCard({ enrollment }: { enrollment: EnrollmentData }) {
  const { academicYear } = enrollment;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          Ciclo Académico {academicYear.year}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <span className="text-sm text-slate-500">Fecha de Inicio</span>
          <span className="font-medium text-slate-900">
            {format(
              new Date(academicYear.startDate),
              "dd 'de' MMMM, yyyy",
              { locale: es },
            )}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-50">
          <span className="text-sm text-slate-500">Fecha de Fin</span>
          <span className="font-medium text-slate-900">
            {format(new Date(academicYear.endDate), "dd 'de' MMMM, yyyy", {
              locale: es,
            })}
          </span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-500">Alta de Matrícula</span>
          <span className="font-medium text-slate-900">
            {format(new Date(enrollment.enrollDate), "dd/MM/yyyy", {
              locale: es,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
