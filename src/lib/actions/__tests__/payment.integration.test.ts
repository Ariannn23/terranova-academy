import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPaymentFixture } from "@/test/integration/test-fixtures";
import { allowRole, denyRole } from "@/test/integration/test-auth";

const { prismaMock, requireRoleMock, createAuditLogMock, revalidatePathMock } =
  vi.hoisted(() => ({
    prismaMock: {
      $transaction: vi.fn(),
    },
    requireRoleMock: vi.fn(),
    createAuditLogMock: vi.fn(),
    revalidatePathMock: vi.fn(),
  }));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  requireRole: requireRoleMock,
  requireAuth: vi.fn(),
  getCurrentUser: vi.fn(),
}));
vi.mock("@/lib/audit", () => ({
  AuditAction: { REGISTER_PAYMENT: "REGISTER_PAYMENT" },
  AuditEntity: { PAYMENT_TRANSACTION: "PAYMENT_TRANSACTION" },
  createAuditLog: createAuditLogMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

function createPaymentTxMock(balance: number) {
  const paidAt = new Date("2026-03-15T12:00:00.000Z");
  const payment = createPaymentFixture(balance);

  return {
    payment: {
      findUnique: vi.fn().mockResolvedValue(payment),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...payment,
          ...data,
          transactions: [],
        }),
      ),
    },
    paymentTransaction: {
      create: vi.fn().mockResolvedValue({
        id: "transaction_1",
        paymentId: "payment_1",
        amount: 0,
        method: "EFECTIVO",
        paidAt,
      }),
    },
  };
}

describe("registerPayment integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    allowRole(requireRoleMock, "CAJA");
  });

  it("registra pago parcial, actualiza saldo y audita transaccion", async () => {
    const { registerPayment } = await import("@/lib/actions/payment.actions");
    const tx = createPaymentTxMock(300);
    tx.paymentTransaction.create.mockResolvedValue({
      id: "transaction_1",
      paymentId: "payment_1",
      amount: 100,
      method: "EFECTIVO",
      paidAt: new Date("2026-03-15T12:00:00.000Z"),
    });
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await registerPayment({
      paymentId: "payment_1",
      amount: 100,
      method: "EFECTIVO",
      paidAt: new Date("2026-03-15T12:00:00.000Z"),
    });

    expect(result.success).toBe(true);
    expect(tx.paymentTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        paymentId: "payment_1",
        amount: 100,
        method: "EFECTIVO",
        createdBy: "user_caja",
      }),
    });
    expect(tx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          balance: 200,
          status: "PENDIENTE",
        }),
      }),
    );
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "REGISTER_PAYMENT",
        entity: "PAYMENT_TRANSACTION",
        entityId: "transaction_1",
      }),
    );
  });

  it("registra pago total y cambia estado a PAGADO", async () => {
    const { registerPayment } = await import("@/lib/actions/payment.actions");
    const tx = createPaymentTxMock(300);
    tx.paymentTransaction.create.mockResolvedValue({
      id: "transaction_2",
      paymentId: "payment_1",
      amount: 300,
      method: "TRANSFERENCIA",
      paidAt: new Date("2026-03-15T12:00:00.000Z"),
    });
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await registerPayment({
      paymentId: "payment_1",
      amount: 300,
      method: "TRANSFERENCIA",
      paidAt: new Date("2026-03-15T12:00:00.000Z"),
    });

    expect(result.success).toBe(true);
    expect(tx.payment.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          balance: 0,
          status: "PAGADO",
        }),
      }),
    );
  });

  it("rechaza abono mayor al saldo sin crear transaccion", async () => {
    const { registerPayment } = await import("@/lib/actions/payment.actions");
    const tx = createPaymentTxMock(100);
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await registerPayment({
      paymentId: "payment_1",
      amount: 150,
      method: "EFECTIVO",
      paidAt: new Date("2026-03-15T12:00:00.000Z"),
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("excede");
    expect(tx.paymentTransaction.create).not.toHaveBeenCalled();
    expect(tx.payment.update).not.toHaveBeenCalled();
  });

  it("rechaza monto cero antes de abrir transaccion", async () => {
    const { registerPayment } = await import("@/lib/actions/payment.actions");

    const result = await registerPayment({
      paymentId: "payment_1",
      amount: 0,
      method: "EFECTIVO",
      paidAt: new Date("2026-03-15T12:00:00.000Z"),
    });

    expect(result.success).toBe(false);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("deniega registro cuando el rol no pertenece a FINANCE", async () => {
    const { registerPayment } = await import("@/lib/actions/payment.actions");
    denyRole(requireRoleMock);

    await expect(
      registerPayment({
        paymentId: "payment_1",
        amount: 100,
        method: "EFECTIVO",
        paidAt: new Date("2026-03-15T12:00:00.000Z"),
      }),
    ).rejects.toThrow("No autorizado");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
