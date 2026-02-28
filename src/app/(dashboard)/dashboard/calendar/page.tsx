import { getCalendarEvents } from "@/lib/actions/calendar.actions";
import { prisma } from "@/lib/prisma";
import { CalendarClient } from "@/components/modules/calendar/CalendarClient";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Calendario Académico - TerraNova Academy",
  description: "Gestión de eventos y feriados escolares.",
};

export default async function CalendarPage() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { active: true },
  });

  if (!activeYear) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 my-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-900 mb-2">
          No hay año académico activo
        </h2>
        <p className="text-red-700">
          Configura el año académico para gestionar el calendario.
        </p>
      </div>
    );
  }

  const result = await getCalendarEvents();

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 my-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-900 mb-2">
          Error al cargar los eventos
        </h2>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <CalendarClient
        initialData={result.data || []}
        academicYearId={activeYear.id}
      />
    </div>
  );
}
