"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { GradePeriod } from "@prisma/client";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { cn } from "@/lib/utils";

interface StudentReportCardProps {
  enrollment: any;
  grades: any[];
}

export function StudentReportCard({
  enrollment,
  grades,
}: StudentReportCardProps) {
  const router = useRouter();
  const { student, section, academicYear } = enrollment;

  // Agrupar calificaciones por curso
  const coursesMap = new Map<
    string,
    { name: string; records: Record<string, number | null> }
  >();

  // Si no hay cursos listados en notas, podemos iterar sobre los cursos del grado,
  // pero ya que getStudentGrades retorna los cursos con nota (gradeRecords incluyen course), agrupamos a partir de ahí.
  grades.forEach((record) => {
    if (!coursesMap.has(record.courseId)) {
      coursesMap.set(record.courseId, {
        name: record.course.name,
        records: {
          [GradePeriod.P1]: null,
          [GradePeriod.P2]: null,
          [GradePeriod.P3]: null,
          [GradePeriod.P4]: null,
          [GradePeriod.FINAL]: null,
        },
      });
    }
    const courseData = coursesMap.get(record.courseId)!;
    courseData.records[record.period] = record.score;
  });

  const coursesList = Array.from(coursesMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  // Promedio General
  let totalFinalScore = 0;
  let finalScoresCount = 0;

  coursesList.forEach((course) => {
    const finalScore = course.records[GradePeriod.FINAL];
    if (finalScore !== null && finalScore !== undefined) {
      totalFinalScore += finalScore;
      finalScoresCount++;
    }
  });

  const generalAverage =
    finalScoresCount > 0
      ? (totalFinalScore / finalScoresCount).toFixed(1)
      : null;
  const isGeneralPassing = generalAverage
    ? Number(generalAverage) >= 11
    : false;

  const renderScore = (score: number | null | undefined) => {
    if (score === null || score === undefined)
      return <span className="text-slate-300">--</span>;
    const isPassing = score >= 11;
    return (
      <span
        className={cn(
          "font-semibold",
          isPassing ? "text-slate-800" : "text-red-600",
        )}
      >
        {score.toString().padStart(2, "0")}
      </span>
    );
  };

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

      {/* Header Estudiante - Igualado a EnrollmentDetails pero sin fondo */}
      <Card className="border-slate-200 mt-6 print:shadow-none print:border-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <StudentAvatar
              name={`${student.firstName} ${student.lastName}`}
              imageUrl={student.photoUrl}
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
                  {section.gradeLevel.name} "{section.name}"
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

      {/* Tabla de Notas */}
      <Card className="border-slate-200 print:shadow-none print:border-none">
        <CardHeader className="bg-slate-50/50 border-b py-4">
          <CardTitle className="text-lg text-slate-800">
            Cursos y Calificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-700">
                    Área / Curso
                  </th>
                  <th className="px-4 py-4 font-medium text-center w-24">
                    1º Bim
                  </th>
                  <th className="px-4 py-4 font-medium text-center w-24">
                    2º Bim
                  </th>
                  <th className="px-4 py-4 font-medium text-center w-24">
                    3º Bim
                  </th>
                  <th className="px-4 py-4 font-medium text-center w-24">
                    4º Bim
                  </th>
                  <th className="px-6 py-4 font-bold text-center w-32 border-l bg-slate-100/50">
                    Nota Final
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coursesList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      El estudiante no tiene calificaciones registradas.
                    </td>
                  </tr>
                ) : (
                  coursesList.map((course, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {course.name}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {renderScore(course.records[GradePeriod.P1])}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {renderScore(course.records[GradePeriod.P2])}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {renderScore(course.records[GradePeriod.P3])}
                      </td>
                      <td className="px-4 py-4 text-center text-slate-600">
                        {renderScore(course.records[GradePeriod.P4])}
                      </td>
                      <td className="px-6 py-4 text-center border-l bg-slate-50/30 text-base">
                        {renderScore(course.records[GradePeriod.FINAL])}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

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
