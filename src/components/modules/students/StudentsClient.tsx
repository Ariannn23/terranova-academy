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
import { Plus, Archive, ArchiveRestore, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toggleStudentStatus } from "@/lib/actions/students.actions";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

export function StudentsClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [studentToToggle, setStudentToToggle] = useState<any>(null);

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

  const handleToggleClick = (student: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentToToggle(student);
  };

  const handleConfirmToggle = async () => {
    if (!studentToToggle) return;
    const isInactive = studentToToggle.status === "INHABILITADO";
    const newStatus = isInactive ? "ACTIVO" : "INHABILITADO";
    const loadingToast = toast.loading(
      isInactive ? "Activando estudiante..." : "Inhabilitando estudiante...",
    );

    const result = await toggleStudentStatus(studentToToggle.id, newStatus);

    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success(
        `Estudiante ${isInactive ? "activado" : "inhabilitado"} correctamente`,
      );
      router.refresh();
    } else {
      toast.error(result.error || "Error al cambiar estado del estudiante");
    }
    setStudentToToggle(null);
  };

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "firstName",
      cell: (row: any) => (
        <div className="flex items-center space-x-3 min-w-[200px]">
          <StudentAvatar
            name={`${row.firstName} ${row.lastName}`}
            imageUrl={row.photoUrl}
            size="sm"
          />
          <div>
            <p className="font-medium text-slate-900">
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
      cell: (row: any) => {
        const enrollment = row.enrollments?.[0];
        if (!enrollment)
          return <span className="text-slate-400">Sin Matrícula</span>;
        return (
          <div className="flex justify-center flex-col items-center">
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
      cell: (row: any) => (
        <div className="flex justify-center">
          <StatusBadge status={row.status} />
        </div>
      ),
    },
    {
      header: "Acciones",
      accessorKey: "actions",
      cell: (row: any) => {
        const isInactive = row.status === "INHABILITADO";
        return (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toast.loading("Cargando perfil del estudiante...", {
                  id: "view-student",
                });
                router.push(`/dashboard/estudiantes/${row.id}`);
              }}
              title="Ver Perfil o Editar"
              className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => handleToggleClick(row, e)}
              title={
                isInactive ? "Reactivar Estudiante" : "Inhabilitar Estudiante"
              }
              className={
                isInactive
                  ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                  : "text-slate-400 hover:text-red-600 hover:bg-red-50"
              }
            >
              {isInactive ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
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

      <DataTable data={filteredData} columns={columns} />

      <ConfirmDialog
        open={!!studentToToggle}
        onOpenChange={(open) => !open && setStudentToToggle(null)}
        title={
          studentToToggle?.status === "INHABILITADO"
            ? "Reactivar Estudiante"
            : "Inhabilitar Estudiante"
        }
        description={
          studentToToggle?.status === "INHABILITADO"
            ? `¿Estás seguro de reactivar a ${studentToToggle?.firstName} ${studentToToggle?.lastName}? El estudiante volverá a aparecer como activo en el sistema.`
            : `¿Estás seguro de inhabilitar a ${studentToToggle?.firstName} ${studentToToggle?.lastName}? El estudiante ya no podrá estar activo en nuevas matrículas o procesos.`
        }
        onConfirm={handleConfirmToggle}
        confirmText={
          studentToToggle?.status === "INHABILITADO"
            ? "Reactivar"
            : "Inhabilitar"
        }
        variant={
          studentToToggle?.status === "INHABILITADO" ? "default" : "destructive"
        }
      />
    </div>
  );
}
