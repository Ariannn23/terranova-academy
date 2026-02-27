"use client";

import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
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
import { format } from "date-fns";

export function EnrollmentsClient({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");

  const filteredData = initialData.filter((enrollment) => {
    const matchesSearch =
      enrollment.student.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.student.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      enrollment.student.dni.includes(searchTerm);

    const matchesLevel =
      levelFilter === "ALL" ||
      enrollment.section.gradeLevel.level === levelFilter;
    const matchesYear =
      yearFilter === "ALL" ||
      enrollment.academicYear.year.toString() === yearFilter;

    return matchesSearch && matchesLevel && matchesYear;
  });

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "student",
      cell: (row: any) => (
        <div className="flex items-center space-x-3">
          <StudentAvatar
            name={`${row.student.firstName} ${row.student.lastName}`}
            imageUrl={row.student.photoUrl}
            size="sm"
          />
          <div>
            <p className="font-medium text-slate-900">
              {row.student.firstName} {row.student.lastName}
            </p>
            <p className="text-xs text-slate-500">DNI: {row.student.dni}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Grado y Sección",
      accessorKey: "section",
      cell: (row: any) => (
        <div>
          <p className="font-medium text-slate-700">
            {row.section.gradeLevel.name} "{row.section.name}"
          </p>
          <p className="text-xs text-slate-500">
            {row.section.gradeLevel.level}
          </p>
        </div>
      ),
    },
    {
      header: "Año Lectivo",
      accessorKey: "year",
      cell: (row: any) => (
        <span className="text-sm font-medium">{row.academicYear.year}</span>
      ),
    },
    {
      header: "Fecha de Alta",
      accessorKey: "date",
      cell: (row: any) => (
        <span className="text-sm text-slate-600">
          {format(new Date(row.enrollDate), "dd MMM, yyyy")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Matrículas"
        description="Listado general de alumnos matriculados y sus asignaciones de sección."
        action={
          <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
            <Link href="/dashboard/matriculas/nueva">
              <Plus className="mr-2 h-4 w-4" /> Nueva Matrícula
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar estudiante o DNI..."
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
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Año Lectivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Histórico completo</SelectItem>
            <SelectItem value="2026">2026</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable data={filteredData} columns={columns} />
    </div>
  );
}
