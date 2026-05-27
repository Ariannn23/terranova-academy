import { useMemo } from "react";
import {
  calculateDebtTotal,
  calculatePaidTotal,
  calculatePaymentBalance,
  getPaymentStatusConfig,
  isPaymentOverdue,
  type PaymentLike,
} from "@/services/payment.service";

type PaymentHistoryPayment = PaymentLike & {
  id: string;
  concept?: { name?: string };
  paidAt?: Date | string | null;
};

export type StudentPaymentHistoryInput = {
  student: {
    firstName: string;
    lastName: string;
    dni?: string | null;
    code?: string | null;
  };
  payments?: PaymentHistoryPayment[];
  section?: {
    name: string;
    gradeLevel: {
      name: string;
    };
  };
};

export type StudentPaymentHistoryItem = {
  payment: PaymentHistoryPayment;
  balance: number;
  status: string;
  statusConfig: ReturnType<typeof getPaymentStatusConfig>;
  badgeClass: string;
};

export function useStudentPaymentHistory(
  enrollmentData: StudentPaymentHistoryInput,
) {
  const student = enrollmentData.student;
  const payments = useMemo(
    () => enrollmentData.payments ?? [],
    [enrollmentData.payments],
  );

  const totalPaid = useMemo(
    () => calculatePaidTotal(payments.flatMap((p) => p.transactions || [])),
    [payments],
  );

  const totalDebt = useMemo(() => calculateDebtTotal(payments), [payments]);

  const paymentItems = useMemo(
    () =>
      payments.map((payment): StudentPaymentHistoryItem => {
        const status =
          payment.status === "VENCIDO" || isPaymentOverdue(payment)
            ? "VENCIDO"
            : (payment.status ?? "PENDIENTE");
        const statusConfig = getPaymentStatusConfig(status);

        return {
          payment,
          balance: calculatePaymentBalance(payment),
          status,
          statusConfig,
          badgeClass:
            status === "PAGADO"
              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200"
              : status === "VENCIDO"
                ? "bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-200"
                : "bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200",
        };
      }),
    [payments],
  );

  return {
    student,
    payments,
    paymentItems,
    totalPaid,
    totalDebt,
  };
}
