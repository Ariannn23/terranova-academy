"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Settings,
  Building2,
  CalendarDays,
  BookMarked,
  Save,
  CheckCircle2,
  Users,
  Layers,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const LS_KEY = "terranova_config";

interface SchoolConfig {
  nombre: string;
  director: string;
  direccion: string;
  telefono: string;
  correo: string;
  ugel: string;
  notaMinima: string;
  maxFaltas: string;
}

const DEFAULTS: SchoolConfig = {
  nombre: "TerraNova Academy",
  director: "",
  direccion: "",
  telefono: "",
  correo: "",
  ugel: "",
  notaMinima: "11",
  maxFaltas: "30",
};

function loadConfig(): SchoolConfig {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function ConfiguracionClient({
  activeYear,
}: {
  activeYear: any | null;
}) {
  const [config, setConfig] = useState<SchoolConfig>(DEFAULTS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const handleChange = (field: keyof SchoolConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(LS_KEY, JSON.stringify(config));
    setSaved(true);
    toast.success("Configuración guardada correctamente.");
  };

  const sections = activeYear?.sections ?? [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Configuración del Sistema"
        description="Gestiona los datos del colegio, el año lectivo activo y las reglas académicas."
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="general" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            Datos del Colegio
          </TabsTrigger>
          <TabsTrigger value="year" className="gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            Año Lectivo
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-1.5">
            <BookMarked className="w-3.5 h-3.5" />
            Reglas Académicas
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Datos del Colegio ─────────────────────────────────────── */}
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="w-4 h-4 text-emerald-600" />
                Información Institucional
              </CardTitle>
              <p className="text-xs text-slate-500 -mt-1">
                Estos datos aparecen en los documentos PDF generados por el
                sistema.
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {[
                  {
                    key: "nombre" as const,
                    label: "Nombre del Colegio",
                    placeholder: "TerraNova Academy",
                  },
                  {
                    key: "director" as const,
                    label: "Director(a)",
                    placeholder: "Nombre completo",
                  },
                  {
                    key: "direccion" as const,
                    label: "Dirección",
                    placeholder: "Av. Principal 123, Lima",
                  },
                  {
                    key: "telefono" as const,
                    label: "Teléfono",
                    placeholder: "(01) 555-0000",
                  },
                  {
                    key: "correo" as const,
                    label: "Correo Institucional",
                    placeholder: "colegio@example.com",
                  },
                  {
                    key: "ugel" as const,
                    label: "UGEL",
                    placeholder: "UGEL 01 - San Juan de Miraflores",
                  },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <Input
                      value={config[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
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
        </TabsContent>

        {/* ── Tab: Año Lectivo ──────────────────────────────────────────────── */}
        <TabsContent value="year" className="mt-4 space-y-4">
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
                      {sections.map((s: any) => (
                        <div
                          key={s.id}
                          className="text-sm p-3 rounded-lg border border-slate-100 bg-slate-50"
                        >
                          <p className="font-medium text-slate-800">
                            {s.gradeLevel?.name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            Sección "{s.name}"
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
                  <a href="/dashboard/matriculas">Ir a Matrículas</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Tab: Reglas Académicas ──────────────────────────────────────── */}
        <TabsContent value="rules" className="mt-4">
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
                      onChange={(e) =>
                        handleChange("notaMinima", e.target.value)
                      }
                      className="w-24"
                    />
                    <span className="text-sm text-slate-500">/ 20 puntos</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    El estudiante aprueba el curso si su promedio ≥ a este
                    valor.
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
                      onChange={(e) =>
                        handleChange("maxFaltas", e.target.value)
                      }
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
                      condicion:
                        "Sin alertas. Rendimiento y asistencia normales.",
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
                  onClick={handleSave}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
