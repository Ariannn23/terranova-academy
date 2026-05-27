import { useMemo } from "react";
import { formatCurrency } from "@/services/formatting.service";
import {
  calculatePaidTotal,
  calculatePaymentBalance,
  isPaymentOverdue,
  type PaymentLike,
} from "@/services/payment.service";

type PendingPayment = PaymentLike & {
  id: string;
  concept?: { name?: string };
};

type UsePendingPaymentsInput = {
  pendingPayments: PendingPayment[];
  selectedPaymentId?: string;
  onSelectPayment: (paymentId: string) => void;
  setAmount: (amount: number) => void;
};

export function usePendingPayments({
  pendingPayments,
  selectedPaymentId,
  onSelectPayment,
  setAmount,
}: UsePendingPaymentsInput) {
  const paymentItems = useMemo(
    () =>
      pendingPayments.map((payment) => {
        const paidAmount = calculatePaidTotal(payment.transactions || []);
        const balance = calculatePaymentBalance(payment);

        return {
          payment,
          isSelected: selectedPaymentId === payment.id,
          isOverdue: isPaymentOverdue(payment),
          paidAmount,
          balance,
          formattedBalance: formatCurrency(balance),
          formattedAmount: formatCurrency(payment.amount),
          formattedPaidAmount: formatCurrency(paidAmount),
        };
      }),
    [pendingPayments, selectedPaymentId],
  );

  const selectPayment = (paymentId: string, balance: number) => {
    onSelectPayment(paymentId);
    setAmount(Math.max(balance, 0));
  };

  return {
    paymentItems,
    selectPayment,
  };
}
