"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  getAttendanceBySection,
  saveAttendance,
} from "@/lib/actions/attendance.actions";
import { toast } from "sonner";
import { AttendanceStatus } from "@prisma/client";
import {
  Save,
  Loader2,
  AlertCircle,
  Check,
  Clock,
  X,
  BadgeInfo,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface StudentAttendanceInput {
  enrollmentId: string;
  studentName: string;
  studentDni: string;
  status: AttendanceStatus | null;
  justification?: string;
}

export function AttendanceClient({
  initialStructure,
}: {
  initialStructure: any;
}) {
  const [selectedLevelIndex, setSelectedLevelIndex] = useState<number | null>(
    null,
  );
  const [selectedGradeIndex, setSelectedGradeIndex] = useState<number | null>(
    null,
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const [students, setStudents] = useState<StudentAttendanceInput[]>([]);
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

    // Parse the local date string safely to send to backend
    // Format is YYYY-MM-DD from the input date
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
            justification: item.attendance
              ? item.attendance.justification
              : undefined,
          })),
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

  const setAllStatus = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleStatusChange = (
    enrollmentId: string,
    status: AttendanceStatus,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.enrollmentId === enrollmentId ? { ...s, status } : s)),
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
        `Faltan ${students.length - recordsToSave.length} alumnos por marcar. ¿Desea guardar de todos modos?`,
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

  // Statistics
  const totalStudents = students.length;
  const presentCount = students.filter(
    (s) => s.status === AttendanceStatus.PRESENTE,
  ).length;
  const lateCount = students.filter(
    (s) => s.status === AttendanceStatus.TARDANZA,
  ).length;
  const absentCount = students.filter(
    (s) =>
      s.status === AttendanceStatus.FALTA_INJUSTIFICADA ||
      s.status === AttendanceStatus.FALTA_JUSTIFICADA,
  ).length;
  const unmarkedCount = students.filter((s) => s.status === null).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Filters Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-lg font-semibold flex flex-col md:flex-row md:items-center justify-between gap-4">
            Selección de Aula
            <div className="flex items-center gap-2">
              <Label className="text-slate-500 font-medium whitespace-nowrap">
                Fecha de Clase:
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedDate(e.target.value)
                }
                className="w-40 font-medium"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Attendance Grid */}
      {selectedSectionId && selectedDate && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Card className="border-slate-200 shadow-sm overflow-hidden h-full">
              <div className="h-1 w-full bg-blue-500" />
              <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Lista de Estudiantes
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Mostrando {students.length} alumnos matriculados el{" "}
                    {format(
                      new Date(selectedDate + "T12:00:00Z"),
                      "dd 'de' MMMM, yyyy",
                      { locale: es },
                    )}
                  </p>
                </div>
                {students.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setAllStatus(AttendanceStatus.PRESENTE)}
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Check className="mr-2 h-4 w-4" /> Marcar a Todos Presentes
                  </Button>
                )}
              </CardHeader>

              <CardContent className="p-0">
                {isLoadingGrid ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    No hay alumnos matriculados en esta sección.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                        <tr>
                          <th className="px-6 py-4 font-medium w-16">Nº</th>
                          <th className="px-6 py-4 font-medium">Estudiante</th>
                          <th className="px-6 py-4 font-medium text-center">
                            Estado de Asistencia
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
                              <span className="block">
                                {student.studentName}
                              </span>
                              <span className="text-xs text-slate-400 font-normal">
                                DNI: {student.studentDni}
                              </span>
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex items-center justify-center gap-2">
                                {/* Botón Presente */}
                                <Button
                                  variant={
                                    student.status === AttendanceStatus.PRESENTE
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(
                                      student.enrollmentId,
                                      AttendanceStatus.PRESENTE,
                                    )
                                  }
                                  className={cn(
                                    "w-32",
                                    student.status === AttendanceStatus.PRESENTE
                                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                      : "text-slate-500 hover:border-emerald-300 hover:text-emerald-700 bg-white",
                                  )}
                                >
                                  <Check className="h-4 w-4 mr-2" /> Presente
                                </Button>

                                {/* Botón Tardanza */}
                                <Button
                                  variant={
                                    student.status === AttendanceStatus.TARDANZA
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(
                                      student.enrollmentId,
                                      AttendanceStatus.TARDANZA,
                                    )
                                  }
                                  className={cn(
                                    "w-32",
                                    student.status === AttendanceStatus.TARDANZA
                                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                                      : "text-slate-500 hover:border-amber-300 hover:text-amber-600 bg-white",
                                  )}
                                >
                                  <Clock className="h-4 w-4 mr-2" /> Tardanza
                                </Button>

                                {/* Botón Falta */}
                                <Button
                                  variant={
                                    student.status ===
                                      AttendanceStatus.FALTA_INJUSTIFICADA ||
                                    student.status ===
                                      AttendanceStatus.FALTA_JUSTIFICADA
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleStatusChange(
                                      student.enrollmentId,
                                      AttendanceStatus.FALTA_INJUSTIFICADA,
                                    )
                                  }
                                  className={cn(
                                    "w-32",
                                    student.status ===
                                      AttendanceStatus.FALTA_INJUSTIFICADA ||
                                      student.status ===
                                        AttendanceStatus.FALTA_JUSTIFICADA
                                      ? "bg-red-500 hover:bg-red-600 text-white"
                                      : "text-slate-500 hover:border-red-300 hover:text-red-600 bg-white",
                                  )}
                                >
                                  <X className="h-4 w-4 mr-2" /> Falta
                                </Button>
                              </div>
                              {(student.status ===
                                AttendanceStatus.FALTA_INJUSTIFICADA ||
                                student.status ===
                                  AttendanceStatus.FALTA_JUSTIFICADA) && (
                                <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-1">
                                  <Input
                                    placeholder={
                                      student.status ===
                                      AttendanceStatus.FALTA_INJUSTIFICADA
                                        ? "Falta sin justificación"
                                        : "Nota de falta (ej. Salud, Motivo personal...)"
                                    }
                                    value={student.justification || ""}
                                    disabled={
                                      student.status ===
                                      AttendanceStatus.FALTA_INJUSTIFICADA
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setStudents((prev) =>
                                        prev.map((s) =>
                                          s.enrollmentId ===
                                          student.enrollmentId
                                            ? { ...s, justification: val }
                                            : s,
                                        ),
                                      );
                                    }}
                                    className={cn(
                                      "text-xs h-8 border-red-100 focus-visible:ring-red-200",
                                      student.status ===
                                        AttendanceStatus.FALTA_INJUSTIFICADA
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-white",
                                    )}
                                  />
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "cursor-pointer whitespace-nowrap text-[10px]",
                                      student.status ===
                                        AttendanceStatus.FALTA_JUSTIFICADA
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-slate-50 text-slate-500 border-slate-200",
                                    )}
                                    onClick={() => {
                                      const nextStatus =
                                        student.status ===
                                        AttendanceStatus.FALTA_JUSTIFICADA
                                          ? AttendanceStatus.FALTA_INJUSTIFICADA
                                          : AttendanceStatus.FALTA_JUSTIFICADA;
                                      handleStatusChange(
                                        student.enrollmentId,
                                        nextStatus,
                                      );
                                    }}
                                  >
                                    {student.status ===
                                    AttendanceStatus.FALTA_JUSTIFICADA
                                      ? "Justificada"
                                      : "Injustificada"}
                                  </Badge>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panel Resumen Lateral */}
          <div className="xl:col-span-1">
            <Card className="sticky top-6">
              <CardHeader className="bg-slate-50/50 border-b">
                <CardTitle className="text-lg">Resumen Diario</CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Estadísticas de sección
                </p>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Métricas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                    <span className="block text-2xl font-bold text-slate-800">
                      {totalStudents}
                    </span>
                    <span className="block text-xs font-semibold text-slate-500 uppercase mt-1">
                      Total M.
                    </span>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
                    <span className="block text-2xl font-bold text-emerald-700">
                      {presentCount}
                    </span>
                    <span className="block text-xs font-semibold text-emerald-600 uppercase mt-1">
                      Presentes
                    </span>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
                    <span className="block text-2xl font-bold text-amber-700">
                      {lateCount}
                    </span>
                    <span className="block text-xs font-semibold text-amber-600 uppercase mt-1">
                      Tardanzas
                    </span>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                    <span className="block text-2xl font-bold text-red-700">
                      {absentCount}
                    </span>
                    <span className="block text-xs font-semibold text-red-600 uppercase mt-1">
                      Faltas
                    </span>
                  </div>
                </div>

                {unmarkedCount > 0 && (
                  <div className="flex items-start gap-3 p-3 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg">
                    <BadgeInfo className="h-5 w-5 shrink-0 mt-0.5" />
                    <p>
                      Falta marcar la asistencia a{" "}
                      <strong>{unmarkedCount}</strong> alumno(s).
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0 pb-6 px-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || students.length === 0 || isLoadingGrid}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-1 h-5 w-5" />
                      Guardar Asistencia Diaria
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
