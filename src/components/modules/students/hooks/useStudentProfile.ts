import { useMemo } from "react";
import { StudentProfileResult } from "@/lib/actions/student.actions";

export function useStudentProfile(student: StudentProfileResult) {
  const currentEnrollment = student.enrollments?.[0];
  const gradeLevel = currentEnrollment?.section?.gradeLevel;

  const gradesByCourse = useMemo(() => {
    const acc: Record<string, { courseName: string; grades: any[] }> = {};
    if (currentEnrollment?.gradeRecords) {
      for (const gr of currentEnrollment.gradeRecords) {
        if (!acc[gr.courseId]) {
          acc[gr.courseId] = {
            courseName: gr.course.name,
            grades: [],
          };
        }
        acc[gr.courseId].grades.push({
          period: gr.period,
          score: gr.score !== null ? Number(gr.score) : null,
          isConfigured: gr.gradeConfig?.active ?? false,
        });
      }
    }
    return acc;
  }, [currentEnrollment?.gradeRecords]);

  const attendanceStats = useMemo(() => {
    const stats: Record<string, number> = {
      PRESENTE: 0,
      TARDANZA: 0,
      FALTA_JUSTIFICADA: 0,
      FALTA_INJUSTIFICADA: 0,
    };
    if (currentEnrollment?.attendances) {
      for (const a of currentEnrollment.attendances) {
        if (stats[a.status] !== undefined) {
          stats[a.status]++;
        }
      }
    }
    return stats;
  }, [currentEnrollment?.attendances]);

  const sortedPayments = useMemo(() => {
    return (currentEnrollment?.payments || []).sort((a: any, b: any) => {
      if (a.status === "PENDIENTE" && b.status !== "PENDIENTE") return -1;
      if (a.status !== "PENDIENTE" && b.status === "PENDIENTE") return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [currentEnrollment?.payments]);

  return {
    currentEnrollment,
    gradeLevel,
    gradesByCourse,
    attendanceStats,
    sortedPayments,
  };
}
