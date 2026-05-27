import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/DataTable";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EnrollmentData, PaymentItem } from "../types";

const paymentColumns = [
  {
    header: "Concepto",
    accessorKey: "concept",
    cell: (row: PaymentItem) => (
      <span className="font-medium text-slate-900">{row.concept.name}</span>
    ),
  },
  {
    header: "Monto",
    accessorKey: "amount",
    cell: (row: PaymentItem) => (
      <span className="text-slate-600">S/ {row.amount.toFixed(2)}</span>
    ),
  },
  {
    header: "Vencimiento",
    accessorKey: "dueDate",
    cell: (row: PaymentItem) => (
      <span className="text-sm text-slate-500">
        {format(new Date(row.dueDate), "dd MMM, yyyy", { locale: es })}
      </span>
    ),
  },
  {
    header: "Estado",
    accessorKey: "status",
    cell: (row: PaymentItem) => {
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
    cell: (row: PaymentItem) => (
      <span className="text-sm text-slate-500">
        {row.paidAt
          ? format(new Date(row.paidAt), "dd MMM, yyyy", { locale: es })
          : "-"}
      </span>
    ),
  },
];

export function FinancialSummaryCard({ enrollment }: { enrollment: EnrollmentData }) {
  const { payments } = enrollment;

  return (
    <Card className="border-slate-200 shadow-sm md:col-span-2">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-emerald-600" />
          Estado de Cuenta
        </CardTitle>
        <Link
          href={`/dashboard/pagos/${enrollment.id}`}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800 hover:underline shrink-0"
        >
          Historial de pagos
        </Link>
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
                .filter((p) => p.status === "PAGADO")
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
            <p className="text-sm font-medium text-amber-700 mb-1">Pendiente</p>
            <p className="text-2xl font-bold text-amber-600">
              S/{" "}
              {payments
                .filter((p) => p.status === "PENDIENTE")
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100">
            <p className="text-sm font-medium text-red-700 mb-1">Vencido</p>
            <p className="text-2xl font-bold text-red-600">
              S/{" "}
              {payments
                .filter((p) => p.status === "VENCIDO")
                .reduce((sum, p) => sum + p.amount, 0)
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
  );
}
