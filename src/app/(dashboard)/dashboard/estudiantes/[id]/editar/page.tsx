import { getStudentById } from "@/lib/actions/student.actions";
import { notFound } from "next/navigation";
import { StudentForm } from "@/components/modules/students/StudentForm";

export default async function EditStudentPage({
  params,
}: {
  params: { id: string };
}) {
  const result = await getStudentById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <StudentForm initialData={result.data} />
    </div>
  );
}
