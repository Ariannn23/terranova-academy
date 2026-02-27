"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCoursesByGradeLevel } from "@/lib/actions/academic.actions";
import { getGradesBySection, saveGrades } from "@/lib/actions/grade.actions";
import { toast } from "sonner";
import { GradePeriod } from "@prisma/client";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentGradeInput {
  enrollmentId: string;
  student: { id: string; firstName: string; lastName: string; dni: string };
  score: number | null;
}

export function GradeGridClient({
  initialStructure,
}: {
  initialStructure: any;
}) {
  const [isPending, startTransition] = useTransition();

  // Selected State
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(
    null,
  );
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<GradePeriod | "">("");

  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentGradeInput[]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derived state options
  const levels = initialStructure.levels || [];
  const currentLevel =
    selectedLevelIndex !== null ? levels[selectedLevelIndex] : null;
  const grades = currentLevel?.grades || [];
  const currentGrade =
    selectedGradeIndex !== null ? grades[selectedGradeIndex] : null;
  const sections = currentGrade?.sections || [];

  // Reset dependent fields when parent changes
  useEffect(() => {
    setSelectedGradeIndex(null);
    setSelectedSectionId("");
    setSelectedCourseId("");
    setCourses([]);
    setStudents([]);
  }, [selectedLevelIndex]);

  useEffect(() => {
    setSelectedSectionId("");
    setSelectedCourseId("");
    setCourses([]);
    setStudents([]);
    if (currentGrade?.id) {
      loadCourses(currentGrade.id);
    }
  }, [selectedGradeIndex, currentGrade?.id]);

  useEffect(() => {
    setStudents([]);
    if (selectedSectionId && selectedCourseId && selectedPeriod) {
      loadGrid();
    }
  }, [selectedSectionId, selectedCourseId, selectedPeriod]);

  const loadCourses = async (gradeId: string) => {
    startTransition(async () => {
      const result = await getCoursesByGradeLevel(gradeId);
      if (result.success) {
        setCourses(result.data!);
      }
    });
  };

  const loadGrid = async () => {
    if (!selectedSectionId || !selectedCourseId || !selectedPeriod) return;
    setIsLoadingGrid(true);
    try {
      const result = await getGradesBySection(
        selectedSectionId,
        selectedCourseId,
        selectedPeriod as GradePeriod,
      );
      if (result.success) {
        setStudents(result.data!);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al cargar la grilla de alumnos");
    } finally {
      setIsLoadingGrid(false);
    }
  };

  const handleScoreChange = (enrollmentId: string, value: string) => {
    const numValue = value === "" ? null : Number(value);

    // Validacion básica 0 - 20
    if (numValue !== null && (numValue < 0 || numValue > 20)) {
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.enrollmentId === enrollmentId ? { ...s, score: numValue } : s,
      ),
    );
  };

  const handleSave = async () => {
    if (!selectedCourseId || !selectedPeriod) return;

    const gradesToSave = students
      .filter((s) => s.score !== null)
      .map((s) => ({
        enrollmentId: s.enrollmentId,
        score: s.score as number,
      }));

    if (gradesToSave.length === 0) {
      toast.info("No hay notas ingresadas para guardar.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Guardando notas...");

    try {
      const result = await saveGrades({
        sectionId: selectedSectionId,
        courseId: selectedCourseId,
        period: selectedPeriod,
        grades: gradesToSave,
      });

      if (result.success) {
        toast.success("Notas guardadas exitosamente", { id: toastId });
      } else {
        console.error("Error al guardar:", result.error);
        toast.error("Error al guardar las notas. Verifica los datos.", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

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
      {/* Selector de Filtros */}
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
                  selectedLevelIndex !== null
                    ? selectedLevelIndex.toString()
                    : ""
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
                  selectedGradeIndex !== null
                    ? selectedGradeIndex.toString()
                    : ""
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
                disabled={
                  !selectedSectionId || Object.keys(courses).length === 0
                }
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

      {/* Grilla de Alumnos */}
      {selectedSectionId && selectedCourseId && selectedPeriod && (
        <Card className="border-emerald-100 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-emerald-500" />
          <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                Registro de Calificaciones
              </CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Ingrese las notas correspondientes al{" "}
                {selectedPeriod.replace("P", "")}er Bimestre. Mínimo aprobatorio
                es 11.
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving || students.length === 0 || isLoadingGrid}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Todo
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingGrid ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                No hay alumnos matriculados en esta sección.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                    <tr>
                      <th className="px-6 py-4 font-medium w-16">Nº</th>
                      <th className="px-6 py-4 font-medium">
                        Apellidos y Nombres
                      </th>
                      <th className="px-6 py-4 font-medium w-32 border-l">
                        Nota ({selectedPeriod})
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student, idx) => (
                      <tr
                        key={student.enrollmentId}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-slate-400 font-mono">
                          {(idx + 1).toString().padStart(2, "0")}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {student.student.lastName},{" "}
                          {student.student.firstName}
                        </td>
                        <td className="px-6 py-3 border-l bg-slate-50/30">
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            value={student.score ?? ""}
                            onChange={(e) =>
                              handleScoreChange(
                                student.enrollmentId,
                                e.target.value,
                              )
                            }
                            className={cn(
                              "w-20 text-center font-bold text-lg",
                              student.score !== null && student.score < 11
                                ? "text-red-600 border-red-200 focus-visible:ring-red-400 bg-red-50/50"
                                : student.score !== null && student.score >= 11
                                  ? "text-emerald-700 border-emerald-200 focus-visible:ring-emerald-400 bg-emerald-50/50"
                                  : "",
                            )}
                            placeholder="--"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
