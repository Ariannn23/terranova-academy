import { useMemo } from "react";
import { GradePeriod } from "@prisma/client";
import { GradeRecord, CourseGradeSummary } from "../types";

export function useStudentReportCard(grades: GradeRecord[]) {
  // 1. Calculamos y ordenamos el mapa de cursos basado estrictamente en las notas ingresadas
  const coursesList = useMemo(() => {
    const coursesMap = new Map<string, CourseGradeSummary>();

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

    return Array.from(coursesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [grades]); // Dependencias precisas: re-calcula solo si cambia el array de grades

  // 2. Extraemos el promedio general a partir de los promedios finales previamente computados
  const { generalAverage, isGeneralPassing } = useMemo(() => {
    let totalFinalScore = 0;
    let finalScoresCount = 0;

    coursesList.forEach((course) => {
      const finalScore = course.records[GradePeriod.FINAL];
      if (finalScore !== null && finalScore !== undefined) {
        totalFinalScore += finalScore;
        finalScoresCount++;
      }
    });

    const average =
      finalScoresCount > 0
        ? (totalFinalScore / finalScoresCount).toFixed(1)
        : null;
    const isPassing = average ? Number(average) >= 11 : false;

    return { generalAverage: average, isGeneralPassing: isPassing };
  }, [coursesList]);

  return { coursesList, generalAverage, isGeneralPassing };
}
