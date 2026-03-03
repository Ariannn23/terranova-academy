import { getEnrollmentById } from "@/lib/actions/enrollment.actions";
import { EnrollmentDetailsClient } from "@/components/modules/enrollments/EnrollmentDetailsClient";
import { notFound } from "next/navigation";

export default async function EnrollmentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getEnrollmentById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <EnrollmentDetailsClient enrollment={result.data} />
    </div>
  );
}
