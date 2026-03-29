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

export function PendingPaymentsList({ pendingPayments, control }: { pendingPayments: any[], control: any }) {
  return (
    <FormField
      control={control}
      name="paymentId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Seleccionar Deuda</FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
            {pendingPayments.map((payment) => {
              const isOverdue = new Date(payment.dueDate) < new Date();
              const isSelected = field.value === payment.id;

              return (
                <div
                  key={payment.id}
                  onClick={() => field.onChange(payment.id)}
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
                      {payment.concept.name}
                    </h4>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-emerald-700">
                        S/ {payment.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Vence:{" "}
                        {format(new Date(payment.dueDate), "dd MMM yyyy", {
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
            })}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
