"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Building2, CalendarDays, BookMarked } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useConfiguracion } from "./hooks/useConfiguracion";
import { ConfigGeneralTab } from "./_components/ConfigGeneralTab";
import { ConfigYearTab } from "./_components/ConfigYearTab";
import { ConfigRulesTab } from "./_components/ConfigRulesTab";

export default function ConfiguracionClient({
  activeYear,
}: {
  activeYear: any | null;
}) {
  const { config, saved, status, handleChange, handleSave } = useConfiguracion();

  useEffect(() => {
    if (status === "success") {
      toast.success("Configuración guardada correctamente.");
    } else if (status === "error") {
      toast.error("Error intermitente al guardar la configuración.");
    }
  }, [status, saved]);

  const handlers = { handleChange, handleSave };

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

        <TabsContent value="general" className="mt-4">
          <ConfigGeneralTab
            config={config}
            saved={saved}
            handlers={handlers}
          />
        </TabsContent>

        <TabsContent value="year" className="mt-4">
          <ConfigYearTab activeYear={activeYear} />
        </TabsContent>

        <TabsContent value="rules" className="mt-4">
          <ConfigRulesTab
            config={config}
            saved={saved}
            handlers={handlers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
