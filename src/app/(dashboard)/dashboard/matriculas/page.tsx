import { getEnrollments } from "@/lib/actions/enrollment.actions";
import { EnrollmentsClient } from "@/components/modules/enrollments/EnrollmentsClient";

export default async function EnrollmentsPage() {
  const result = await getEnrollments({ limit: 100 });
  const enrollments = result.success && result.data ? result.data : [];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <EnrollmentsClient initialData={enrollments} />
    </div>
  );
}
