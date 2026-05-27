import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type {
  StudentDisabilityView,
  StudentIncidentView,
} from "@/types/student";

interface ProfileIncidentsTabProps {
  disqualifications: StudentDisabilityView[];
  incidents: StudentIncidentView[];
}

export function ProfileIncidentsTab({
  disqualifications,
  incidents,
}: ProfileIncidentsTabProps) {
  return (
    <div className="space-y-6">
      {/* Inhabilitaciones */}
      <Card
        className={
          disqualifications?.length > 0 ? "border-red-200 bg-red-50/30" : ""
        }
      >
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle
            className={`text-sm font-semibold flex items-center gap-2 ${
              disqualifications?.length > 0
                ? "text-red-700"
                : "text-slate-800"
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Inhabilitaciones del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {disqualifications?.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-4">
              Alumno sin inhabilitaciones
            </p>
          ) : (
            <div className="space-y-4">
              {disqualifications?.map((d) => (
                <div
                  key={d.id}
                  className="bg-white p-4 rounded-lg border border-red-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="destructive">
                      {d.reason === "PAGOS" && "🚨 Deuda Pendiente"}
                      {d.reason === "DISCIPLINA" && "🚨 Problema Disciplinario"}
                      {d.reason === "DOCUMENTACION" && "🚨 Falta de Documentos"}
                    </Badge>
                    <span className="text-xs text-slate-500 font-medium">
                      {d.createdAt ? format(new Date(d.createdAt), "dd MMM yyyy", {
                        locale: es,
                      }) : "Sin fecha"}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm">{d.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incidencias Conductuales */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            Registro de Incidencias Conductuales
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {incidents?.length === 0 ? (
            <p className="text-slate-400 text-sm italic text-center py-4">
              Historial disciplinario limpio
            </p>
          ) : (
            <div className="space-y-4">
              {incidents?.map((inc) => (
                <div
                  key={inc.id}
                  className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          inc.severity === "LEVE"
                            ? "bg-blue-100 text-blue-700"
                            : inc.severity === "GRAVE"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {inc.severity}
                      </Badge>
                      <span className="text-xs font-semibold text-slate-600">
                        {inc.type}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {inc.date ? format(new Date(inc.date), "dd MMM yyyy", {
                        locale: es,
                      }) : "Sin fecha"}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm">{inc.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
