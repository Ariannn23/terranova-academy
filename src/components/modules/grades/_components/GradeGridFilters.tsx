"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradePeriod } from "@prisma/client";

interface GradeGridFiltersProps {
  initialStructure: any;
  isPending: boolean;
  levels: any[];
  currentLevel: any;
  grades: any[];
  currentGrade: any;
  sections: any[];
  courses: any[];
  
  selectedLevelIndex: number | null;
  setSelectedLevelIndex: (val: number | null) => void;
  
  selectedGradeIndex: number | null;
  setSelectedGradeIndex: (val: number | null) => void;
  
  selectedSectionId: string;
  setSelectedSectionId: (val: string) => void;
  
  selectedCourseId: string;
  setSelectedCourseId: (val: string) => void;
  
  selectedPeriod: GradePeriod | "";
  setSelectedPeriod: (val: GradePeriod | "") => void;
}

export function GradeGridFilters({
  initialStructure,
  isPending,
  levels,
  currentLevel,
  grades,
  currentGrade,
  sections,
  courses,
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
}: GradeGridFiltersProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          Filtros de Búsqueda
          {initialStructure.year && (
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Año Lectivo {initialStructure.year}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Nivel</Label>
            <Select
              value={
                selectedLevelIndex !== null ? selectedLevelIndex.toString() : ""
              }
              onValueChange={(val) => setSelectedLevelIndex(Number(val))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Nivel" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level: any, i: number) => (
                  <SelectItem key={i} value={i.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Grado</Label>
            <Select
              value={
                selectedGradeIndex !== null ? selectedGradeIndex.toString() : ""
              }
              onValueChange={(val) => setSelectedGradeIndex(Number(val))}
              disabled={!currentLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Grado" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade: any, i: number) => (
                  <SelectItem key={grade.id} value={i.toString()}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Sección</Label>
            <Select
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              disabled={!currentGrade || sections.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione Sección" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((sec: any) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {sec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Curso</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={!selectedSectionId || Object.keys(courses).length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={isPending ? "Cargando..." : "Seleccione Curso"}
                />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Periodo de Evaluación</Label>
            <Select
              value={selectedPeriod}
              onValueChange={(val) => setSelectedPeriod(val as GradePeriod)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">1er Bimestre</SelectItem>
                <SelectItem value="P2">2do Bimestre</SelectItem>
                <SelectItem value="P3">3er Bimestre</SelectItem>
                <SelectItem value="P4">4to Bimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
