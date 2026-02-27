import { Metadata } from "next";
import { getAcademicStructure } from "@/lib/actions/academic.actions";
import { AttendanceClient } from "@/components/modules/attendance/AttendanceClient";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Toma de Asistencia | Terranova Academy",
  description: "Registro de asistencia diaria por sección.",
};

export default async function AttendancePage() {
  const structureResult = await getAcademicStructure();

  const structure =
    structureResult.success && structureResult.data
      ? structureResult.data
      : { id: "", year: 0, levels: [] };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Control de Asistencia"
        description="Selecciona la sección y registra la asistencia del día."
      />
      <div className="mt-6">
        <AttendanceClient initialStructure={structure} />
      </div>
    </div>
  );
}
