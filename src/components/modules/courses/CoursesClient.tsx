"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Archive, ArchiveRestore } from "lucide-react";
import { CourseForm } from "./CourseForm";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCoursesDirectory } from "./hooks/useCoursesDirectory";
import type { CourseInitialData } from "./hooks/useCourseForm";

type CourseRow = CourseInitialData & {
  gradeLevel: {
    name: string;
    level: string;
  };
  _count?: {
    schedules?: number;
  };
};

type CourseGradeLevelOption = {
  id: string;
  name: string;
  level: string;
};

export function CoursesClient({
  initialData,
  gradeLevels,
}: {
  initialData: CourseRow[];
  gradeLevels: CourseGradeLevelOption[];
}) {
  const {
    searchTerm,
    setSearchTerm,
    filteredCourses,
    isFormOpen,
    setIsFormOpen,
    selectedCourse,
    courseToToggle,
    setCourseToToggle,
    handleEdit,
    handleCreate,
    handleToggleClick,
    handleConfirmToggle,
  } = useCoursesDirectory(initialData);

  const columns = [
    {
      header: "Curso",
      accessorKey: "name",
      cell: (row: CourseRow) => (
        <div className="font-medium text-slate-900">{row.name}</div>
      ),
    },
    {
      header: "Nivel Educativo",
      accessorKey: "level",
      cell: (row: CourseRow) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.gradeLevel.name}</span>
          <span className="text-xs text-slate-500">{row.gradeLevel.level}</span>
        </div>
      ),
    },
    {
      header: "Horas/Semana",
      accessorKey: "hoursPerWeek",
      cell: (row: CourseRow) => (
        <div className="flex justify-center w-full">{row.hoursPerWeek} hrs</div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "active",
      cell: (row: CourseRow) => (
        <div className="flex justify-center">
          <Badge
            variant={row.active ? "default" : "destructive"}
            className={
              row.active
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                : ""
            }
          >
            {row.active ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      ),
    },
    {
      header: "Bloques Asignados",
      accessorKey: "schedules",
      cell: (row: CourseRow) => (
        <div className="flex justify-center w-full font-medium text-slate-600">
          {row._count?.schedules || 0}
        </div>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      cell: (row: CourseRow) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleClick(row)}
            title={row.active ? "Inhabilitar Curso" : "Reactivar Curso"}
            className={
              row.active
                ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
            }
          >
            {row.active ? (
              <Archive className="h-4 w-4" />
            ) : (
              <ArchiveRestore className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Editar Curso"
            className="text-slate-500 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Cursos"
        description="Agrega y modifica la currícula escolar y las horas asignadas por nivel."
        action={
          <Button
            onClick={handleCreate}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Curso
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar curso o grado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable data={filteredCourses} columns={columns} />
      </div>

      <CourseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedCourse ?? undefined}
        gradeLevels={gradeLevels}
      />

      <ConfirmDialog
        open={!!courseToToggle}
        onOpenChange={(open) => !open && setCourseToToggle(null)}
        title={courseToToggle?.active ? "Inhabilitar Curso" : "Reactivar Curso"}
        description={
          courseToToggle?.active
            ? `¿Estás seguro de inhabilitar el curso "${courseToToggle.name}"? El curso ya no podrá ser asignado en nuevos horarios.`
            : `¿Estás seguro de reactivar el curso "${courseToToggle?.name}"?`
        }
        onConfirm={handleConfirmToggle}
        confirmText={courseToToggle?.active ? "Inhabilitar" : "Reactivar"}
        variant={courseToToggle?.active ? "destructive" : "default"}
      />
    </div>
  );
}
