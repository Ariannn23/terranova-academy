"use client";

import { useState } from "react";
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
import { Edit, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "@/components/shared/DataTable";

type ScheduleListRow = {
  id: string;
  name: string;
  gradeLevel: {
    name: string;
    level: string;
  };
  teacher?: {
    firstName: string;
    lastName: string;
  } | null;
  _count: {
    schedules: number;
  };
};

export function SchedulesListClient({
  initialData,
}: {
  initialData: ScheduleListRow[];
}) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const filteredData = initialData.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.gradeLevel.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      levelFilter === "ALL" || section.gradeLevel.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  const columns = [
    {
      header: "Grado y Sección",
      accessorKey: "grade",
      cell: (row: ScheduleListRow) => (
        <div>
          <p className="font-semibold text-slate-800">
            {row.gradeLevel.name} &quot;{row.name}&quot;
          </p>
          <p className="text-xs text-slate-500">{row.gradeLevel.level}</p>
        </div>
      ),
    },
    {
      header: "Tutor Asignado",
      accessorKey: "teacher",
      cell: (row: ScheduleListRow) => (
        <div className="text-sm text-slate-600">
          {row.teacher
            ? `${row.teacher.firstName} ${row.teacher.lastName}`
            : "Sin tutor asignado"}
        </div>
      ),
    },
    {
      header: "Bloques Horarios",
      accessorKey: "schedulesCount",
      cell: (row: ScheduleListRow) => (
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-600" />
          <span className="font-medium text-slate-700">
            {row._count.schedules} bloques
          </span>
        </div>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      cell: (row: ScheduleListRow) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.loading("Cargando horario...", { id: "edit-schedule" });
              router.push(`/dashboard/horarios/${row.id}/editar`);
            }}
            title="Asignar Horario"
            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Horarios"
        description="Selecciona una sección para asignar los bloques horarios a los docentes."
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          placeholder="Buscar por grado o sección..."
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <DataTable data={filteredData} columns={columns} />
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No se encontraron secciones que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}
