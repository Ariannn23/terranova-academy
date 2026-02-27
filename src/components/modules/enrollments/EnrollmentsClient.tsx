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
import { Plus, Archive, ArchiveRestore, Eye, Edit2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toggleEnrollmentStatus } from "@/lib/actions/enrollments.actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EnrollmentsClient({ initialData }: { initialData: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState("ALL");
  const [enrollmentToToggle, setEnrollmentToToggle] = useState<any>(null);

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

  const handleToggleClick = (enrollment: any) => {
    setEnrollmentToToggle(enrollment);
  };

  const handleConfirmToggle = async () => {
    if (!enrollmentToToggle) return;
    const newStatus = !enrollmentToToggle.active;
    const loadingToast = toast.loading(
      newStatus ? "Activando matrícula..." : "Inhabilitando matrícula...",
    );

    const result = await toggleEnrollmentStatus(
      enrollmentToToggle.id,
      newStatus,
    );

    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success(
        `Matrícula ${newStatus ? "activada" : "inhabilitada"} correctamente`,
      );
      router.refresh();
    } else {
      toast.error(result.error || "Error al cambiar estado de la matrícula");
    }
    setEnrollmentToToggle(null);
  };

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
        <div className="flex flex-col justify-center items-center">
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
        <div className="flex justify-center w-full">
          <span className="text-sm font-medium">{row.academicYear.year}</span>
        </div>
      ),
    },
    {
      header: "Fecha de Alta",
      accessorKey: "date",
      cell: (row: any) => (
        <div className="flex justify-center w-full">
          <span className="text-sm text-slate-600">
            {format(new Date(row.enrollDate), "dd MMM, yyyy")}
          </span>
        </div>
      ),
    },
    {
      header: "Estado",
      accessorKey: "active",
      cell: (row: any) => (
        <div className="flex justify-center w-full">
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
            asChild
            title="Ver Detalle de Matrícula"
            className="text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
          >
            <Link href={`/dashboard/matriculas/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleClick(row)}
            title={row.active ? "Anular Matrícula" : "Reactivar Matrícula"}
            className={
              row.active
                ? "text-slate-400 hover:text-red-600 hover:bg-red-50"
                : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
            }
          >
            {row.active ? (
              <Archive className="h-4 w-4" />
            ) : (
              <ArchiveRestore className="h-4 w-4" />
            )}
          </Button>
        </div>
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

      <ConfirmDialog
        open={!!enrollmentToToggle}
        onOpenChange={(open) => !open && setEnrollmentToToggle(null)}
        title={
          enrollmentToToggle?.active
            ? "Anular Matrícula"
            : "Reactivar Matrícula"
        }
        description={
          enrollmentToToggle?.active
            ? `¿Estás seguro de anular la matrícula del alumno ${enrollmentToToggle?.student?.firstName}?`
            : `¿Estás seguro de reactivar la matrícula del alumno ${enrollmentToToggle?.student?.firstName}?`
        }
        onConfirm={handleConfirmToggle}
        confirmText={enrollmentToToggle?.active ? "Anular" : "Reactivar"}
        variant={enrollmentToToggle?.active ? "destructive" : "default"}
      />
    </div>
  );
}
