import { Metadata } from "next";
import { getEnrollmentById } from "@/lib/actions/enrollment.actions";
import { getStudentGrades } from "@/lib/actions/grade.actions";
import { StudentReportCard } from "@/components/modules/grades/StudentReportCard";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Boleta de Notas | Terranova Academy",
  description: "Reporte de calificaciones por estudiante.",
};

export default async function StudentReportCardPage({
  params,
}: {
  params: { matriculaId: string };
}) {
  const enrollmentId = params.matriculaId;
  const enrollmentResult = await getEnrollmentById(enrollmentId);
  const gradesResult = await getStudentGrades(enrollmentId);

  if (!enrollmentResult.success || !enrollmentResult.data) {
    notFound();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <StudentReportCard
        enrollment={enrollmentResult.data}
        grades={
          gradesResult.success && gradesResult.data ? gradesResult.data : []
        }
      />
    </div>
  );
}
