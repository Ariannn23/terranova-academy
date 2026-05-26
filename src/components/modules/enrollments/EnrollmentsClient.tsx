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
import { Plus, Eye } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type EnrollmentRow = {
  id: string;
  enrollDate: Date | string;
  active: boolean;
  student: {
    firstName: string;
    lastName: string;
    dni: string;
    photoUrl?: string | null;
  };
  section: {
    name: string;
    gradeLevel: {
      name: string;
      level: string;
    };
  };
  academicYear: {
    year: number;
  };
};

export function EnrollmentsClient({
  initialData,
}: {
  initialData: EnrollmentRow[];
}) {
  const router = useRouter();
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
      align: "left" as const,
      cell: (row: EnrollmentRow) => (
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
      align: "center" as const,
      cell: (row: EnrollmentRow) => (
        <div className="flex flex-col items-center">
          <p className="font-medium text-slate-700">
          {row.section.gradeLevel.name} &quot;{row.section.name}&quot;
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
      align: "center" as const,
      cell: (row: EnrollmentRow) => (
        <span className="text-sm font-medium">{row.academicYear.year}</span>
      ),
    },
    {
      header: "Fecha de Alta",
      accessorKey: "date",
      align: "center" as const,
      cell: (row: EnrollmentRow) => (
        <span className="text-sm text-slate-600">
          {format(new Date(row.enrollDate), "dd MMM, yyyy")}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "active",
      align: "center" as const,
      cell: (row: EnrollmentRow) => (
        <Badge
          variant={row.active ? "default" : "destructive"}
          className={
            row.active
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
              : ""
          }
        >
          {row.active ? "Activa" : "Anulada"}
        </Badge>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      align: "center" as const,
      cell: (row: EnrollmentRow) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            toast.loading("Cargando detalle de matrícula...", {
              id: "view-enrollment",
            });
            router.push(`/dashboard/matriculas/${row.id}`);
          }}
          title="Ver Detalle de Matrícula"
          className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Matrículas"
        description="Listado general de alumnos matriculados y sus asignaciones de sección."
        action={
          <Button
            className="bg-emerald-700 hover:bg-emerald-800"
            onClick={() => {
              toast.loading("Iniciando registro de matrícula...", {
                id: "nav-new-enrollment",
              });
              router.push("/dashboard/matriculas/nueva");
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Nueva Matrícula
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
