"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, CheckCircle2 } from "lucide-react";
import { usePendingPayments } from "@/components/modules/payments/hooks/usePendingPayments";
import type { PendingPaymentRow } from "@/types/payment";
import type { Control, UseFormSetValue } from "react-hook-form";
import type { PaymentFormSchemaType } from "@/lib/validations/payment.schema";

export function PendingPaymentsList({
  pendingPayments,
  control,
  setValue,
}: {
  pendingPayments: PendingPaymentRow[];
  control: Control<PaymentFormSchemaType>;
  setValue: UseFormSetValue<PaymentFormSchemaType>;
}) {
  return (
    <FormField
      control={control}
      name="paymentId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Seleccionar Deuda</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
            <PendingPaymentItems
              pendingPayments={pendingPayments}
              selectedPaymentId={field.value}
              onSelectPayment={field.onChange}
              setAmount={(amount) => setValue("amount", amount)}
            />
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function PendingPaymentItems({
  pendingPayments,
  selectedPaymentId,
  onSelectPayment,
  setAmount,
}: {
  pendingPayments: PendingPaymentRow[];
  selectedPaymentId?: string;
  onSelectPayment: (paymentId: string) => void;
  setAmount: (amount: number) => void;
}) {
  const { paymentItems, selectPayment } = usePendingPayments({
    pendingPayments,
    selectedPaymentId,
    onSelectPayment,
    setAmount,
  });

  return (
    <>
      {paymentItems.map(
        ({
          payment,
          isOverdue,
          isSelected,
          paidAmount,
          balance,
          formattedBalance,
          formattedAmount,
          formattedPaidAmount,
        }) => {
              return (
                <div
                  key={payment.id}
                  onClick={() => {
                    selectPayment(payment.id, balance);
                  }}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-blue-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900 pr-6">
                      {payment.concept?.name ?? "Concepto sin nombre"}
                    </h4>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700">
                        Saldo: {formattedBalance}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Total: {formattedAmount}
                      {paidAmount > 0 && ` | Abonado: ${formattedPaidAmount}`}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Vence:{" "}
                        {format(new Date(payment.dueDate ?? new Date()), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                  </div>
                  {isOverdue && (
                    <Badge
                      variant="destructive"
                      className="mt-2 text-[10px] px-1.5 py-0"
                    >
                      Vencido
                    </Badge>
                  )}
                </div>
              );
            },
      )}
    </>
  );
}
