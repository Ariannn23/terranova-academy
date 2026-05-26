"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Check } from "lucide-react";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import type { EnrollmentStudentOption } from "@/types/enrollment";

interface WizardStudentStepProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredStudents: EnrollmentStudentOption[];
  selectedStudent: EnrollmentStudentOption | null;
  setSelectedStudent: (s: EnrollmentStudentOption) => void;
}

export function WizardStudentStep({
  searchTerm,
  setSearchTerm,
  filteredStudents,
  selectedStudent,
  setSelectedStudent,
}: WizardStudentStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Paso 1: Selecciona al Estudiante</CardTitle>
        <CardDescription>
          Busca un estudiante que no tenga matrícula activa.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="border rounded-md divide-y overflow-y-auto max-h-[250px]">
          {filteredStudents.length > 0 ? (
            filteredStudents.slice(0, 10).map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedStudent(s)}
                className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${selectedStudent?.id === s.id ? "bg-emerald-50 border-l-4 border-emerald-600" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <StudentAvatar
                    name={`${s.firstName} ${s.lastName}`}
                    imageUrl={s.photoUrl}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-slate-900">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-slate-500">DNI: {s.dni}</p>
                  </div>
                </div>
                {selectedStudent?.id === s.id && (
                  <Check className="h-5 w-5 text-emerald-600" />
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm">
              No se encontraron estudiantes elegibles.
            </div>
          )}
        </div>
      </CardContent>
    </>
  );
}
