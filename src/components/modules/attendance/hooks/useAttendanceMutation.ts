import { useState } from "react";
import { saveAttendance } from "@/lib/actions/attendance.actions";
import { toast } from "sonner";
import { AttendanceStatus } from "@prisma/client";
import { StudentAttendanceInput } from "@/lib/validations/attendance.schema";

export function useAttendanceMutation(
  students: StudentAttendanceInput[],
  setStudents: React.Dispatch<React.SetStateAction<StudentAttendanceInput[]>>,
  selectedDate: string
) {
  const [isSaving, setIsSaving] = useState(false);

  const setAllStatus = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleStatusChange = (enrollmentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.enrollmentId === enrollmentId ? { ...s, status } : s))
    );
  };

  const handleSave = async () => {
    const recordsToSave = students
      .filter((s) => s.status !== null)
      .map((s) => ({
        enrollmentId: s.enrollmentId,
        date: new Date(selectedDate + "T12:00:00Z"),
        status: s.status as AttendanceStatus,
        justification: s.justification || undefined,
      }));

    if (recordsToSave.length === 0) {
      toast.info("No ha marcado asistencia para ningún alumno.");
      return;
    }

    if (recordsToSave.length < students.length) {
      const confirmSave = window.confirm(
        `Faltan ${students.length - recordsToSave.length} alumnos por marcar. ¿Desea guardar de todos modos?`
      );
      if (!confirmSave) return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Guardando asistencia...");

    try {
      const result = await saveAttendance({ records: recordsToSave });

      if (result.success) {
        toast.success("Asistencia guardada correctamente", { id: toastId });
      } else {
        toast.error("Error al guardar asistencia", { id: toastId });
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  const stats = {
    totalStudents: students.length,
    presentCount: students.filter((s) => s.status === AttendanceStatus.PRESENTE).length,
    lateCount: students.filter((s) => s.status === AttendanceStatus.TARDANZA).length,
    absentCount: students.filter(
      (s) =>
        s.status === AttendanceStatus.FALTA_INJUSTIFICADA ||
        s.status === AttendanceStatus.FALTA_JUSTIFICADA
    ).length,
    unmarkedCount: students.filter((s) => s.status === null).length,
  };

  return {
    isSaving,
    setAllStatus,
    handleStatusChange,
    handleSave,
    stats,
  };
}
