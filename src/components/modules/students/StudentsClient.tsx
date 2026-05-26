"use client";

import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Eye } from "lucide-react";
import { useStudentsDirectory } from "./hooks/useStudentsDirectory";

export function StudentsClient({ initialData }: { initialData: any[] }) {
  const {
    searchTerm,
    setSearchTerm,
    levelFilter,
    setLevelFilter,
    statusFilter,
    setStatusFilter,
    filteredStudents,
    viewStudent,
    createStudent,
  } = useStudentsDirectory(initialData);

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "firstName",
      align: "left" as const,
      cell: (row: any) => (
        <div className="flex items-center gap-3 min-w-[220px] pl-4">
          <StudentAvatar
            name={`${row.firstName} ${row.lastName}`}
            imageUrl={row.photoUrl}
            size="sm"
          />
          <div className="text-left">
            <p className="font-medium text-slate-900 leading-tight">
              {row.firstName} {row.lastName}
            </p>
            <div className="flex gap-2 text-xs text-slate-500 mt-0.5">
              {row.code && (
                <span className="font-medium text-emerald-700">{row.code}</span>
              )}
              <span>DNI: {row.dni}</span>
            </div>
          </div>
        </div>
      ),
    },

    {
      header: "Grado y Nivel",
      accessorKey: "grade",
      align: "center" as const,
      cell: (row: any) => {
        const enrollment = row.enrollments?.[0];

        if (!enrollment)
          return (
            <div className="flex justify-center">
              <span className="text-slate-400 text-sm">Sin Matrícula</span>
            </div>
          );

        const gradeLevel = enrollment.section.gradeLevel;
        const level = gradeLevel.level; // INICIAL | PRIMARIA | SECUNDARIA
        const name = gradeLevel.name;

        // 🔥 Ajuste estético solo para secundaria
        let displayName = name;

        if (level === "SECUNDARIA" && !name.toLowerCase().includes("grado")) {
          displayName = name.replace("Secundaria", "Grado Secundaria");
        }

        return (
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <p className="font-medium text-slate-700 leading-tight">
                {displayName}
              </p>
              <p className="text-xs text-slate-500">{level}</p>
            </div>
          </div>
        );
      },
    },

    {
      header: "Estado",
      accessorKey: "status",
      align: "center" as const,
      cell: (row: any) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ),
    },

    {
      header: "Acciones",
      accessorKey: "actions",
      align: "center" as const,
      cell: (row: any) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewStudent(row.id)}
            title="Ver Perfil"
            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio de Estudiantes"
        description="Gestiona matriculados, históricos y sus perfiles completos."
        action={
          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            onClick={createStudent}
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Estudiante
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar por DNI o apellidos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nivel Educativo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los niveles</SelectItem>
            <SelectItem value="INICIAL">Inicial</SelectItem>
            <SelectItem value="PRIMARIA">Primaria</SelectItem>
            <SelectItem value="SECUNDARIA">Secundaria</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="ACTIVO">Activo</SelectItem>
            <SelectItem value="EN_RIESGO">En Riesgo</SelectItem>
            <SelectItem value="OBSERVADO">Observado</SelectItem>
            <SelectItem value="INHABILITADO">Inhabilitado</SelectItem>
            <SelectItem value="RETIRADO">Retirado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filteredStudents} columns={columns} />
    </div>
  );
}
