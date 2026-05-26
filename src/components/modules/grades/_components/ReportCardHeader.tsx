import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { cn } from "@/lib/utils";
import { EnrollmentForGrades } from "../types";

interface ReportCardHeaderProps {
  enrollment: EnrollmentForGrades;
  generalAverage: string | null;
  isGeneralPassing: boolean;
}

export function ReportCardHeader({
  enrollment,
  generalAverage,
  isGeneralPassing,
}: ReportCardHeaderProps) {
  const { student, section, academicYear } = enrollment;

  return (
    <Card className="border-slate-200 mt-6 print:shadow-none print:border-none">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          <StudentAvatar
            name={`${student.firstName} ${student.lastName}`}
            imageUrl={student.photoUrl || undefined}
            size="lg"
          />
          <div className="flex-1 space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">
              {student.firstName} {student.lastName}
            </h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600">
              {student.code && (
                <>
                  <span>
                    <strong>Cód:</strong>{" "}
                    <span className="text-emerald-700 font-medium">
                      {student.code}
                    </span>
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                </>
              )}
              <span>
                <strong>DNI:</strong> {student.dni}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-medium">
                {section.gradeLevel.name} &quot;{section.name}&quot;
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
              <span>{section.gradeLevel.level}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
              <span>Año {academicYear.year}</span>
            </div>
          </div>

          {/* Promedio General */}
          {generalAverage !== null && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-center min-w-[140px]">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Promedio
              </p>
              <div className="flex items-center justify-center gap-2">
                <Award
                  className={cn(
                    "h-5 w-5",
                    isGeneralPassing ? "text-emerald-500" : "text-amber-500",
                  )}
                />
                <span
                  className={cn(
                    "text-3xl font-bold tracking-tight",
                    isGeneralPassing ? "text-emerald-600" : "text-red-600",
                  )}
                >
                  {generalAverage}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
