import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auditLogCreate: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: mocks.auditLogCreate,
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

import {
  AuditAction,
  AuditEntity,
  createAuditLog,
  safeSerializeAuditValue,
} from "@/lib/audit";

describe("safeSerializeAuditValue", () => {
  it("redacta campos sensibles antes de guardar auditoria", () => {
    const value = safeSerializeAuditValue({
      email: "admin@terranova.test",
      password: "secret-password",
      passwordHash: "hashed-password",
      nested: {
        token: "session-token",
        accessToken: "access-token",
        refreshToken: "refresh-token",
        authorization: "Bearer token",
        cookie: "sid=value",
        secret: "private-secret",
      },
    }) as Record<string, unknown>;

    expect(value.password).toBe("[REDACTED]");
    expect(value.passwordHash).toBe("[REDACTED]");
    expect(value.email).toBe("admin@terranova.test");
    expect(value.nested).toMatchObject({
      token: "[REDACTED]",
      accessToken: "[REDACTED]",
      refreshToken: "[REDACTED]",
      authorization: "[REDACTED]",
      cookie: "[REDACTED]",
      secret: "[REDACTED]",
    });
  });

  it("mantiene metadata normal de negocio", () => {
    const value = safeSerializeAuditValue({
      entityId: "payment-1",
      action: AuditAction.REGISTER_PAYMENT,
      amount: 120.5,
      status: "PENDIENTE",
    }) as Record<string, unknown>;

    expect(value).toEqual({
      entityId: "payment-1",
      action: "REGISTER_PAYMENT",
      amount: 120.5,
      status: "PENDIENTE",
    });
  });
});

describe("createAuditLog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("crea auditoria con el usuario actual cuando esta disponible", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      id: "user-1",
      email: "admin@terranova.test",
      role: "ADMIN",
    });
    mocks.auditLogCreate.mockResolvedValue({ id: "audit-1" });

    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.STUDENT,
      entityId: "student-1",
      newValue: { dni: "12345678" },
    });

    expect(mocks.auditLogCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        userEmail: "admin@terranova.test",
        userRole: "ADMIN",
        action: "CREATE",
        entity: "STUDENT",
        entityId: "student-1",
      }),
    });
  });

  it("no lanza excepcion si Prisma falla", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.auditLogCreate.mockRejectedValue(new Error("database unavailable"));

    await expect(
      createAuditLog({
        action: AuditAction.EXPORT_REPORT,
        entity: AuditEntity.REPORT,
      }),
    ).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      "[AUDIT_LOG_ERROR]",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
