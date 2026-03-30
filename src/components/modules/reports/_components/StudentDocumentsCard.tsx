"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, BookOpen, Printer, Search } from "lucide-react";
import { SearchStudentResult } from "@/lib/actions/payment.actions";

interface StudentDocumentsCardProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  isSearching: boolean;
  searchResults: SearchStudentResult[];
  selectedStudent: SearchStudentResult | null;
  handleSelectStudent: (s: SearchStudentResult) => void;
}

export function StudentDocumentsCard({
  searchTerm,
  setSearchTerm,
  isSearching,
  searchResults,
  selectedStudent,
  handleSelectStudent,
}: StudentDocumentsCardProps) {
  const enrollmentId = selectedStudent?.enrollments?.[0]?.id ?? "";

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
        <FileText className="w-4 h-4 text-emerald-600" />
        Documentos del Estudiante
      </h2>
      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="text-sm font-medium text-slate-600">
            Busca al alumno para generar su libreta de notas o constancia de
            matrícula
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por DNI o apellido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {isSearching && (
              <p className="text-xs text-slate-400 mt-1">Buscando...</p>
            )}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-52 overflow-y-auto">
                {searchResults.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                    onClick={() => handleSelectStudent(s)}
                  >
                    <p className="font-medium text-sm">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{s.dni}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={!enrollmentId}
              onClick={() =>
                window.open(`/api/pdf?type=grades&id=${enrollmentId}`, "_blank")
              }
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <BookOpen className="w-4 h-4" />
              Descargar Libreta de Notas
            </Button>
            <Button
              variant="outline"
              disabled={!enrollmentId}
              onClick={() =>
                window.open(
                  `/api/pdf?type=enrollment&id=${enrollmentId}`,
                  "_blank",
                )
              }
              className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              <Printer className="w-4 h-4" />
              Descargar Constancia de Matrícula
            </Button>
          </div>
          {!enrollmentId && searchTerm.length === 0 && (
            <p className="text-xs text-slate-400 italic">
              Busca un alumno para habilitar los botones.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
