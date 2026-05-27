import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useStudentPaymentHistory } from "@/components/modules/payments/hooks/useStudentPaymentHistory";

describe("useStudentPaymentHistory", () => {
  it("calcula total pagado, deuda y estados visuales", () => {
    const { result } = renderHook(() =>
      useStudentPaymentHistory({
        student: { firstName: "Ana", lastName: "Rojas" },
        payments: [
          {
            id: "payment-1",
            amount: 100,
            balance: 40,
            status: "PENDIENTE",
            dueDate: "2026-01-01",
            transactions: [{ amount: 60 }],
          },
          {
            id: "payment-2",
            amount: 80,
            balance: 0,
            status: "PAGADO",
            dueDate: "2026-02-01",
            transactions: [{ amount: 80 }],
          },
        ],
      }),
    );

    expect(result.current.totalPaid).toBe(140);
    expect(result.current.totalDebt).toBe(40);
    expect(result.current.paymentItems[0].balance).toBe(40);
    expect(result.current.paymentItems[1].statusConfig.label).toBe("Pagado");
  });
});
