"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Banknote,
  AlertCircle,
  Clock,
  CalendarDays,
  CreditCard,
  FileCheck2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KPICard } from "@/components/modules/dashboard/KPICard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ReceiptModal } from "./ReceiptModal";
import { DataTable } from "@/components/shared/DataTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/services/formatting.service";

interface PaymentsDashboardClientProps {
  initialData: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    dueThisWeek: number;
    latestPayments: PaymentDashboardRow[];
  };
}

type PaymentDashboardRow = {
  id: string;
  paidAt: Date | string;
  amount: number;
  method?: string | null;
  concept: {
    name: string;
  };
  enrollment: {
    student: {
      firstName: string;
      lastName: string;
    };
  };
};

export default function PaymentsDashboardClient({
  initialData,
}: PaymentsDashboardClientProps) {
  const router = useRouter();
  const [data] = useState(initialData);
  const [selectedReceipt, setSelectedReceipt] =
    useState<PaymentDashboardRow | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const paymentColumns = [
    {
      header: "Fecha de Pago",
      accessorKey: "paidAt",
      cell: (row: PaymentDashboardRow) =>
        format(new Date(row.paidAt), "dd MMM yyyy, p", { locale: es }),
    },
    {
      header: "Estudiante",
      accessorKey: "student",
      cell: (row: PaymentDashboardRow) =>
        `${row.enrollment.student.firstName} ${row.enrollment.student.lastName}`,
    },
    {
      header: "Concepto",
      accessorKey: "concept",
      cell: (row: PaymentDashboardRow) => row.concept.name,
    },
    {
      header: "Método",
      accessorKey: "method",
      cell: (row: PaymentDashboardRow) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <span className="capitalize">{row.method?.toLowerCase() || "-"}</span>
        </div>
      ),
    },
    {
      header: "Monto",
      accessorKey: "amount",
      cell: (row: PaymentDashboardRow) => (
        <span className="font-bold text-emerald-600">
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: "Recibo",
      accessorKey: "id",
      cell: (row: PaymentDashboardRow) => (
        <button
          onClick={() => {
            setSelectedReceipt(row);
            setIsReceiptOpen(true);
          }}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="Ver Recibo"
        >
          <FileCheck2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Cobros y Pagos"
          description="Gestión financiera, tesorería y control de pensiones"
        />
        <div className="flex gap-3 w-full sm:w-auto">
          <Button
            onClick={() => {
              toast.loading("Cargando módulo de pagos...", {
                id: "nav-payments",
              });
              router.push("/dashboard/pagos/registrar");
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Pago
          </Button>
          {/* Enlace a reporte de pagos vencidos */}
          <Button
            variant="outline"
            className="border-rose-200 text-rose-700 hover:bg-rose-50 shadow-sm"
            asChild
          >
            <Link href="/dashboard/pagos/vencidos">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Ver Vencidos
            </Link>
          </Button>
          {/* Aquí irían los filtros por mes si decidimos que el KPI debe cambiar */}
          <Select defaultValue={new Date().getMonth().toString()}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white">
              <SelectValue placeholder="Mes actual" />
            </SelectTrigger>
            <SelectContent>
              {[
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ].map((m, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Cobrado este mes"
          value={formatCurrency(data.totalPaid)}
          icon={Banknote}
          description="Ingresos del mes actual"
          trend={{ value: "+12%", isPositive: true }}
        />
        <KPICard
          title="Pendiente de cobro"
          value={formatCurrency(data.totalPending)}
          icon={Clock}
          description="Cuotas del mes actual aún no pagadas"
        />
        <KPICard
          title="Total Vencido"
          value={formatCurrency(data.totalOverdue)}
          icon={AlertCircle}
          description="Deuda histórica acumulada"
          criticality="high"
        />
        <KPICard
          title="Por Vencer (Esta semana)"
          value={formatCurrency(data.dueThisWeek)}
          icon={CalendarDays}
          description="Proyección a corto plazo"
          criticality="medium"
        />
      </div>

      {/* Latest Payments Table */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader>
          <CardTitle>Últimos Pagos Registrados</CardTitle>
          <CardDescription>
            Historial reciente de transacciones procesadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={paymentColumns}
            data={data.latestPayments}
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

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={setIsReceiptOpen}
        receipt={selectedReceipt}
      />
    </div>
  );
}
