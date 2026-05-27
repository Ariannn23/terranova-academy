"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useGradeGrid } from "./hooks/useGradeGrid";
import { GradeGridFilters } from "./_components/GradeGridFilters";
import { GradeGridTable } from "./_components/GradeGridTable";

export function GradeGridClient({
  initialStructure,
}: {
  initialStructure: Parameters<typeof useGradeGrid>[0];
}) {
  const {
    isPending,
    selectedLevelIndex,
    setSelectedLevelIndex,
    selectedGradeIndex,
    setSelectedGradeIndex,
    selectedSectionId,
    setSelectedSectionId,
    selectedCourseId,
    setSelectedCourseId,
    selectedPeriod,
    setSelectedPeriod,
    courses,
    students,
    isLoadingGrid,
    isSaving,
    levels,
    currentLevel,
    grades,
    currentGrade,
    sections,
    handleScoreChange,
    handleSave,
  } = useGradeGrid(initialStructure);

  if (!levels.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <AlertCircle className="h-12 w-12 mb-4 text-slate-300" />
            <p>
              No se encontró un año académico activo o estructura configurada.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <GradeGridFilters
        initialStructure={initialStructure}
        isPending={isPending}
        levels={levels}
        currentLevel={currentLevel}
        grades={grades}
        currentGrade={currentGrade}
        sections={sections}
        courses={courses}
        selectedLevelIndex={selectedLevelIndex}
        setSelectedLevelIndex={setSelectedLevelIndex}
        selectedGradeIndex={selectedGradeIndex}
        setSelectedGradeIndex={setSelectedGradeIndex}
        selectedSectionId={selectedSectionId}
        setSelectedSectionId={setSelectedSectionId}
        selectedCourseId={selectedCourseId}
        setSelectedCourseId={setSelectedCourseId}
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
      />

      {selectedSectionId && selectedCourseId && selectedPeriod && (
        <GradeGridTable
          students={students}
          selectedPeriod={selectedPeriod}
          isLoadingGrid={isLoadingGrid}
          isSaving={isSaving}
          handleScoreChange={handleScoreChange}
          handleSave={handleSave}
        />
      )}
    </div>
  );
}
