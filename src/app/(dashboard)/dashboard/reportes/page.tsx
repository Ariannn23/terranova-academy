import { Metadata } from "next";
import { getAcademicStructure } from "@/lib/actions/academic.actions";
import ReportesClient from "@/components/modules/reports/ReportesClient";

export const metadata: Metadata = {
  title: "Reportes | TerraNova Academy",
  description: "Centro de generación de reportes PDF y exportación Excel.",
};

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const structureResult = await getAcademicStructure();
  const structure =
    structureResult.success && structureResult.data
      ? structureResult.data
      : null;

  return <ReportesClient academicStructure={structure} />;
}
