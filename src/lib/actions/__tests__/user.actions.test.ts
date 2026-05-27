// src/lib/actions/__tests__/user.actions.test.ts
// Tests de integración para user.actions — valida seguridad RBAC, hashing y reglas de negocio

import { beforeEach, describe, expect, it, vi } from "vitest";
import { allowRole } from "@/test/integration/test-auth";

const { prismaMock, requireRoleMock, createAuditLogMock, revalidatePathMock, bcryptMock } =
  vi.hoisted(() => ({
    prismaMock: {
      user: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
      },
    },
    requireRoleMock: vi.fn(),
    createAuditLogMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    bcryptMock: {
      hash: vi.fn().mockResolvedValue("hashed_password_value"),
    },
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
    UPDATE: "UPDATE",
    CHANGE_STATUS: "CHANGE_STATUS",
  },
  AuditEntity: { USER: "USER" },
  createAuditLog: createAuditLogMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("bcryptjs", () => ({ default: { hash: bcryptMock.hash } }));

// ─── getUsers ────────────────────────────────────────────────────────────────
describe("getUsers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige rol ADMIN", async () => {
    const { getUsers } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findMany.mockResolvedValue([]);

    await getUsers();

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN"]);
  });

  it("no devuelve passwordHash en los usuarios", async () => {
    const { getUsers } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    // El mock devuelve usuarios SIN passwordHash (como lo haría el select seguro)
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "u1",
        name: "Admin",
        email: "admin@test.com",
        role: "ADMIN",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getUsers();

    expect(result.success).toBe(true);
    if (result.success) {
      result.data.forEach((u) => {
        expect(u).not.toHaveProperty("passwordHash");
      });
    }
  });
});

// ─── createUser ───────────────────────────────────────────────────────────────
describe("createUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige rol ADMIN", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "u1",
      name: "Test",
      email: "test@test.com",
      role: "DOCENTE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createUser({
      name: "Test User",
      email: "test@test.com",
      role: "DOCENTE",
      password: "SecurePass123",
    });

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN"]);
  });

  it("hashea la contraseña antes de guardar", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "u1",
      name: "Test User",
      email: "test@test.com",
      role: "DOCENTE",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await createUser({
      name: "Test User",
      email: "test@test.com",
      role: "DOCENTE",
      password: "SecurePass123",
    });

    // bcrypt.hash fue llamado con la contraseña y factor 12
    expect(bcryptMock.hash).toHaveBeenCalledWith("SecurePass123", 12);

    // El create de Prisma NO recibió la contraseña en texto plano
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: "hashed_password_value",
        }),
      }),
    );

    // Verificar que data.password nunca llegó a Prisma
    const createCall = prismaMock.user.create.mock.calls[0][0];
    expect(createCall.data).not.toHaveProperty("password");
  });

  it("rechaza email duplicado", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    // Email ya existe
    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing",
      email: "test@test.com",
    });

    const result = await createUser({
      name: "Test User",
      email: "test@test.com",
      role: "DOCENTE",
      password: "SecurePass123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("correo electrónico");
    }
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rechaza datos inválidos sin llegar a Prisma", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    const result = await createUser({ name: "", email: "no-email", role: "INVALID", password: "abc" });

    expect(result.success).toBe(false);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});

// ─── changeUserRole ───────────────────────────────────────────────────────────
describe("changeUserRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige rol ADMIN", async () => {
    const { changeUserRole } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      name: "Director",
      email: "d@test.com",
      role: "DIRECTOR",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    prismaMock.user.update.mockResolvedValue({
      id: "u1",
      name: "Director",
      email: "d@test.com",
      role: "COORDINADOR",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await changeUserRole({ userId: "u1", role: "COORDINADOR" });

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN"]);
  });

  it("no permite degradar al único ADMIN del sistema", async () => {
    const { changeUserRole } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    // El usuario objetivo es ADMIN
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      name: "Admin",
      email: "admin@test.com",
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Solo hay 1 ADMIN
    prismaMock.user.count.mockResolvedValue(1);

    const result = await changeUserRole({ userId: "u1", role: "DIRECTOR" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("único ADMIN");
    }
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rechaza rol inválido", async () => {
    const { changeUserRole } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    const result = await changeUserRole({ userId: "u1", role: "SUPERADMIN" });

    expect(result.success).toBe(false);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});

// ─── resetUserPassword ────────────────────────────────────────────────────────
describe("resetUserPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hashea la nueva contraseña antes de guardar", async () => {
    const { resetUserPassword } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u1",
      email: "user@test.com",
    });
    prismaMock.user.update.mockResolvedValue({ id: "u1" });

    await resetUserPassword({ userId: "u1", password: "NewPassword123" });

    expect(bcryptMock.hash).toHaveBeenCalledWith("NewPassword123", 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: "hashed_password_value" }),
      }),
    );

    // Confirmar que la contraseña en texto plano no se pasó a Prisma
    const updateCall = prismaMock.user.update.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty("password");
  });

  it("rechaza contraseña menor a 8 caracteres", async () => {
    const { resetUserPassword } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    const result = await resetUserPassword({ userId: "u1", password: "abc" });

    expect(result.success).toBe(false);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});
