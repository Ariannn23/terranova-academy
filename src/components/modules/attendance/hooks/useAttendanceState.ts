import { useState, useEffect } from "react";
import { getAttendanceBySection } from "@/lib/actions/attendance.actions";
import { toast } from "sonner";
import { StudentAttendanceInput } from "@/lib/validations/attendance.schema";

export function useAttendanceState(initialStructure: any) {
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(null);
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [students, setStudents] = useState<StudentAttendanceInput[]>([]);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);

  const levels = initialStructure.levels || [];
  const currentLevel = selectedLevelIndex !== null ? levels[selectedLevelIndex] : null;
  const grades = currentLevel?.grades || [];
  const currentGrade = selectedGradeIndex !== null ? grades[selectedGradeIndex] : null;
  const sections = currentGrade?.sections || [];

  useEffect(() => {
    setSelectedGradeIndex(null);
    setSelectedSectionId("");
    setStudents([]);
  }, [selectedLevelIndex]);

  useEffect(() => {
    setSelectedSectionId("");
    setStudents([]);
  }, [selectedGradeIndex]);

  useEffect(() => {
    setStudents([]);
    if (selectedSectionId && selectedDate) {
      loadGrid();
    }
  }, [selectedSectionId, selectedDate]);

  const loadGrid = async () => {
    if (!selectedSectionId || !selectedDate) return;
    setIsLoadingGrid(true);

    const localDate = new Date(selectedDate + "T12:00:00Z");

    try {
      const result = await getAttendanceBySection(selectedSectionId, localDate);
      if (result.success && result.data) {
        setStudents(
          result.data.map((item: any) => ({
            enrollmentId: item.enrollmentId,
            studentName: item.studentName,
            studentDni: item.studentDni,
            status: item.attendance ? item.attendance.status : null,
            justification: item.attendance ? item.attendance.justification : undefined,
          }))
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Error al cargar la lista de alumnos");
    } finally {
      setIsLoadingGrid(false);
    }
  };

  return {
    selectedLevelIndex, setSelectedLevelIndex,
    selectedGradeIndex, setSelectedGradeIndex,
    selectedSectionId, setSelectedSectionId,
    selectedDate, setSelectedDate,
    students, setStudents,
    isLoadingGrid,
    levels, currentLevel,
    grades, currentGrade,
    sections
  };
}
