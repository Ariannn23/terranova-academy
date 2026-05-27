export type TransactionLike = {
  amount?: number | null;
};

export type PaymentLike = {
  amount: number;
  balance?: number | null;
  transactions?: TransactionLike[] | null;
  status?: string | null;
  dueDate?: Date | string | null;
};

export function calculatePaidTotal(transactions: TransactionLike[] = []): number {
  return transactions.reduce((acc, transaction) => {
    const amount = transaction.amount ?? 0;
    return acc + (Number.isFinite(amount) ? amount : 0);
  }, 0);
}

export function calculatePaymentBalance(payment: PaymentLike): number {
  if (typeof payment.balance === "number" && Number.isFinite(payment.balance)) {
    return payment.balance;
  }

  const paid = calculatePaidTotal(payment.transactions ?? []);
  return Math.max(payment.amount - paid, 0);
}

export function calculateDebtTotal(payments: PaymentLike[]): number {
  return payments
    .filter((payment) => ["PENDIENTE", "VENCIDO"].includes(payment.status ?? ""))
    .reduce((acc, payment) => acc + calculatePaymentBalance(payment), 0);
}

export function getPaymentStatusConfig(status: string) {
  switch (status) {
    case "PAGADO":
      return {
        label: "Pagado",
        variant: "success",
        color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      };
    case "VENCIDO":
      return {
        label: "Vencido",
        variant: "destructive",
        color: "text-rose-700 bg-rose-50 border-rose-200",
      };
    case "PENDIENTE":
      return {
        label: "Pendiente",
        variant: "warning",
        color: "text-amber-700 bg-amber-50 border-amber-200",
      };
    default:
      return {
        label: status || "Desconocido",
        variant: "secondary",
        color: "text-slate-700 bg-slate-50 border-slate-200",
      };
  }
}

export function isPaymentOverdue(
  payment: PaymentLike,
  today: Date = new Date(),
): boolean {
  const balance = calculatePaymentBalance(payment);
  if (balance <= 0 || payment.status === "PAGADO") return false;
  if (payment.status === "VENCIDO") return true;
  if (!payment.dueDate) return false;

  const dueDate =
    payment.dueDate instanceof Date ? payment.dueDate : new Date(payment.dueDate);

  if (Number.isNaN(dueDate.getTime())) return false;

  const normalizedDueDate = new Date(dueDate);
  normalizedDueDate.setHours(0, 0, 0, 0);
  const normalizedToday = new Date(today);
  normalizedToday.setHours(0, 0, 0, 0);

  return normalizedDueDate < normalizedToday;
}

export function calculateDaysOverdue(
  payment: Pick<PaymentLike, "dueDate">,
  today: Date = new Date(),
): number {
  if (!payment.dueDate) return 0;

  const dueDate =
    payment.dueDate instanceof Date ? payment.dueDate : new Date(payment.dueDate);

  if (Number.isNaN(dueDate.getTime())) return 0;

  const normalizedDueDate = new Date(dueDate);
  normalizedDueDate.setHours(0, 0, 0, 0);
  const normalizedToday = new Date(today);
  normalizedToday.setHours(0, 0, 0, 0);

  const diff = normalizedToday.getTime() - normalizedDueDate.getTime();
  return Math.max(Math.floor(diff / (1000 * 60 * 60 * 24)), 0);
}

export function getOverdueSeverityClass(daysOverdue: number): string {
  if (daysOverdue > 30) return "bg-red-600";
  if (daysOverdue > 15) return "bg-orange-500";
  return "bg-amber-500";
}
