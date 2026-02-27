import { Metadata } from "next";
import { getAcademicStructure } from "@/lib/actions/academic.actions";
import { GradeGridClient } from "@/components/modules/grades/GradeGridClient";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = {
  title: "Registro de Notas | Terranova Academy",
  description: "Sistema de calificación por sección y curso.",
};

export default async function GradesPage() {
  const structureResult = await getAcademicStructure();

  // Si no hay año académico activo, enviamos un array vacío
  const structure =
    structureResult.success && structureResult.data
      ? structureResult.data
      : { id: "", year: 0, levels: [] };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title="Registro de Notas"
        description="Selecciona la sección y el curso para ingresar las calificaciones."
      />
      <div className="mt-6">
        <GradeGridClient initialStructure={structure} />
      </div>
    </div>
  );
}
