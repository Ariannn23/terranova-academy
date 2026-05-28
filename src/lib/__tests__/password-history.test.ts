import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, bcryptMock } = vi.hoisted(() => ({
  prismaMock: {
    passwordHistory: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
  bcryptMock: {
    compare: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("bcryptjs", () => ({ default: bcryptMock }));

describe("password history", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza reutilizar la contrasena actual", async () => {
    const { assertPasswordWasNotRecentlyUsed, PASSWORD_REUSE_ERROR } =
      await import("@/lib/auth/password-history");

    prismaMock.passwordHistory.findMany.mockResolvedValue([]);
    bcryptMock.compare.mockResolvedValueOnce(true);

    await expect(
      assertPasswordWasNotRecentlyUsed({
        userId: "u1",
        newPassword: "Terranova2026!",
        currentPasswordHash: "current_hash",
      }),
    ).rejects.toThrow(PASSWORD_REUSE_ERROR);
  });

  it("rechaza reutilizar una de las ultimas 3 contrasenas", async () => {
    const { assertPasswordWasNotRecentlyUsed } = await import(
      "@/lib/auth/password-history"
    );

    prismaMock.passwordHistory.findMany.mockResolvedValue([
      { passwordHash: "hash_1" },
      { passwordHash: "hash_2" },
      { passwordHash: "hash_3" },
    ]);
    bcryptMock.compare
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);

    await expect(
      assertPasswordWasNotRecentlyUsed({
        userId: "u1",
        newPassword: "Terranova2026!",
      }),
    ).rejects.toThrow(/ultimas 3/);
  });

  it("registra nuevo hash y conserva solo 3 entradas", async () => {
    const { recordPasswordHistory } = await import(
      "@/lib/auth/password-history"
    );

    prismaMock.passwordHistory.findMany.mockResolvedValue([
      { id: "h3" },
      { id: "h2" },
      { id: "h1" },
    ]);

    await recordPasswordHistory({
      userId: "u1",
      passwordHash: "new_hash",
    });

    expect(prismaMock.passwordHistory.create).toHaveBeenCalledWith({
      data: { userId: "u1", passwordHash: "new_hash" },
    });
    expect(prismaMock.passwordHistory.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: "u1",
        id: { notIn: ["h3", "h2", "h1"] },
      },
    });
  });
});
