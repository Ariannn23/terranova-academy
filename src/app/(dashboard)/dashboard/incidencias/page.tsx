import { getIncidents } from "@/lib/actions/incident.actions";
import { IncidentsClient } from "@/components/modules/incidents/IncidentsClient";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Libro de Incidencias - TerraNova Academy",
  description: "Registro de incidencias disciplinarias.",
};

export default async function IncidentsPage() {
  const result = await getIncidents();

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 my-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-900 mb-2">
          Error al cargar las incidencias
        </h2>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <IncidentsClient initialData={result.data || []} />
    </div>
  );
}
