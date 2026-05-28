import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, auditMock, bcryptMock, passwordResetMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passwordResetToken: {
      updateMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    passwordHistory: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn().mockResolvedValue(undefined),
  },
  auditMock: {
    createAuditLog: vi.fn().mockResolvedValue(undefined),
  },
  bcryptMock: {
    hash: vi.fn().mockResolvedValue("hashed_new_password"),
    compare: vi.fn().mockResolvedValue(false),
  },
  passwordResetMock: {
    generatePasswordResetToken: vi.fn(() => "plain-reset-token-for-tests-1234567890"),
    hashPasswordResetToken: vi.fn((token: string) => `hash:${token}`),
    getPasswordResetExpiresAt: vi.fn(
      () => new Date("2026-05-28T10:30:00.000Z"),
    ),
    buildPasswordResetUrl: vi.fn(
      (token: string) => `http://localhost:3000/reset-password?token=${token}`,
    ),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ sent: true }),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({ signIn: vi.fn() }));
vi.mock("bcryptjs", () => ({
  default: { hash: bcryptMock.hash, compare: bcryptMock.compare },
}));
vi.mock("@/lib/audit", () => ({
  AuditAction: {
    REQUEST_PASSWORD_RESET: "REQUEST_PASSWORD_RESET",
    RESET_PASSWORD: "RESET_PASSWORD",
  },
  AuditEntity: { USER: "USER" },
  createAuditLog: auditMock.createAuditLog,
}));
vi.mock("@/lib/auth/password-reset", () => passwordResetMock);

describe("password reset actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockResolvedValue(undefined);
  });

  it("solicitud de recuperacion usa mensaje generico si no existe usuario", async () => {
    const { requestPasswordResetAction } = await import(
      "@/lib/actions/auth.actions"
    );

    prismaMock.user.findUnique.mockResolvedValue(null);

    const result = await requestPasswordResetAction({
      email: "missing@terranova.edu.pe",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("Si la cuenta existe");
    expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
  });

  it("crea token hasheado y envia correo al email de recuperacion", async () => {
    const { requestPasswordResetAction } = await import(
      "@/lib/actions/auth.actions"
    );

    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      name: "Usuario Demo",
      email: "usuario@terranova.edu.pe",
      active: true,
      recoveryEmail: "usuario.demo@gmail.com",
    });

    const result = await requestPasswordResetAction({
      email: "usuario@terranova.edu.pe",
    });

    expect(result.success).toBe(true);
    expect(result.devResetUrl).toContain("/reset-password?token=");
    expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith({
      data: {
        userId: "u1",
        tokenHash: "hash:plain-reset-token-for-tests-1234567890",
        expiresAt: new Date("2026-05-28T10:30:00.000Z"),
      },
    });
    expect(passwordResetMock.sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "usuario.demo@gmail.com",
      }),
    );
  });

  it("confirma recuperacion y marca token como usado", async () => {
    const { confirmPasswordResetAction } = await import(
      "@/lib/actions/auth.actions"
    );

    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "token1",
      userId: "u1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user: {
        id: "u1",
        email: "usuario@terranova.edu.pe",
        active: true,
      },
    });

    const result = await confirmPasswordResetAction({
      token: "plain-reset-token-for-tests-1234567890",
      password: "NuevaPassword123",
    });

    expect(result.success).toBe(true);
    expect(bcryptMock.hash).toHaveBeenCalledWith("NuevaPassword123", 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({
          passwordHash: "hashed_new_password",
          failedLoginAttempts: 0,
          lockedUntil: null,
        }),
      }),
    );
    expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "token1" },
        data: expect.objectContaining({ usedAt: expect.any(Date) }),
      }),
    );
  });

  it("rechaza token expirado o usado", async () => {
    const { confirmPasswordResetAction } = await import(
      "@/lib/actions/auth.actions"
    );

    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "token1",
      userId: "u1",
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user: { id: "u1", email: "usuario@terranova.edu.pe", active: true },
    });

    const result = await confirmPasswordResetAction({
      token: "plain-reset-token-for-tests-1234567890",
      password: "NuevaPassword123",
    });

    expect(result.success).toBe(false);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("devuelve error controlado si la contrasena fue usada recientemente", async () => {
    const { confirmPasswordResetAction } = await import(
      "@/lib/actions/auth.actions"
    );

    prismaMock.passwordResetToken.findUnique.mockResolvedValue({
      id: "token1",
      userId: "u1",
      usedAt: null,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user: {
        id: "u1",
        email: "usuario@terranova.edu.pe",
        active: true,
        passwordHash: "current_hash",
      },
    });
    bcryptMock.compare.mockResolvedValueOnce(true);

    const result = await confirmPasswordResetAction({
      token: "plain-reset-token-for-tests-1234567890",
      password: "NuevaPassword123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("ultimas 3");
    }
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
