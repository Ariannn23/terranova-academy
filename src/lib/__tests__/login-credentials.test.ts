import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock, auditMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
  bcryptMock: {
    compare: vi.fn(),
  },
  auditMock: {
    createAuditLog: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  default: bcryptMock,
}));

vi.mock("@/lib/audit", () => ({
  AuditAction: { LOGIN_ATTEMPT: "LOGIN_ATTEMPT" },
  AuditEntity: { USER: "USER" },
  createAuditLog: auditMock.createAuditLog,
}));

const baseUser = {
  id: "u1",
  email: "user@test.com",
  name: "Usuario Test",
  role: "DOCENTE",
  active: true,
  passwordHash: "hashed",
  failedLoginAttempts: 0,
  lockedUntil: null,
  lastFailedLoginAt: null,
};

describe("processCredentialLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("login correcto resetea intentos fallidos", async () => {
    const { processCredentialLogin } = await import("@/lib/auth/login-credentials");

    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      failedLoginAttempts: 2,
      lastFailedLoginAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    bcryptMock.compare.mockResolvedValue(true);
    prismaMock.user.update.mockResolvedValue({
      ...baseUser,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLoginAt: null,
    });

    const result = await processCredentialLogin({
      email: "user@test.com",
      password: "ValidPass123",
    });

    expect(result.success).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastFailedLoginAt: null,
        },
      }),
    );
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ outcome: "success" }),
      }),
    );
  });

  it("contraseña incorrecta incrementa intentos y muestra restantes", async () => {
    const { processCredentialLogin } = await import("@/lib/auth/login-credentials");

    prismaMock.user.findUnique.mockResolvedValue(baseUser);
    bcryptMock.compare.mockResolvedValue(false);
    prismaMock.user.update.mockResolvedValue({
      ...baseUser,
      failedLoginAttempts: 1,
      lockedUntil: null,
    });

    const result = await processCredentialLogin({
      email: "user@test.com",
      password: "WrongPass123",
    });

    expect(result).toMatchObject({
      success: false,
      remainingAttempts: 4,
    });
    expect(result.success === false && result.message).toContain("Te quedan 4 intentos");
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ outcome: "failed" }),
      }),
    );
  });

  it("tras 5 intentos fallidos bloquea por 15 minutos", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-27T12:00:00.000Z"));

    const { processCredentialLogin, LOCKOUT_DURATION_MS } = await import(
      "@/lib/auth/login-credentials"
    );

    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      failedLoginAttempts: 4,
    });
    bcryptMock.compare.mockResolvedValue(false);
    prismaMock.user.update.mockResolvedValue({
      ...baseUser,
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
    });

    const result = await processCredentialLogin({
      email: "user@test.com",
      password: "WrongPass123",
    });

    expect(result.success).toBe(false);
    expect(result.success === false && result.message).toContain(
      "bloqueada temporalmente",
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          failedLoginAttempts: 5,
          lockedUntil: new Date("2026-05-27T12:15:00.000Z"),
        }),
      }),
    );
  });

  it("usuario bloqueado no puede iniciar sesión", async () => {
    const { processCredentialLogin } = await import("@/lib/auth/login-credentials");

    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 10 * 60 * 1000),
    });

    const result = await processCredentialLogin({
      email: "user@test.com",
      password: "ValidPass123",
    });

    expect(result.success).toBe(false);
    expect(result.success === false && result.message).toContain(
      "bloqueada temporalmente",
    );
    expect(bcryptMock.compare).not.toHaveBeenCalled();
  });

  it("usuario inexistente mantiene respuesta genérica", async () => {
    const { processCredentialLogin, GENERIC_LOGIN_ERROR } = await import(
      "@/lib/auth/login-credentials"
    );

    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await processCredentialLogin({
      email: "missing@test.com",
      password: "ValidPass123",
    });

    expect(result).toEqual({
      success: false,
      message: GENERIC_LOGIN_ERROR,
    });
    expect(auditMock.createAuditLog).not.toHaveBeenCalled();
  });

  it("usuario inactivo sigue rechazado con mensaje genérico", async () => {
    const { processCredentialLogin, GENERIC_LOGIN_ERROR } = await import(
      "@/lib/auth/login-credentials"
    );

    prismaMock.user.findUnique.mockResolvedValue({
      ...baseUser,
      active: false,
    });

    const result = await processCredentialLogin({
      email: "user@test.com",
      password: "ValidPass123",
    });

    expect(result).toEqual({
      success: false,
      message: GENERIC_LOGIN_ERROR,
    });
    expect(bcryptMock.compare).not.toHaveBeenCalled();
    expect(auditMock.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ outcome: "inactive" }),
      }),
    );
  });
});
