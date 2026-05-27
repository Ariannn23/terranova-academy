import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePendingPayments } from "@/components/modules/payments/hooks/usePendingPayments";

describe("usePendingPayments", () => {
  it("prepara saldos, abonado y estado de seleccion", () => {
    const { result } = renderHook(() =>
      usePendingPayments({
        pendingPayments: [
          {
            id: "payment-1",
            amount: 100,
            balance: 40,
            dueDate: "2026-01-01",
            transactions: [{ amount: 60 }],
          },
        ],
        selectedPaymentId: "payment-1",
        onSelectPayment: vi.fn(),
        setAmount: vi.fn(),
      }),
    );

    expect(result.current.paymentItems[0]).toMatchObject({
      isSelected: true,
      paidAmount: 60,
      balance: 40,
    });
  });

  it("selecciona deuda y setea monto con saldo positivo", () => {
    const onSelectPayment = vi.fn();
    const setAmount = vi.fn();
    const { result } = renderHook(() =>
      usePendingPayments({
        pendingPayments: [],
        selectedPaymentId: "",
        onSelectPayment,
        setAmount,
      }),
    );

    result.current.selectPayment("payment-1", 25);

    expect(onSelectPayment).toHaveBeenCalledWith("payment-1");
    expect(setAmount).toHaveBeenCalledWith(25);
  });
});
