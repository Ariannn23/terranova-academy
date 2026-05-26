"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  User,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface IncidentDetailClientProps {
  incident: any;
}

export function IncidentDetailClient({ incident }: IncidentDetailClientProps) {
  const { enrollment, severity, date, description, action, createdAt } =
    incident;
  const { student, section } = enrollment;

  // Mapeo de estilos según Sprint F-07
  const getSeverityStyles = (sev: string) => {
    switch (sev) {
      case "GRAVE":
        return "bg-red-100 text-red-700 border-red-200";
      case "MODERADO":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default: // LEVE
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
    }
  };

  useEffect(() => {
    toast.dismiss("view-incident");
    toast.dismiss("view-profile");
    toast.dismiss();
  }, []);
  const handlePrint = () => {
    window.open(`/api/pdf?type=incident&id=${incident.id}`, "_blank");
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-end no-print">
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="h-4 w-4" /> Imprimir Reporte
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {/* Usamos className="border-b" en lugar de la prop borderBottom para evitar el error de TS */}
        <CardHeader className="bg-slate-50/50 border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg border ${getSeverityStyles(severity)}`}
              >
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-800">
                  Detalle de Incidencia
                </CardTitle>
                <p className="text-sm text-slate-500">
                  Registrado el{" "}
                  {format(new Date(createdAt), "PPP", { locale: es })}
                </p>
              </div>
            </div>
            <Badge
              className={`px-4 py-1 text-sm font-bold uppercase ${getSeverityStyles(severity)}`}
            >
              Severidad: {severity}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Sección del Estudiante */}
            <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <User className="h-3 w-3" /> Información del Estudiante
              </h3>
              <div>
                <p className="font-bold text-slate-900 text-lg">
                  {student.firstName} {student.lastName}
                </p>
                <p className="text-sm text-slate-500 font-mono">
                  DNI: {student.dni}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Sección Actual</p>
                <p className="text-sm font-medium text-slate-700">
                  {section.gradeLevel.name} - {section.name}
                </p>
              </div>
            </div>

            {/* Detalles del Evento */}
            <div className="md:col-span-2 p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Fecha del Suceso
                  </p>
                  <p className="text-slate-700 font-medium">
                    {format(new Date(date), "dd 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Estado Académico
                  </p>
                  <Badge
                    variant="outline"
                    className="text-emerald-600 bg-emerald-50 border-emerald-100"
                  >
                    {student.status}
                  </Badge>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Descripción de los hechos
                </p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 min-h-[100px]">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {description}
                  </p>
                </div>
              </div>

              {action && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Medidas Tomadas /
                    Resolución
                  </p>
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-blue-900 font-medium italic">
                      &quot;{action}&quot;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex items-start gap-3 no-print">
        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-800">
          Este registro forma parte del <strong>Libro de Incidencias</strong>{" "}
          oficial. Cualquier modificación posterior quedará registrada en el
          historial de auditoría del sistema.
        </p>
      </div>
    </div>
  );
}
