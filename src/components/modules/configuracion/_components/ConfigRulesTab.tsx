import { BookMarked, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolConfig, ConfigHandlers } from "../types";

interface ConfigRulesTabProps {
  config: SchoolConfig;
  saved: boolean;
  handlers: ConfigHandlers;
}

export function ConfigRulesTab({
  config,
  saved,
  handlers,
}: ConfigRulesTabProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-orange-600" />
          Reglas del Sistema
        </CardTitle>
        <p className="text-xs text-slate-500 -mt-1">
          Estos valores configuran los umbrales del semáforo de estado del
          estudiante.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">
              Nota Mínima de Aprobación
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={20}
                value={config.notaMinima}
                onChange={(e) => handlers.handleChange("notaMinima", e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">/ 20 puntos</span>
            </div>
            <p className="text-xs text-slate-400">
              El estudiante aprueba el curso si su promedio ≥ a este valor.
            </p>
          </div>

          <div className="space-y-1.5">
             <label className="text-sm font-medium text-slate-700">
              % Máximo de Faltas Injustificadas
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={config.maxFaltas}
                onChange={(e) => handlers.handleChange("maxFaltas", e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-400">
              Superar este porcentaje activa el estado INHABILITADO.
            </p>
          </div>
        </div>

        {/* Tabla de semáforo */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm font-medium text-slate-700 mb-3">
            Semáforo de Estado del Estudiante
          </p>
          <div className="space-y-2 text-sm">
            {[
              {
                estado: "ACTIVO",
                color: "bg-emerald-100 text-emerald-700",
                condicion: "Sin alertas. Rendimiento y asistencia normales.",
              },
              {
                estado: "OBSERVADO",
                color: "bg-yellow-100 text-yellow-700",
                condicion: `Promedio < ${config.notaMinima} o asistencia entre 70–85%.`,
              },
              {
                estado: "EN RIESGO",
                color: "bg-orange-100 text-orange-700",
                condicion: "Jalando 3+ cursos o asistencia entre 50–70%.",
              },
              {
                estado: "INHABILITADO",
                color: "bg-red-100 text-red-700",
                condicion: `Faltas > ${config.maxFaltas}% o jalando más de la mitad de cursos.`,
              },
            ].map((r) => (
              <div
                key={r.estado}
                className="flex items-start gap-3 p-2 rounded-lg bg-white border border-slate-100"
              >
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 ${r.color}`}
                >
                  {r.estado}
                </span>
                <span className="text-slate-600">{r.condicion}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t">
          <Button
            onClick={handlers.handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Reglas
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Guardado
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
