import { useCallback, useState, useEffect, useTransition } from "react";
import { getCoursesByGradeLevel } from "@/lib/actions/academic.actions";
import { getGradesBySection, saveGrades } from "@/lib/actions/grade.actions";
import { toast } from "sonner";
import { GradePeriod } from "@prisma/client";

export interface StudentGradeInput {
  enrollmentId: string;
  student: { id: string; firstName: string; lastName: string; dni: string };
  score: number | null;
}

type GradeCourse = { id: string; name: string };
type GradeSection = { id: string };
type GradeLevelItem = {
  id?: string;
  courses?: GradeCourse[];
  sections?: GradeSection[];
};
type GradeLevelGroup = { grades?: GradeLevelItem[] };
type GradeStructure = { levels?: GradeLevelGroup[] };

export function useGradeGrid(initialStructure: GradeStructure) {
  const [isPending, startTransition] = useTransition();

  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(null);
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<GradePeriod | "">("");

  const [courses, setCourses] = useState<GradeCourse[]>([]);
  const [students, setStudents] = useState<StudentGradeInput[]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const levels = initialStructure.levels || [];
  const currentLevel = selectedLevelIndex !== null ? levels[selectedLevelIndex] : null;
  const grades = currentLevel?.grades || [];
  const currentGrade = selectedGradeIndex !== null ? grades[selectedGradeIndex] : null;
  const sections = currentGrade?.sections || [];

  useEffect(() => {
    setSelectedGradeIndex(null);
    setSelectedSectionId("");
    setSelectedCourseId("");
    setCourses([]);
    setStudents([]);
  }, [selectedLevelIndex]);

  const loadCourses = useCallback((gradeId: string) => {
    startTransition(async () => {
      const result = await getCoursesByGradeLevel(gradeId);
      if (result.success) {
        setCourses((result.data ?? []) as GradeCourse[]);
      }
    });
  }, []);

  const loadGrid = useCallback(async () => {
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
    } catch {
      toast.error("Error al cargar la grilla de alumnos");
    } finally {
      setIsLoadingGrid(false);
    }
  }, [selectedCourseId, selectedPeriod, selectedSectionId]);

  useEffect(() => {
    setSelectedSectionId("");
    setSelectedCourseId("");
    setCourses([]);
    setStudents([]);
    if (currentGrade?.id) {
      loadCourses(currentGrade.id);
    }
  }, [currentGrade?.id, loadCourses, selectedGradeIndex]);

  useEffect(() => {
    setStudents([]);
    if (selectedSectionId && selectedCourseId && selectedPeriod) {
      loadGrid();
    }
  }, [loadGrid, selectedCourseId, selectedPeriod, selectedSectionId]);

  const handleScoreChange = (enrollmentId: string, value: string) => {
    const numValue = value === "" ? null : Number(value);
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
    } catch {
      toast.error("Ocurrió un error inesperado", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
}
