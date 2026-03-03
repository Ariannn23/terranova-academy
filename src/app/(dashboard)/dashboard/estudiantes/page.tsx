import { getStudents } from "@/lib/actions/student.actions";
import { StudentsClient } from "@/components/modules/students/StudentsClient";

export default async function StudentsPage() {
  const result = await getStudents();
  const students = result.success && result.data ? result.data : [];

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <StudentsClient initialData={students} />
    </div>
  );
}
