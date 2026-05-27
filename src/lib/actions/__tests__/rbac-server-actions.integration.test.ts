import { beforeEach, describe, expect, it, vi } from "vitest";
import { allowRole } from "@/test/integration/test-auth";

const { prismaMock, requireRoleMock, createAuditLogMock, revalidatePathMock } =
  vi.hoisted(() => ({
    prismaMock: {
      academicYear: { findUnique: vi.fn() },
      section: { findUnique: vi.fn() },
      paymentConcept: { findMany: vi.fn() },
      payment: { findMany: vi.fn(), findUnique: vi.fn() },
      paymentTransaction: { findMany: vi.fn() },
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
  AuditAction: {
    CREATE: "CREATE",
    REGISTER_PAYMENT: "REGISTER_PAYMENT",
    EXPORT_REPORT: "EXPORT_REPORT",
  },
  AuditEntity: {
    ENROLLMENT: "ENROLLMENT",
    PAYMENT_TRANSACTION: "PAYMENT_TRANSACTION",
    REPORT: "REPORT",
  },
  createAuditLog: createAuditLogMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

describe("RBAC en Server Actions criticas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createEnrollment exige grupo ADMISSIONS antes de validar datos", async () => {
    const { createEnrollment } = await import("@/lib/actions/enrollment.actions");
    allowRole(requireRoleMock, "RECEPCION");

    await createEnrollment({});

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN", "DIRECTOR", "RECEPCION"]);
    expect(prismaMock.academicYear.findUnique).not.toHaveBeenCalled();
  });

  it("registerPayment exige grupo FINANCE antes de validar datos", async () => {
    const { registerPayment } = await import("@/lib/actions/payment.actions");
    allowRole(requireRoleMock, "CAJA");

    await registerPayment({});

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN", "DIRECTOR", "CAJA"]);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("exportFinancialReport usa permisos financieros estrictos", async () => {
    const { exportFinancialReport } = await import("@/lib/actions/report.actions");
    allowRole(requireRoleMock, "DIRECTOR");
    prismaMock.payment.findMany.mockResolvedValue([]);
    prismaMock.paymentTransaction.findMany.mockResolvedValue([]);

    await exportFinancialReport(2026);

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN", "DIRECTOR", "CAJA"]);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "EXPORT_REPORT",
        entity: "REPORT",
      }),
    );
  });
});
