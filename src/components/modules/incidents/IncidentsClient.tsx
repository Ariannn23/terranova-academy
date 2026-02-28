"use client";

import { useState, useEffect } from "react";
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
import { Plus, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function IncidentsClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    toast.dismiss();
  }, []);

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

  const filteredData = initialData.filter((record) => {
    const studentName =
      `${record.enrollment.student.firstName} ${record.enrollment.student.lastName}`.toLowerCase();
    const studentDni = record.enrollment.student.dni;
    const matchesSearch =
      studentName.includes(searchTerm.toLowerCase()) ||
      studentDni.includes(searchTerm);

    const matchesSeverity =
      severityFilter === "ALL" || record.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "student",
      cell: (row: any) => (
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
      cell: (row: any) => (
        <span className="text-slate-600 text-sm">
          {row.enrollment.section.gradeLevel.name} "
          {row.enrollment.section.name}"
        </span>
      ),
    },
    {
      header: "Fecha",
      accessorKey: "date",
      cell: (row: any) => (
        <span className="text-sm text-slate-600">
          {format(new Date(row.date), "dd MMM yyyy", { locale: es })}
        </span>
      ),
    },
    {
      header: "Severidad",
      accessorKey: "severity",
      cell: (row: any) => getSeverityBadge(row.severity),
    },
    {
      header: "Descripción",
      accessorKey: "description",
      cell: (row: any) => (
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
      cell: (row: any) => (
        <div className="flex justify-center gap-2">
          {/* Aquí podríamos abrir un modal para ver el detalle en lugar de una página nueva */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.loading("Cargando perfil del alumno...", {
                id: "view-profile",
              });
              router.push(`/dashboard/incidencias/${row.id}`);
            }}
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
        <DataTable data={filteredData} columns={columns} />
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No se encontraron incidencias que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
