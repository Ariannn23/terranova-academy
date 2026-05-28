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

// Helpers
const makeSafeUser = (overrides: Partial<{
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}) => ({
  id: "u1",
  name: "Test User",
  email: "test@test.com",
  role: "DOCENTE",
  active: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

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

  it("no devuelve passwordHash y devuelve active en los usuarios", async () => {
    const { getUsers } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    prismaMock.user.findMany.mockResolvedValue([
      makeSafeUser({ active: true }),
      makeSafeUser({ id: "u2", active: false }),
    ]);

    const result = await getUsers();

    expect(result.success).toBe(true);
    if (result.success) {
      result.data.forEach((u) => {
        expect(u).not.toHaveProperty("passwordHash");
        expect(u).toHaveProperty("active");
      });
      expect(result.data[0].active).toBe(true);
      expect(result.data[1].active).toBe(false);
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
    prismaMock.user.create.mockResolvedValue(makeSafeUser());

    await createUser({
      name: "Test User",
      email: "test@terranova.edu.pe",
      role: "DOCENTE",
      password: "SecurePass123",
    });

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN"]);
  });

  it("hashea la contraseña antes de guardar y crea con active: true", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(makeSafeUser());

    await createUser({
      name: "Test User",
      email: "test@terranova.edu.pe",
      role: "DOCENTE",
      password: "SecurePass123",
    });

    expect(bcryptMock.hash).toHaveBeenCalledWith("SecurePass123", 12);
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: "hashed_password_value",
          active: true,
        }),
      }),
    );

    const createCall = prismaMock.user.create.mock.calls[0][0];
    expect(createCall.data).not.toHaveProperty("password");
  });

  it("usa la contraseña enviada y no fuerza Admin1234!", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(makeSafeUser());

    await createUser({
      name: "Caja Test",
      email: "caja@terranova.edu.pe",
      role: "CAJA",
      password: "Terranova2026!",
    });

    expect(bcryptMock.hash).toHaveBeenCalledWith("Terranova2026!", 12);
    expect(bcryptMock.hash).not.toHaveBeenCalledWith("Admin1234!", 12);
  });

  it("rechaza email duplicado", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue({
      id: "existing",
      email: "test@terranova.edu.pe",
    });

    const result = await createUser({
      name: "Test User",
      email: "test@terranova.edu.pe",
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

  it("acepta correo institucional", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(
      makeSafeUser({ email: "caja@terranova.edu.pe" }),
    );

    const result = await createUser({
      name: "Caja Operativa",
      email: "caja@terranova.edu.pe",
      role: "CAJA",
      password: "Terranova2026!",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza correo externo", async () => {
    const { createUser } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    const result = await createUser({
      name: "Caja Externa",
      email: "caja@gmail.com",
      role: "CAJA",
      password: "Terranova2026!",
    });

    expect(result.success).toBe(false);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });
});

// ─── changeUserRole ───────────────────────────────────────────────────────────
describe("changeUserRole", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige rol ADMIN", async () => {
    const { changeUserRole } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(makeSafeUser({ role: "DIRECTOR" }));
    prismaMock.user.update.mockResolvedValue(makeSafeUser({ role: "COORDINADOR" }));

    await changeUserRole({ userId: "u1", role: "COORDINADOR" });

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN"]);
  });

  it("no permite degradar al único ADMIN activo del sistema", async () => {
    const { changeUserRole } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    prismaMock.user.findUnique.mockResolvedValue(
      makeSafeUser({ role: "ADMIN", active: true }),
    );
    // Solo 1 ADMIN activo
    prismaMock.user.count.mockResolvedValue(1);

    const result = await changeUserRole({ userId: "u1", role: "DIRECTOR" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("único ADMIN activo");
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
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "user@test.com" });
    prismaMock.user.update.mockResolvedValue({ id: "u1" });

    await resetUserPassword({ userId: "u1", password: "NewPassword123" });

    expect(bcryptMock.hash).toHaveBeenCalledWith("NewPassword123", 12);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ passwordHash: "hashed_password_value" }),
      }),
    );

    const updateCall = prismaMock.user.update.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty("password");
  });

  it("actualiza passwordHash en la tabla User", async () => {
    const { resetUserPassword } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1", email: "user@test.com" });
    prismaMock.user.update.mockResolvedValue({ id: "u1" });

    await resetUserPassword({ userId: "u1", password: "NuevaCaja2026!" });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { passwordHash: "hashed_password_value" },
    });
  });

  it("rechaza contraseña menor a 10 caracteres", async () => {
    const { resetUserPassword } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    const result = await resetUserPassword({ userId: "u1", password: "abc" });

    expect(result.success).toBe(false);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });
});

// ─── toggleUserStatus ─────────────────────────────────────────────────────────
describe("toggleUserStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exige rol ADMIN", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(makeSafeUser({ active: true }));
    prismaMock.user.update.mockResolvedValue(makeSafeUser({ active: false }));

    await toggleUserStatus({ userId: "u1", active: false });

    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN"]);
  });

  it("activa un usuario inactivo correctamente", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(makeSafeUser({ active: false, role: "DOCENTE" }));
    prismaMock.user.update.mockResolvedValue(makeSafeUser({ active: true }));

    const result = await toggleUserStatus({ userId: "u1", active: true });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain("activado");
      expect(result.data.active).toBe(true);
    }
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: { active: true },
      }),
    );
  });

  it("desactiva un usuario activo correctamente", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(makeSafeUser({ active: true, role: "DOCENTE" }));
    prismaMock.user.update.mockResolvedValue(makeSafeUser({ active: false }));

    const result = await toggleUserStatus({ userId: "u1", active: false });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.message).toContain("desactivado");
    }
  });

  it("no permite desactivar al único ADMIN activo del sistema", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    // Usuario objetivo es ADMIN activo
    prismaMock.user.findUnique.mockResolvedValue(
      makeSafeUser({ role: "ADMIN", active: true }),
    );
    // Solo 1 ADMIN activo
    prismaMock.user.count.mockResolvedValue(1);

    const result = await toggleUserStatus({ userId: "u1", active: false });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error).toContain("único ADMIN activo");
    }
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("no devuelve passwordHash en la respuesta", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(makeSafeUser({ active: true, role: "DOCENTE" }));
    prismaMock.user.update.mockResolvedValue(makeSafeUser({ active: false }));

    const result = await toggleUserStatus({ userId: "u1", active: false });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("passwordHash");
    }
  });

  it("audita el cambio de estado", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.user.findUnique.mockResolvedValue(makeSafeUser({ active: true, role: "DOCENTE" }));
    prismaMock.user.update.mockResolvedValue(makeSafeUser({ active: false }));

    await toggleUserStatus({ userId: "u1", active: false });

    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CHANGE_STATUS",
        entity: "USER",
        entityId: "u1",
      }),
    );
  });

  it("rechaza datos inválidos sin llegar a Prisma", async () => {
    const { toggleUserStatus } = await import("@/lib/actions/user.actions");
    allowRole(requireRoleMock, "ADMIN");

    // active faltante
    const result = await toggleUserStatus({ userId: "u1" });

    expect(result.success).toBe(false);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });
});
