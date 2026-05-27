import { describe, expect, it } from "vitest";

import {
  PaymentFormSchema,
  RegisterPaymentReceiptSchema,
} from "@/lib/validations/payment.schema";

describe("RegisterPaymentReceiptSchema", () => {
  it("acepta un abono valido", () => {
    const result = RegisterPaymentReceiptSchema.safeParse({
      paymentId: "payment-1",
      amount: "150.75",
      method: "EFECTIVO",
      paidAt: "2026-05-25",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(150.75);
      expect(result.data.paidAt).toBeInstanceOf(Date);
    }
  });

  it("rechaza monto cero", () => {
    const result = RegisterPaymentReceiptSchema.safeParse({
      paymentId: "payment-1",
      amount: 0,
      method: "EFECTIVO",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza monto negativo", () => {
    const result = RegisterPaymentReceiptSchema.safeParse({
      paymentId: "payment-1",
      amount: -10,
      method: "EFECTIVO",
    });

    expect(result.success).toBe(false);
  });

  it("requiere metodo de pago", () => {
    const result = RegisterPaymentReceiptSchema.safeParse({
      paymentId: "payment-1",
      amount: 50,
      method: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("PaymentFormSchema", () => {
  it("valida datos del formulario de pago parcial", () => {
    expect(
      PaymentFormSchema.safeParse({
        paymentId: "payment-1",
        amount: 30,
        method: "TRANSFERENCIA",
      }).success,
    ).toBe(true);
  });

  it("rechaza formularios sin monto positivo", () => {
    expect(
      PaymentFormSchema.safeParse({
        paymentId: "payment-1",
        amount: 0,
        method: "TRANSFERENCIA",
      }).success,
    ).toBe(false);
  });
});
