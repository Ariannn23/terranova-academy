"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, GraduationCap, CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

import { EnrollmentData } from "./types";
import { EnrollmentHeroCard } from "./_components/EnrollmentHeroCard";
import { AcademicCycleCard } from "./_components/AcademicCycleCard";
import { FinancialSummaryCard } from "./_components/FinancialSummaryCard";

export function EnrollmentDetailsClient({
  enrollment,
}: {
  enrollment: EnrollmentData;
}) {
  useEffect(() => {
    toast.dismiss();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-slate-500 hover:text-emerald-700 transition-colors w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <Link href="/dashboard/matriculas">Volver a Matrículas</Link>
      </div>

      <PageHeader
        title="Detalle de Matrícula"
        description="Información académica y estado de cuenta del estudiante."
        action={
          <div className="flex gap-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href={`/dashboard/notas/${enrollment.id}`}>
                <GraduationCap className="h-4 w-4 mr-2" />
                Ver Libreta de Notas
              </Link>
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href={`/dashboard/asistencia/${enrollment.id}`}>
                <CalendarCheck className="h-4 w-4 mr-2" />
                Ver Asistencias
              </Link>
            </Button>
          </div>
        }
      />

      <EnrollmentHeroCard enrollment={enrollment} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AcademicCycleCard enrollment={enrollment} />
        <FinancialSummaryCard enrollment={enrollment} />
      </div>
    </div>
  );
}
