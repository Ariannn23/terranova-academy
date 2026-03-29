"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AttendanceStatus } from "@prisma/client";

import { useAttendanceState } from "./hooks/useAttendanceState";
import { useAttendanceMutation } from "./hooks/useAttendanceMutation";
import { AttendanceLevelFilters } from "./_components/AttendanceLevelFilters";
import { AttendanceStudentRow } from "./_components/AttendanceStudentRow";
import { AttendanceSummarySidebar } from "./_components/AttendanceSummarySidebar";

interface AttendanceClientProps {
  initialStructure: any;
}

export default function AttendanceClient({
  initialStructure,
}: AttendanceClientProps) {
  useEffect(() => {
    toast.dismiss("nav-attendance");
  }, []);

  const {
    selectedLevelIndex, setSelectedLevelIndex,
    selectedGradeIndex, setSelectedGradeIndex,
    selectedSectionId, setSelectedSectionId,
    selectedDate, setSelectedDate,
    students, setStudents,
    isLoadingGrid,
    levels, currentLevel, grades, currentGrade, sections
  } = useAttendanceState(initialStructure);

  const {
    isSaving,
    setAllStatus,
    handleStatusChange,
    handleSave,
    stats,
  } = useAttendanceMutation(students, setStudents, selectedDate);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Control de Asistencia"
        description="Registra la asistencia diaria por nivel, grado y sección."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Link>
          </Button>
        }
      />

      <AttendanceLevelFilters
        levels={levels}
        currentLevel={currentLevel}
        grades={grades}
        currentGrade={currentGrade}
        sections={sections}
        selectedLevelIndex={selectedLevelIndex}
        selectedGradeIndex={selectedGradeIndex}
        selectedSectionId={selectedSectionId}
        selectedDate={selectedDate}
        setSelectedLevelIndex={setSelectedLevelIndex}
        setSelectedGradeIndex={setSelectedGradeIndex}
        setSelectedSectionId={setSelectedSectionId}
        setSelectedDate={setSelectedDate}
      />

      {selectedSectionId && selectedDate && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
          <div className="xl:col-span-3">
            <Card className="h-full">
              <CardContent className="p-0">
                {isLoadingGrid ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p>Cargando lista de alumnos...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                    <p>No hay alumnos matriculados en esta sección.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-slate-100">
                      <h3 className="font-semibold text-slate-800">
                        Lista de Alumnos ({students.length})
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAllStatus(AttendanceStatus.PRESENTE)}
                          className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Marcar todos Presentes
                        </Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                          <tr>
                            <th className="px-6 py-4 rounded-tl-lg">N°</th>
                            <th className="px-6 py-4">Apellidos y Nombres</th>
                            <th className="px-6 py-4 text-center rounded-tr-lg">
                              Estado de Asistencia
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {students.map((student, index) => (
                            <AttendanceStudentRow
                              key={student.enrollmentId}
                              student={student}
                              index={index}
                              handleStatusChange={handleStatusChange}
                              setStudents={setStudents}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-1">
            <AttendanceSummarySidebar
              stats={stats}
              isLoadingGrid={isLoadingGrid}
              isSaving={isSaving}
              handleSave={handleSave}
            />
          </div>
        </div>
      )}
    </div>
  );
}
