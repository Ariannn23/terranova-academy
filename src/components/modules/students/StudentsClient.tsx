"use client";

import { useState } from "react";
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
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function StudentsClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredData = initialData.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.dni.includes(searchTerm);

    const matchesStatus =
      statusFilter === "ALL" || student.status === statusFilter;

    const activeEnrollment = student.enrollments?.[0];
    const gradeLevel = activeEnrollment?.section?.gradeLevel;

    const matchesLevel =
      levelFilter === "ALL" || gradeLevel?.level === levelFilter;

    return matchesSearch && matchesStatus && matchesLevel;
  });

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "firstName",
      cell: (row: any) => (
        <div className="flex items-center space-x-3">
          <StudentAvatar
            name={`${row.firstName} ${row.lastName}`}
            imageUrl={row.photoUrl}
            size="sm"
          />
          <div>
            <p className="font-medium text-slate-900">
              {row.firstName} {row.lastName}
            </p>
            <p className="text-xs text-slate-500">DNI: {row.dni}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Grado y Nivel",
      accessorKey: "grade",
      cell: (row: any) => {
        const enrollment = row.enrollments?.[0];
        if (!enrollment)
          return <span className="text-slate-400">Sin Matrícula</span>;
        return (
          <div>
            <p className="font-medium text-slate-700">
              {enrollment.section.gradeLevel.name}
            </p>
            <p className="text-xs text-slate-500">
              {enrollment.section.gradeLevel.level}
            </p>
          </div>
        );
      },
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio de Estudiantes"
        description="Gestiona matriculados, históricos y sus perfiles completos."
        action={
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
            <Link href="/dashboard/estudiantes/nuevo">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Estudiante
            </Link>
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

      <DataTable
        data={filteredData}
        columns={columns}
        onRowClick={(row) => router.push(`/dashboard/estudiantes/${row.id}`)}
      />
    </div>
  );
}
