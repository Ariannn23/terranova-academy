"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, CreditCard, BookOpen, Clock } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function EnrollmentDetailsClient({ enrollment }: { enrollment: any }) {
  const { student, section, academicYear, payments } = enrollment;

  const paymentColumns = [
    {
      header: "Concepto",
      accessorKey: "concept",
      cell: (row: any) => (
        <span className="font-medium text-slate-900">{row.concept.name}</span>
      ),
    },
    {
      header: "Monto",
      accessorKey: "amount",
      cell: (row: any) => (
        <span className="text-slate-600">S/ {row.amount.toFixed(2)}</span>
      ),
    },
    {
      header: "Vencimiento",
      accessorKey: "dueDate",
      cell: (row: any) => (
        <span className="text-sm text-slate-500">
          {format(new Date(row.dueDate), "dd MMM, yyyy", { locale: es })}
        </span>
      ),
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: (row: any) => {
        const isPaid = row.status === "PAGADO";
        const isOverdue = row.status === "VENCIDO";
        return (
          <Badge
            variant={
              isPaid ? "default" : isOverdue ? "destructive" : "secondary"
            }
            className={
              isPaid
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                : isOverdue
                  ? ""
                  : "bg-amber-100 text-amber-800 hover:bg-amber-100"
            }
          >
            {row.status}
          </Badge>
        );
      },
    },
    {
      header: "Pagado el",
      accessorKey: "paidAt",
      cell: (row: any) => (
        <span className="text-sm text-slate-500">
          {row.paidAt
            ? format(new Date(row.paidAt), "dd MMM, yyyy", { locale: es })
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-slate-500 hover:text-emerald-700 transition-colors w-fit">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <Link href="/dashboard/matriculas">Volver a Matrículas</Link>
      </div>

      <PageHeader
        title="Detalle de Matrícula"
        description="Información académica y estado de cuenta del estudiante."
        action={
          <Badge
            variant={enrollment.active ? "default" : "destructive"}
            className={
              enrollment.active
                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-sm py-1 px-4"
                : "text-sm py-1 px-4"
            }
          >
            {enrollment.active ? "Matrícula Activa" : "Matrícula Anulada"}
          </Badge>
        }
      />

      {/* Main Student Info Card */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-emerald-700 w-full" />
        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            <div className="-mt-10">
              <StudentAvatar
                name={`${student.firstName} ${student.lastName}`}
                imageUrl={student.photoUrl}
                size="xl"
                className="border-4 border-white shadow-sm ring-1 ring-slate-100 bg-white"
              />
            </div>
            <div className="flex-1 space-y-1.5 md:pt-4">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-600">
                {student.code && (
                  <>
                    <span>
                      <strong>Cód:</strong>{" "}
                      <span className="text-emerald-700 font-medium">
                        {student.code}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  </>
                )}
                <span>
                  <strong>DNI:</strong> {student.dni}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <BookOpen className="h-4 w-4" />
                  {section.gradeLevel.name} "{section.name}"
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>{section.gradeLevel.level}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Academic Cycle Info */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Ciclo Académico {academicYear.year}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Fecha de Inicio</span>
              <span className="font-medium text-slate-900">
                {format(
                  new Date(academicYear.startDate),
                  "dd 'de' MMMM, yyyy",
                  { locale: es },
                )}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Fecha de Fin</span>
              <span className="font-medium text-slate-900">
                {format(new Date(academicYear.endDate), "dd 'de' MMMM, yyyy", {
                  locale: es,
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Alta de Matrícula</span>
              <span className="font-medium text-slate-900">
                {format(new Date(enrollment.enrollDate), "dd/MM/yyyy", {
                  locale: es,
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card className="border-slate-200 shadow-sm md:col-span-2">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Estado de Cuenta
            </CardTitle>
            <Button variant="outline" size="sm" className="h-8">
              Generar Recibo
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Total Pagado
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  S/{" "}
                  {payments
                    .filter((p: any) => p.status === "PAGADO")
                    .reduce((sum: number, p: any) => sum + p.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-sm font-medium text-amber-700 mb-1">
                  Pendiente
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  S/{" "}
                  {payments
                    .filter((p: any) => p.status === "PENDIENTE")
                    .reduce((sum: number, p: any) => sum + p.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-sm font-medium text-red-700 mb-1">Vencido</p>
                <p className="text-2xl font-bold text-red-600">
                  S/{" "}
                  {payments
                    .filter((p: any) => p.status === "VENCIDO")
                    .reduce((sum: number, p: any) => sum + p.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">
              Cronograma de Pagos
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <DataTable data={payments} columns={paymentColumns} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
