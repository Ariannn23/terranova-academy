"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { useReports } from "./hooks/useReports";
import { StudentDocumentsCard } from "./_components/StudentDocumentsCard";
import { BatchExportGrid } from "./_components/BatchExportGrid";

interface Section {
  id: string;
  name: string;
  tutor: string;
}
interface Grade {
  id: string;
  name: string;
  order: number;
  sections: Section[];
}
interface Level {
  name: string;
  grades: Grade[];
}
interface AcademicStructure {
  id: string;
  year: number;
  levels: Level[];
}

export default function ReportesClient({
  academicStructure,
}: {
  academicStructure: AcademicStructure | null;
}) {
  const {
    selectedSectionId,
    setSelectedSectionId,
    selectedPeriod,
    setSelectedPeriod,
    financialMonth,
    setFinancialMonth,
    financialYear,
    loadingGrades,
    loadingAttendance,
    loadingFinancial,
    searchHook,
    handleSelectStudent,
    handleExportGrades,
    handleExportAttendance,
    handleExportFinancial,
  } = useReports();

  const allSections =
    academicStructure?.levels.flatMap((l) =>
      l.grades.flatMap((g) =>
        g.sections.map((s) => ({ id: s.id, name: s.name, gradeName: g.name })),
      ),
    ) ?? [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Centro de Reportes"
        description="Genera PDFs oficiales o exporta datos a Excel desde un solo lugar."
      />

      {!academicStructure && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          No hay un año lectivo activo. Configúralo en{" "}
          <a href="/dashboard/configuracion" className="underline font-medium">
            Configuración
          </a>{" "}
          para usar los reportes completos.
        </div>
      )}

      <StudentDocumentsCard
        searchTerm={searchHook.searchTerm}
        setSearchTerm={searchHook.setSearchTerm}
        isSearching={searchHook.isSearching}
        searchResults={searchHook.searchResults}
        selectedStudent={searchHook.selectedStudent}
        handleSelectStudent={handleSelectStudent}
      />

      <BatchExportGrid
        allSections={allSections}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        financialMonth={financialMonth}
        setFinancialMonth={setFinancialMonth}
        financialYear={financialYear}
        loadingGrades={loadingGrades}
        loadingAttendance={loadingAttendance}
        loadingFinancial={loadingFinancial}
        handleExportGrades={handleExportGrades}
        handleExportAttendance={handleExportAttendance}
        handleExportFinancial={handleExportFinancial}
      />
    </div>
  );
}
