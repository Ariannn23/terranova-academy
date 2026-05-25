"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

import { useStudentReportCard } from "./hooks/useStudentReportCard";
import { ReportCardHeader } from "./_components/ReportCardHeader";
import { GradesTable } from "./_components/GradesTable";
import { EnrollmentForGrades, GradeRecord } from "./types";

interface StudentReportCardProps {
  enrollment: EnrollmentForGrades | any;
  grades: GradeRecord[] | any;
}

export function StudentReportCard({
  enrollment,
  grades,
}: StudentReportCardProps) {
  const router = useRouter();
  
  // Delegación absoluta de matemática y algoritmos al custom hook
  const { coursesList, generalAverage, isGeneralPassing } = useStudentReportCard(grades);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boleta de Calificaciones"
        description="Reporte oficial de rendimiento académico."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver
            </Button>
            <Button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Boleta
            </Button>
          </div>
        }
      />

      <ReportCardHeader 
        enrollment={enrollment} 
        generalAverage={generalAverage} 
        isGeneralPassing={isGeneralPassing} 
      />

      <GradesTable coursesList={coursesList} />

      {/* Footer Info for PDF/Print */}
      <div className="hidden print:block mt-20 pt-8 border-t border-slate-300">
        <div className="flex justify-between items-end px-10">
          <div className="text-center w-64 border-t border-slate-800 pt-2">
            <p className="text-sm font-semibold">Firma del Director</p>
          </div>
          <div className="text-center w-64 border-t border-slate-800 pt-2">
            <p className="text-sm font-semibold">Firma del Tutor</p>
          </div>
        </div>
        <p className="text-xs text-center text-slate-400 mt-12">
          Documento generado por Terranova Academy System el{" "}
          {new Date().toLocaleDateString("es-PE")}
        </p>
      </div>
    </div>
  );
}
