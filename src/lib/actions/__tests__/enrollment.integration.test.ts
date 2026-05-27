import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  academicYearFixture,
  enrollmentConceptFixture,
  enrollmentInput,
  monthlyConceptFixture,
} from "@/test/integration/test-fixtures";
import { allowRole, denyRole } from "@/test/integration/test-auth";

const { prismaMock, requireRoleMock, createAuditLogMock, revalidatePathMock } =
  vi.hoisted(() => ({
    prismaMock: {
      academicYear: { findUnique: vi.fn() },
      section: { findUnique: vi.fn() },
      paymentConcept: { findMany: vi.fn() },
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
  AuditAction: { CREATE: "CREATE" },
  AuditEntity: { ENROLLMENT: "ENROLLMENT" },
  createAuditLog: createAuditLogMock,
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

describe("createEnrollment integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    allowRole(requireRoleMock, "RECEPCION");
  });

  it("crea matricula cuando la seccion tiene vacantes y genera pagos automaticos", async () => {
    const { createEnrollment } = await import("@/lib/actions/enrollment.actions");
    const enrollment = { id: "enrollment_1", ...enrollmentInput };

    prismaMock.academicYear.findUnique.mockResolvedValue(academicYearFixture);
    prismaMock.section.findUnique.mockResolvedValue({
      capacity: 2,
      _count: { enrollments: 1 },
    });
    prismaMock.paymentConcept.findMany
      .mockResolvedValueOnce([monthlyConceptFixture])
      .mockResolvedValueOnce([enrollmentConceptFixture]);

    const tx = {
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(enrollment),
      },
      section: {
        findUnique: vi.fn().mockResolvedValue({
          capacity: 2,
          _count: { enrollments: 1 },
        }),
      },
      student: {
        findUnique: vi.fn().mockResolvedValue({ id: "student_1", code: "2026P0001" }),
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      payment: {
        createMany: vi.fn().mockResolvedValue({ count: 11 }),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await createEnrollment(enrollmentInput);

    expect(result.success).toBe(true);
    expect(tx.enrollment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        studentId: "student_1",
        sectionId: "section_1",
        academicYearId: "year_2026",
      }),
    });
    expect(tx.payment.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          enrollmentId: "enrollment_1",
          conceptId: "concept_enrollment",
          amount: enrollmentConceptFixture.amount,
          balance: enrollmentConceptFixture.amount,
        }),
      ]),
    });
    expect(tx.payment.createMany.mock.calls[0][0].data).toHaveLength(11);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "CREATE",
        entity: "ENROLLMENT",
        entityId: "enrollment_1",
      }),
    );
  });

  it("bloquea matricula cuando capacity esta completa antes de abrir transaccion", async () => {
    const { createEnrollment } = await import("@/lib/actions/enrollment.actions");

    prismaMock.academicYear.findUnique.mockResolvedValue(academicYearFixture);
    prismaMock.section.findUnique.mockResolvedValue({
      capacity: 1,
      _count: { enrollments: 1 },
    });
    prismaMock.paymentConcept.findMany
      .mockResolvedValueOnce([monthlyConceptFixture])
      .mockResolvedValueOnce([enrollmentConceptFixture]);

    const result = await createEnrollment(enrollmentInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain("vacantes");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it("bloquea matricula si la seccion se llena dentro de la transaccion", async () => {
    const { createEnrollment } = await import("@/lib/actions/enrollment.actions");

    prismaMock.academicYear.findUnique.mockResolvedValue(academicYearFixture);
    prismaMock.section.findUnique.mockResolvedValue({
      capacity: 2,
      _count: { enrollments: 1 },
    });
    prismaMock.paymentConcept.findMany
      .mockResolvedValueOnce([monthlyConceptFixture])
      .mockResolvedValueOnce([enrollmentConceptFixture]);

    const tx = {
      enrollment: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
      },
      section: {
        findUnique: vi.fn().mockResolvedValue({
          capacity: 1,
          _count: { enrollments: 1 },
        }),
      },
    };
    prismaMock.$transaction.mockImplementation(async (callback) => callback(tx));

    const result = await createEnrollment(enrollmentInput);

    expect(result.success).toBe(false);
    expect(result.error).toContain("vacantes");
    expect(tx.enrollment.create).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it("deniega ejecucion cuando el rol no pertenece a ADMISSIONS", async () => {
    const { createEnrollment } = await import("@/lib/actions/enrollment.actions");
    denyRole(requireRoleMock);

    await expect(createEnrollment(enrollmentInput)).rejects.toThrow("No autorizado");
    expect(prismaMock.academicYear.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
