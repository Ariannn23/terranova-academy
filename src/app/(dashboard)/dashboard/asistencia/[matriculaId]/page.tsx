import { Metadata } from "next";
import { getEnrollmentById } from "@/lib/actions/enrollments.actions";
import {
  getAttendanceStats,
  getAttendanceByStudent,
} from "@/lib/actions/attendance.actions";
import { StudentAttendanceCalendar } from "@/components/modules/attendance/StudentAttendanceCalendar";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Historial de Asistencia | Terranova Academy",
  description: "Reporte de asistencia mensual del estudiante.",
};

export default async function StudentAttendancePage({
  params,
}: {
  params: { matriculaId: string };
}) {
  const enrollmentId = params.matriculaId;
  const enrollmentResult = await getEnrollmentById(enrollmentId);
  const statsResult = await getAttendanceStats(enrollmentId);
  // Fetching all history to display on the calendar
  const historyResult = await getAttendanceByStudent(enrollmentId);

  if (!enrollmentResult.success || !enrollmentResult.data) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <StudentAttendanceCalendar
        enrollment={enrollmentResult.data}
        stats={statsResult.success ? statsResult.data : null}
        history={
          historyResult.success && historyResult.data
            ? historyResult.data.records
            : []
        }
      />
    </div>
  );
}
