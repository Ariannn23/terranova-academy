import { describe, expect, it } from "vitest";

import {
  calculateDebtTotal,
  calculatePaidTotal,
  calculatePaymentBalance,
  getPaymentStatusConfig,
  isPaymentOverdue,
} from "@/services/payment.service";

describe("payment.service", () => {
  it("calcula total pagado con varias transacciones", () => {
    expect(calculatePaidTotal([{ amount: 50 }, { amount: 25.5 }])).toBe(75.5);
  });

  it("calcula total pagado sin transacciones", () => {
    expect(calculatePaidTotal()).toBe(0);
  });

  it("usa balance existente si esta disponible", () => {
    expect(calculatePaymentBalance({ amount: 100, balance: 30 })).toBe(30);
  });

  it("calcula balance desde monto menos transacciones", () => {
    expect(
      calculatePaymentBalance({
        amount: 100,
        transactions: [{ amount: 40 }, { amount: 15 }],
      }),
    ).toBe(45);
  });

  it("calcula deuda total solo para pendiente y vencido", () => {
    expect(
      calculateDebtTotal([
        { amount: 100, balance: 60, status: "PENDIENTE" },
        { amount: 100, balance: 20, status: "VENCIDO" },
        { amount: 100, balance: 0, status: "PAGADO" },
      ]),
    ).toBe(80);
  });

  it("detecta pago vencido con deuda y fecha vencida", () => {
    expect(
      isPaymentOverdue(
        { amount: 100, balance: 10, status: "PENDIENTE", dueDate: "2026-01-01" },
        new Date("2026-05-26"),
      ),
    ).toBe(true);
  });

  it("no marca vencido si balance es cero", () => {
    expect(
      isPaymentOverdue(
        { amount: 100, balance: 0, status: "PENDIENTE", dueDate: "2026-01-01" },
        new Date("2026-05-26"),
      ),
    ).toBe(false);
  });

  it("devuelve configuracion de estado", () => {
    expect(getPaymentStatusConfig("PENDIENTE").label).toBe("Pendiente");
    expect(getPaymentStatusConfig("PAGADO").label).toBe("Pagado");
    expect(getPaymentStatusConfig("VENCIDO").label).toBe("Vencido");
    expect(getPaymentStatusConfig("OTRO").label).toBe("OTRO");
  });
});
