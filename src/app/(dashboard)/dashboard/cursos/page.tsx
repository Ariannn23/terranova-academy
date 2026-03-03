import { getCourses } from "@/lib/actions/course.actions";
import { CoursesClient } from "@/components/modules/courses/CoursesClient";
import { AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Cursos - TerraNova Academy",
  description: "Gestión de malla curricular y cursos por grados.",
};

export default async function CoursesPage() {
  const [result, gradeLevels] = await Promise.all([
    getCourses(),
    prisma.gradeLevel.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, level: true },
    }),
  ]);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-xl border border-red-100 my-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-red-900 mb-2">
          Error al cargar los cursos
        </h2>
        <p className="text-red-700">{result.error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <CoursesClient
        initialData={result.data || []}
        gradeLevels={gradeLevels}
      />
    </div>
  );
}
