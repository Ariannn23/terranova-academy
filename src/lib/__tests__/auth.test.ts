import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    handlers: {},
    auth: authMock,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("bcryptjs", () => ({
  default: { compare: vi.fn() },
}));

describe("auth guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requireAuth rechaza usuario sin sesion", async () => {
    const { requireAuth, AuthenticationError } = await import("@/lib/auth");
    authMock.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toBeInstanceOf(AuthenticationError);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("requireAuth rechaza usuario inexistente", async () => {
    const { requireAuth, AuthenticationError } = await import("@/lib/auth");
    authMock.mockResolvedValue({ user: { id: "u-missing" } });
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(requireAuth()).rejects.toBeInstanceOf(AuthenticationError);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u-missing" },
      }),
    );
  });

  it("requireAuth rechaza usuario inactivo", async () => {
    const { requireAuth, AuthenticationError } = await import("@/lib/auth");
    authMock.mockResolvedValue({ user: { id: "u-inactive" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u-inactive",
      email: "inactive@test.com",
      name: "Inactive User",
      role: "DOCENTE",
      active: false,
    });

    await expect(requireAuth()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("requireAuth acepta usuario activo", async () => {
    const { requireAuth } = await import("@/lib/auth");
    authMock.mockResolvedValue({ user: { id: "u-active" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u-active",
      email: "active@test.com",
      name: "Active User",
      role: "caja",
      active: true,
    });

    const user = await requireAuth();

    expect(user).toMatchObject({
      id: "u-active",
      role: "CAJA",
      active: true,
    });
  });

  it("requireRole rechaza usuario inactivo aunque el rol sea permitido", async () => {
    const { requireRole, AuthenticationError } = await import("@/lib/auth");
    authMock.mockResolvedValue({ user: { id: "u-inactive-role" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u-inactive-role",
      email: "inactive.role@test.com",
      name: "Inactive Role User",
      role: "CAJA",
      active: false,
    });

    await expect(requireRole(["CAJA"])).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("requireRole acepta usuario activo con rol permitido", async () => {
    const { requireRole } = await import("@/lib/auth");
    authMock.mockResolvedValue({ user: { id: "u-role-ok" } });
    prismaMock.user.findUnique.mockResolvedValue({
      id: "u-role-ok",
      email: "role.ok@test.com",
      name: "Role OK",
      role: "DIRECTOR",
      active: true,
    });

    const user = await requireRole(["ADMIN", "DIRECTOR"]);

    expect(user).toMatchObject({
      id: "u-role-ok",
      role: "DIRECTOR",
      active: true,
    });
  });
});
