import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Receipt, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PAYMENT_STATUS } from "@/lib/utils/student.utils";

interface ProfilePaymentsTabProps {
  sortedPayments: any[];
  onReceiptClick: (receipt: any) => void;
}

export function ProfilePaymentsTab({
  sortedPayments,
  onReceiptClick,
}: ProfilePaymentsTabProps) {
  if (sortedPayments.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic text-center py-6">
        No hay registros de pago
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {sortedPayments.map((payment: any) => {
            const statusConfig = PAYMENT_STATUS[payment.status];
            const isPending = payment.status === "PENDIENTE";

            return (
              <div
                key={payment.id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-slate-50 transition-colors gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      isPending ? "bg-amber-100" : "bg-emerald-100"
                    }`}
                  >
                    <CreditCard
                      className={`h-5 w-5 ${
                        isPending ? "text-amber-600" : "text-emerald-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {payment.concept.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                      <span>
                        Vencía:{" "}
                        {format(new Date(payment.dueDate), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                      {payment.paidAt && (
                        <span>
                          Pagado:{" "}
                          {format(new Date(payment.paidAt), "dd MMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      )}
                      {payment.method && <span>Método: {payment.method}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
                  <div className="text-right">
                    <p className="font-bold text-lg text-slate-900">
                      S/ {payment.amount.toFixed(2)}
                    </p>
                    <Badge
                      variant="outline"
                      className={`uppercase text-[10px] bg-transparent ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {payment.status === "PAGADO" && payment.receipt && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReceiptClick(payment.receipt)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Ver Recibo
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
