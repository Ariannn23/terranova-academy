import { Settings, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SchoolConfig, ConfigHandlers } from "../types";

interface ConfigGeneralTabProps {
  config: SchoolConfig;
  saved: boolean;
  handlers: ConfigHandlers;
}

export function ConfigGeneralTab({
  config,
  saved,
  handlers,
}: ConfigGeneralTabProps) {
  return (
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
                onChange={(e) => handlers.handleChange(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t">
          <Button
            onClick={handlers.handleSave}
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
  );
}
