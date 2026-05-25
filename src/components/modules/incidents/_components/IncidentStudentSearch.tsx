"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { SearchStudentResult } from "@/lib/actions/payment.actions";

interface IncidentStudentSearchProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  searchResults: SearchStudentResult[];
  isSearching: boolean;
  selectedStudent: SearchStudentResult | null;
  activeEnrollment: any | null;
  handleSelectStudent: (student: SearchStudentResult) => void;
  removeSelectedStudent: () => void;
}

export function IncidentStudentSearch({
  searchTerm,
  setSearchTerm,
  searchResults,
  isSearching,
  selectedStudent,
  activeEnrollment,
  handleSelectStudent,
  removeSelectedStudent,
}: IncidentStudentSearchProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          1. Alumno Involucrado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="DNI o Apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            disabled={selectedStudent !== null}
          />

          {/* Dropdown de Resultados */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.map((student) => (
                <div
                  key={student.id}
                  className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                  onClick={() => handleSelectStudent(student)}
                >
                  <div className="font-medium text-sm text-slate-800">
                    {student.firstName} {student.lastName}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {student.dni}
                  </div>
                </div>
              ))}
            </div>
          )}
          {isSearching && (
            <div className="text-xs text-slate-500 mt-2 text-center flex items-center justify-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
              Buscando...
            </div>
          )}
        </div>

        {/* Alumno Seleccionado UI */}
        {selectedStudent && (
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg relative overflow-hidden">
            <div className="flex gap-3 items-start relative z-10">
              <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0">
                {selectedStudent.firstName[0]}
                {selectedStudent.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate text-sm">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
                <p className="text-xs text-slate-500 font-mono mb-1">
                  DNI: {selectedStudent.dni}
                </p>
                {activeEnrollment ? (
                  <Badge
                    variant="secondary"
                    className="bg-white border-orange-200 text-orange-700 text-[10px]"
                  >
                    {activeEnrollment.section.gradeLevel.name} "
                    {activeEnrollment.section.name}"
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-[10px]">
                    Sin Matrícula Activa
                  </Badge>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={removeSelectedStudent}
              className="absolute top-2 right-2 text-orange-600/50 hover:text-orange-700 hover:bg-orange-100 p-1.5 rounded-full transition-all z-20"
              aria-label="Remover alumno"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
