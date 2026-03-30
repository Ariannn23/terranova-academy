"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentGradeInput } from "../hooks/useGradeGrid";
import { GradePeriod } from "@prisma/client";

interface GradeGridTableProps {
  students: StudentGradeInput[];
  selectedPeriod: GradePeriod | "";
  isLoadingGrid: boolean;
  isSaving: boolean;
  handleScoreChange: (enrollmentId: string, value: string) => void;
  handleSave: () => void;
}

export function GradeGridTable({
  students,
  selectedPeriod,
  isLoadingGrid,
  isSaving,
  handleScoreChange,
  handleSave,
}: GradeGridTableProps) {
  return (
    <Card className="border-emerald-100 shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-emerald-500" />
      <CardHeader className="bg-slate-50/50 border-b pb-4 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Registro de Calificaciones</CardTitle>
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
                  <th className="px-6 py-4 font-medium">Apellidos y Nombres</th>
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
                      {student.student.lastName}, {student.student.firstName}
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
  );
}
