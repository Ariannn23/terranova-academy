import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays, Layers, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export type ConfigActiveYear = {
  year: number | string;
  startDate: Date | string;
  endDate: Date | string;
  sections?: Array<{
    id: string;
    name: string;
    gradeLevel?: {
      name?: string;
    } | null;
  }>;
  _count?: {
    enrollments?: number;
  };
};

interface ConfigYearTabProps {
  activeYear: ConfigActiveYear | null;
}

export function ConfigYearTab({ activeYear }: ConfigYearTabProps) {
  const sections = activeYear?.sections ?? [];

  return (
    <div className="space-y-4">
      {activeYear ? (
        <>
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  Año Lectivo Activo
                </CardTitle>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  ✓ ACTIVO
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Año</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {activeYear.year}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Fecha de Inicio</p>
                  <p className="font-semibold text-slate-800">
                    {format(
                      new Date(activeYear.startDate),
                      "dd 'de' MMMM, yyyy",
                      { locale: es },
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Fecha de Fin</p>
                  <p className="font-semibold text-slate-800">
                    {format(
                      new Date(activeYear.endDate),
                      "dd 'de' MMMM, yyyy",
                      { locale: es },
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                Secciones Registradas ({sections.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {sections.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {sections.map((s) => (
                    <div
                      key={s.id}
                      className="text-sm p-3 rounded-lg border border-slate-100 bg-slate-50"
                    >
                      <p className="font-medium text-slate-800">
                        {s.gradeLevel?.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        Sección &quot;{s.name}&quot;
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No hay secciones configuradas para este año.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                Matrículas Activas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-slate-900">
                {activeYear._count?.enrollments ?? 0}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                estudiantes matriculados
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-medium">
              No hay un año lectivo activo
            </p>
            <p className="text-sm text-slate-400">
              Para activar un año lectivo, ve al módulo de Matrículas y crea
              o activa un año académico.
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/matriculas">Ir a Matrículas</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
