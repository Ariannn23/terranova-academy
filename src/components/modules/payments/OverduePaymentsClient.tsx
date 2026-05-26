"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FileDown, CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/services/formatting.service";
import { useOverduePayments } from "./hooks/useOverduePayments";

interface OverduePaymentsClientProps {
  initialData: any[];
}

export default function OverduePaymentsClient({
  initialData,
}: OverduePaymentsClientProps) {
  const router = useRouter();
  const { getDaysOverdue, getDelayBadgeClass, exportCsv } =
    useOverduePayments(initialData);

  const columns = [
    {
      header: "Estudiante",
      accessorKey: "student",
      cell: (row: any) =>
        `${row.enrollment.student.firstName} ${row.enrollment.student.lastName}`,
    },
    {
      header: "Sección",
      accessorKey: "section",
      cell: (row: any) =>
        `${row.enrollment.section.gradeLevel.name} - ${row.enrollment.section.name}`,
    },
    {
      header: "Concepto",
      accessorKey: "concept",
      cell: (row: any) => row.concept.name,
    },
    {
      header: "Monto",
      accessorKey: "amount",
      cell: (row: any) => (
        <span className="font-bold text-slate-700">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Vencimiento",
      accessorKey: "dueDate",
      cell: (row: any) => (
        <span className="text-slate-600">
          {format(new Date(row.dueDate), "dd MMM yyyy", { locale: es })}
        </span>
      ),
    },
    {
      header: "Días de Retraso",
      accessorKey: "delay",
      cell: (row: any) => {
        const days = getDaysOverdue(row);
        return (
          <Badge
            variant="destructive"
            className={`font-mono px-2 py-0.5 ${getDelayBadgeClass(row)}`}
          >
            {days} días
          </Badge>
        );
      },
    },
    {
      header: "Acción",
      accessorKey: "id",
      cell: (row: any) => (
        <Button
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-800"
          onClick={() =>
            router.push(
              `/dashboard/pagos/registrar?busqueda=${row.enrollment.student.dni}`,
            )
          }
        >
          <CalendarClock className="w-4 h-4 mr-2" />
          Cobrar
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Pagos Vencidos"
          description="Monitoreo de deudores y cartera morosa ordenado por urgencia."
        />
        <Button
          onClick={exportCsv}
          className="bg-slate-900 hover:bg-slate-800 gap-2"
        >
          <FileDown className="w-5 h-5" />
          Exportar Lista
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={initialData}
            searchPlaceholder="Buscar por nombre o DNI..."
            searchKey={[
              "enrollment.student.firstName",
              "enrollment.student.lastName",
              "enrollment.student.dni",
              "concept.name",
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
