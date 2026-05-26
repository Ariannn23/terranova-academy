"use client";

import { useState } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/services/formatting.service";
import {
  calculateDebtTotal,
  calculatePaidTotal,
} from "@/services/payment.service";

interface StudentPaymentHistoryProps {
  enrollmentData: any;
}

export default function StudentPaymentHistory({
  enrollmentData,
}: StudentPaymentHistoryProps) {
  const router = useRouter();
  const student = enrollmentData.student;
  const payments = enrollmentData.payments;

  const totalPaid = calculatePaidTotal(
    payments.flatMap((p: any) => p.transactions || []),
  );

  const totalDebt = calculateDebtTotal(payments);

  const getStatusConfig = (status: string, dueDate: Date) => {
    if (status === "PAGADO") {
      return {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        badgeCls:
          "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
        label: "Pagado",
        colorCls: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    }

    // Check if actually overdue despite status saying PENDIENTE
    const isOverdue = new Date(dueDate) < new Date();

    if (status === "VENCIDO" || isOverdue) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-rose-600" />,
        badgeCls: "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200",
        label: "Vencido",
        colorCls: "text-rose-700 bg-rose-50 border-rose-200",
      };
    }

    return {
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      badgeCls:
        "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
      label: "Pendiente",
      colorCls: "text-amber-700 bg-amber-50 border-amber-200",
    };
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Button
        variant="ghost"
        className="mb-2 -ml-4 text-slate-500 hover:text-slate-900"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver atrás
      </Button>

      <PageHeader
        title="Historial de Pagos y Cuotas"
        description={`Cronograma financiero de ${student.firstName} ${student.lastName}`}
      />

      {/* Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <CardContent className="p-6 flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex gap-4 mt-2 text-slate-300 text-sm">
                <span>DNI: {student.dni}</span>
                <span>•</span>
                <span>Código: {student.code || "N/A"}</span>
              </div>
              <div className="mt-1 text-emerald-400 text-sm font-medium">
                Sección: {enrollmentData.section.gradeLevel.name} -{" "}
                {enrollmentData.section.name}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-center border-emerald-200 bg-emerald-50">
          <CardContent className="p-6 text-center space-y-2">
            <div>
              <p className="text-sm font-medium text-slate-500">Deuda Total</p>
              <h3 className="text-3xl font-black text-slate-800">
                {formatCurrency(totalDebt)}
              </h3>
            </div>
            <div className="pt-2 border-t border-emerald-200/60">
              <p className="text-xs text-slate-500 font-medium">
                Total Pagado:{" "}
                <span className="text-emerald-700 font-bold">
                  {formatCurrency(totalPaid)}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Cronograma de Cuotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative border-l-2 border-slate-100 ml-4 md:ml-6 space-y-8 pb-4">
            {payments.map((payment: any) => {
              const conf = getStatusConfig(payment.status, payment.dueDate);

              return (
                <div key={payment.id} className="relative pl-8 md:pl-10">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[17px] top-1 h-8 w-8 rounded-full bg-white border-4 border-slate-100 flex items-center justify-center shadow-sm">
                    {conf.icon}
                  </div>

                  {/* Content Card */}
                  <div
                    className={`p-4 rounded-xl border-2 transition-all ${conf.colorCls} hover:shadow-md`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-lg">
                            {payment.concept.name}
                          </h4>
                          <Badge variant="outline" className={conf.badgeCls}>
                            {conf.label}
                          </Badge>
                        </div>

                        <div className="text-sm font-medium opacity-80 flex flex-wrap gap-4">
                          <span>
                            Vencimiento:{" "}
                            {format(new Date(payment.dueDate), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                          {payment.status === "PAGADO" && payment.paidAt && (
                            <span className="flex items-center gap-1 text-emerald-800">
                              <Receipt className="w-4 h-4" /> Pagado el{" "}
                              {format(new Date(payment.paidAt), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right info / Action */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="opacity-80 text-xs font-semibold uppercase tracking-wider mb-0.5">
                            Monto
                          </p>
                          <p className="text-xl font-black">
                            {formatCurrency(payment.amount)}
                          </p>
                          {payment.status !== "PAGADO" &&
                            typeof payment.balance === "number" && (
                              <p className="text-xs font-semibold opacity-80">
                                Saldo: {formatCurrency(payment.balance)}
                              </p>
                            )}
                        </div>

                        {payment.status !== "PAGADO" && (
                          <Button
                            className="bg-slate-900 hover:bg-slate-800 shadow-sm whitespace-nowrap"
                            onClick={() =>
                              router.push(
                                `/dashboard/pagos/registrar?busqueda=${student.dni}`,
                              )
                            }
                          >
                            Pagar
                          </Button>
                        )}
                        {payment.status === "PAGADO" && (
                          <Button
                            variant="outline"
                            size="icon"
                            className="bg-white/50 hover:bg-white"
                            title="Imprimir Recibo"
                          >
                            <Download className="w-4 h-4 text-emerald-700" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
