"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, GraduationCap, CalendarCheck, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/dashboard/notas/${enrollment.id}`}
              className={cn(
                buttonVariants(),
                "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              <GraduationCap className="h-4 w-4" />
              Ver Libreta de Notas
            </Link>
            <Link
              href={`/dashboard/asistencia/${enrollment.id}`}
              className={cn(buttonVariants(), "bg-blue-600 hover:bg-blue-700")}
            >
              <CalendarCheck className="h-4 w-4" />
              Ver Asistencias
            </Link>
            <Link
              href={`/dashboard/pagos/${enrollment.id}`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
              )}
            >
              <CreditCard className="h-4 w-4" />
              Historial de pagos
            </Link>
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
