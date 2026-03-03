import { getSectionSchedule } from "@/lib/actions/schedule.actions";
import { ScheduleGrid } from "@/components/modules/schedules/ScheduleGrid";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Editar Horario - TerraNova Academy",
  description: "Gestión de horarios por sección y asignación docente.",
};

export default async function ScheduleEditPage({
  params,
}: {
  params: { seccionId: string };
}) {
  const result = await getSectionSchedule(params.seccionId);

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 my-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-900 mb-2">
          Error al cargar el horario
        </h2>
        <p className="text-red-700 mb-6">{result.error}</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  const { section, schedules, courses, teachers } = result.data;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <ScheduleGrid
        section={section}
        schedules={schedules}
        courses={courses}
        teachers={teachers}
      />
    </div>
  );
}
