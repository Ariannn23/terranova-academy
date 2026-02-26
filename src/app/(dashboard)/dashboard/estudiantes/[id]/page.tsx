import { getStudentById } from "@/lib/actions/students.actions";
import { notFound } from "next/navigation";
import { StudentProfileClient } from "@/components/modules/students/StudentProfileClient";

export default async function StudentProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getStudentById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <StudentProfileClient student={result.data} />
    </div>
  );
}
