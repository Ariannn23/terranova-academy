import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileGradesTabProps {
  gradesByCourse: Record<
    string,
    {
      courseName: string;
      grades: Array<{
        period: string;
        score: number | null;
        isConfigured?: boolean;
      }>;
    }
  >;
}

export function ProfileGradesTab({ gradesByCourse }: ProfileGradesTabProps) {
  const courses = Object.values(gradesByCourse);

  if (courses.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic text-center py-6">
        No hay notas registradas en este período
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Curso</th>
                <th className="px-4 py-3 text-center">P1</th>
                <th className="px-4 py-3 text-center">P2</th>
                <th className="px-4 py-3 text-center">P3</th>
                <th className="px-4 py-3 text-center">P4</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700 bg-slate-100 rounded-tr-lg">
                  Final
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c: any) => {
                const getGrade = (period: string) =>
                  c.grades.find((g: any) => g.period === period);

                const finalGrade = getGrade("FINAL");
                const hasFinal = finalGrade && finalGrade.score !== null;
                const isFinalFailed = hasFinal && finalGrade.score < 11;

                return (
                  <tr key={c.courseName} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        {c.courseName}
                      </div>
                    </td>
                    {["P1", "P2", "P3", "P4"].map((p) => {
                      const grade = getGrade(p);
                      const isFailed = grade?.score !== null && grade?.score < 11;
                      return (
                        <td key={p} className="px-4 py-3 text-center">
                          {grade?.score !== null && grade?.score !== undefined ? (
                            <span
                              className={`font-mono text-sm ${
                                isFailed ? "text-red-600 font-bold" : "text-slate-700 font-medium"
                              }`}
                            >
                              {grade.score.toString().padStart(2, "0")}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    {/* Nota Final */}
                    <td className="px-4 py-3 text-center bg-slate-50 font-bold">
                      {hasFinal ? (
                        <Badge
                          variant={isFinalFailed ? "destructive" : "secondary"}
                          className={`font-mono text-sm ${
                            isFinalFailed
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {finalGrade.score.toString().padStart(2, "0")}
                        </Badge>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
