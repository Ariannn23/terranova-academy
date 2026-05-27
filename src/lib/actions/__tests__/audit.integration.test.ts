import { beforeEach, describe, expect, it, vi } from "vitest";
import { allowRole } from "@/test/integration/test-auth";

const { prismaMock, getCurrentUserMock, requireRoleMock } = vi.hoisted(() => ({
  prismaMock: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
  getCurrentUserMock: vi.fn(),
  requireRoleMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: getCurrentUserMock,
  requireRole: requireRoleMock,
  requireAuth: vi.fn(),
}));

describe("audit integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({
      id: "user_admin",
      email: "admin@test.local",
      role: "ADMIN",
    });
  });

  it("createAuditLog crea registro con usuario actual y sanitiza datos sensibles", async () => {
    const { createAuditLog } = await import("@/lib/audit");

    await createAuditLog({
      action: "UPDATE",
      entity: "STUDENT",
      entityId: "student_1",
      oldValue: { status: "ACTIVO", passwordHash: "hash" },
      newValue: { status: "OBSERVADO", token: "secret-token" },
      metadata: { module: "students" },
    });

    expect(prismaMock.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user_admin",
        userEmail: "admin@test.local",
        userRole: "ADMIN",
        action: "UPDATE",
        entity: "STUDENT",
        entityId: "student_1",
        oldValue: expect.objectContaining({ passwordHash: "[REDACTED]" }),
        newValue: expect.objectContaining({ token: "[REDACTED]" }),
      }),
    });
  });

  it("createAuditLog no rompe la accion principal si Prisma falla", async () => {
    const { createAuditLog } = await import("@/lib/audit");
    prismaMock.auditLog.create.mockRejectedValue(new Error("DB unavailable"));

    await expect(
      createAuditLog({
        action: "CREATE",
        entity: "PAYMENT",
        entityId: "payment_1",
      }),
    ).resolves.toBeUndefined();
  });

  it("getAuditLogs exige rol administrativo y limita filtros", async () => {
    const { getAuditLogs } = await import("@/lib/actions/audit.actions");
    allowRole(requireRoleMock, "DIRECTOR");
    prismaMock.auditLog.findMany.mockResolvedValue([{ id: "audit_1" }]);

    const result = await getAuditLogs({
      entity: "PAYMENT",
      entityId: "payment_1",
      limit: 300,
    });

    expect(result.success).toBe(true);
    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN", "DIRECTOR"]);
    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          entity: "PAYMENT",
          entityId: "payment_1",
        },
        take: 250,
      }),
    );
  });

  it("getAuditLogsByEntity filtra por entidad e id", async () => {
    const { getAuditLogsByEntity } = await import("@/lib/actions/audit.actions");
    allowRole(requireRoleMock, "ADMIN");
    prismaMock.auditLog.findMany.mockResolvedValue([{ id: "audit_2" }]);

    const result = await getAuditLogsByEntity("ENROLLMENT", "enrollment_1");

    expect(result.success).toBe(true);
    expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entity: "ENROLLMENT", entityId: "enrollment_1" },
      }),
    );
  });
});
