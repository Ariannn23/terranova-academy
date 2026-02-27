"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, Archive } from "lucide-react";
import { CourseForm } from "./CourseForm";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";

export function CoursesClient({
  initialData,
  gradeLevels,
}: {
  initialData: any[];
  gradeLevels: any[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const filteredCourses = initialData.filter((c) =>
    `${c.name} ${c.gradeLevel.name} ${c.gradeLevel.level}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleEdit = (course: any) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  const columns = [
    {
      header: "Curso",
      accessorKey: "name",
      cell: (row: any) => (
        <div className="font-medium text-slate-900">{row.name}</div>
      ),
    },
    {
      header: "Nivel Educativo",
      accessorKey: "level",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{row.gradeLevel.name}</span>
          <span className="text-xs text-slate-500">{row.gradeLevel.level}</span>
        </div>
      ),
    },
    {
      header: "Horas/Semana",
      accessorKey: "hoursPerWeek",
      cell: (row: any) => (
        <div className="text-center w-full">{row.hoursPerWeek} hrs</div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "active",
      cell: (row: any) => (
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
      ),
    },
    {
      header: "Bloques Asignados",
      accessorKey: "schedules",
      cell: (row: any) => (
        <div className="text-center w-full font-medium text-slate-600">
          {row._count?.schedules || 0}
        </div>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      cell: (row: any) => (
        <div className="flex justify-end gap-2 pr-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
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
        initialData={selectedCourse}
        gradeLevels={gradeLevels}
      />
    </div>
  );
}
