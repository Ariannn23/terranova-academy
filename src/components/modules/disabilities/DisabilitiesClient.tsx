"use client";

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
import { Plus, Eye, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useDisabilitiesDirectory } from "./hooks/useDisabilitiesDirectory";

export function DisabilitiesClient({ initialData }: { initialData: any[] }) {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    reasonFilter,
    setReasonFilter,
    filteredDisabilities,
    viewDisability,
  } = useDisabilitiesDirectory(initialData);

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "BAJO_RENDIMIENTO":
        return (
          <Badge variant="destructive" className="bg-red-500">
            Bajo Rendimiento
          </Badge>
        );
      case "EXCESO_FALTAS":
        return (
          <Badge
            variant="default"
            className="bg-orange-500 hover:bg-orange-600"
          >
            Exceso Faltas
          </Badge>
        );
      case "DISCIPLINA":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-500 text-white hover:bg-purple-600"
          >
            Disciplina
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            Otro
          </Badge>
        );
    }
  };

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "student",
      cell: (row: any) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.enrollment.student.firstName} {row.enrollment.student.lastName}
          </p>
          <p className="text-xs text-slate-500">
            DNI: {row.enrollment.student.dni}
          </p>
        </div>
      ),
    },
    {
      header: "Sección",
      accessorKey: "section",
      cell: (row: any) => (
        <span className="text-slate-600 text-sm">
          {row.enrollment.section.gradeLevel.name} "
          {row.enrollment.section.name}"
        </span>
      ),
    },
    {
      header: "Motivo",
      accessorKey: "reason",
      cell: (row: any) => getReasonBadge(row.reason),
    },
    {
      header: "Fecha Inicio",
      accessorKey: "startDate",
      cell: (row: any) => (
        <span className="text-sm text-slate-600">
          {format(new Date(row.startDate), "dd MMM yyyy", { locale: es })}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: (row: any) =>
        row.active ? (
          <div className="flex items-center text-red-600 text-sm font-medium">
            <AlertCircle className="w-4 h-4 mr-1" />
            Vigente
          </div>
        ) : (
          <div className="flex items-center text-emerald-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4 mr-1" />
            Resuelta
          </div>
        ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      cell: (row: any) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewDisability(row.id)}
            title="Ver Detalle"
            className="text-slate-400 hover:text-blue-600 hover:bg-blue-50"
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
        title="Inhabilitaciones"
        description="Gestión de estudiantes inhabilitados por diversas razones académicas o disciplinarias."
        action={
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/inhabilitaciones/nueva">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Inhabilitación
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre del alumno..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los estados</SelectItem>
            <SelectItem value="ACTIVE">Vigentes</SelectItem>
            <SelectItem value="RESOLVED">Resueltas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={reasonFilter} onValueChange={setReasonFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Motivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Cualquier Motivo</SelectItem>
            <SelectItem value="BAJO_RENDIMIENTO">Bajo Rendimiento</SelectItem>
            <SelectItem value="EXCESO_FALTAS">Exceso de Faltas</SelectItem>
            <SelectItem value="DISCIPLINA">Disciplina</SelectItem>
            <SelectItem value="OTRO">Otro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable data={filteredDisabilities} columns={columns} />
        {filteredDisabilities.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No se encontraron inhabilitaciones que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
