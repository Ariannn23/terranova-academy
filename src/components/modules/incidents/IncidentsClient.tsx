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
import { Plus, Eye } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useIncidentsDirectory } from "./hooks/useIncidentsDirectory";

type IncidentRow = {
  id: string;
  date: Date | string;
  severity: string;
  description: string;
  enrollment: {
    student: {
      firstName: string;
      lastName: string;
      dni: string;
    };
    section: {
      name: string;
      gradeLevel: {
        name: string;
      };
    };
  };
};

export function IncidentsClient({ initialData }: { initialData: IncidentRow[] }) {
  const {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    filteredIncidents,
    viewIncident,
  } = useIncidentsDirectory(initialData);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "LEVE":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
          >
            Leve
          </Badge>
        );
      case "MODERADO":
        return (
          <Badge
            variant="default"
            className="bg-orange-500 hover:bg-orange-600"
          >
            Moderado
          </Badge>
        );
      case "GRAVE":
        return (
          <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
            Grave
          </Badge>
        );
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "student",
      cell: (row: IncidentRow) => (
        <div>
          <p className="font-semibold text-slate-800 flex items-center gap-2">
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
      cell: (row: IncidentRow) => (
        <span className="text-slate-600 text-sm">
          {row.enrollment.section.gradeLevel.name} &quot;
          {row.enrollment.section.name}&quot;
        </span>
      ),
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: (row: IncidentRow) => (
        <span className="text-sm text-slate-600">
          {format(new Date(row.date), "dd MMM yyyy", { locale: es })}
        </span>
      ),
    },
    {
      header: "Severidad",
      accessorKey: "severity",
      cell: (row: IncidentRow) => getSeverityBadge(row.severity),
    },
    {
      header: "Descripción",
      accessorKey: "description",
      cell: (row: IncidentRow) => (
        <span
          className="text-sm text-slate-600 truncate max-w-[200px] inline-block"
          title={row.description}
        >
          {row.description}
        </span>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      cell: (row: IncidentRow) => (
        <div className="flex justify-center gap-2">
          {/* Aquí podríamos abrir un modal para ver el detalle en lugar de una página nueva */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => viewIncident(row.id)}
            title="Ir al Perfil 360"
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
        title="Libro de Incidencias"
        description="Registro detallado de incidencias conductuales y disciplinarias de toda la escuela."
        action={
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link href="/dashboard/incidencias/nuevo">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Incidencia
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar por nombre o DNI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las severidades</SelectItem>
            <SelectItem value="LEVE">Leve</SelectItem>
            <SelectItem value="MODERADO">Moderado</SelectItem>
            <SelectItem value="GRAVE">Grave</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable data={filteredIncidents} columns={columns} />
        {filteredIncidents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No se encontraron incidencias que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
