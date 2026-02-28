import { getIncidentById } from "@/lib/actions/incident.actions";
import { IncidentDetailClient } from "@/components/modules/incidents/IncidentDetailClient";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function IncidentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getIncidentById(params.id);

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">
          Incidencia no encontrada
        </h2>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/dashboard/incidencias">Volver al Libro</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-6">
        <Button variant="ghost" asChild className="text-slate-500">
          <Link href="/dashboard/incidencias">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al Libro de
            Incidencias
          </Link>
        </Button>
      </div>
      <IncidentDetailClient incident={result.data} />
    </div>
  );
}
