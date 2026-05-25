import { GradePeriod } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CourseGradeSummary } from "../types";

interface GradesTableProps {
  coursesList: CourseGradeSummary[];
}

export function GradesTable({ coursesList }: GradesTableProps) {
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
                <th className="px-4 py-4 font-medium text-center w-24">1º Bim</th>
                <th className="px-4 py-4 font-medium text-center w-24">2º Bim</th>
                <th className="px-4 py-4 font-medium text-center w-24">3º Bim</th>
                <th className="px-4 py-4 font-medium text-center w-24">4º Bim</th>
                <th className="px-6 py-4 font-bold text-center w-32 border-l bg-slate-100/50">
                  Nota Final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coursesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    El estudiante no tiene calificaciones registradas.
                  </td>
                </tr>
              ) : (
                coursesList.map((course, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
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
  );
}
