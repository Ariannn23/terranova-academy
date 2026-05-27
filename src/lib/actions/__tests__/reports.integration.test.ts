import { beforeEach, describe, expect, it, vi } from "vitest";
import { allowRole } from "@/test/integration/test-auth";

const { prismaMock, requireRoleMock, createAuditLogMock } = vi.hoisted(() => ({
  prismaMock: {
    section: { findUnique: vi.fn() },
    payment: { findMany: vi.fn() },
    paymentTransaction: { findMany: vi.fn() },
  },
  requireRoleMock: vi.fn(),
  createAuditLogMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  requireRole: requireRoleMock,
  requireAuth: vi.fn(),
  getCurrentUser: vi.fn(),
}));
vi.mock("@/lib/audit", () => ({
  AuditAction: { EXPORT_REPORT: "EXPORT_REPORT" },
  AuditEntity: { REPORT: "REPORT" },
  createAuditLog: createAuditLogMock,
}));
vi.mock("@/lib/actions/grade.actions", () => ({
  getSectionGradeReport: vi.fn().mockResolvedValue({
    success: true,
    data: {
      ranking: [
        {
          studentId: "12345678",
          name: "Ana Torres",
          average: 16,
          failingCount: 0,
          status: "APROBADO",
          grades: [{ courseName: "Matematica", score: 16 }],
        },
      ],
    },
  }),
}));
vi.mock("@/lib/actions/attendance.actions", () => ({
  getSectionAttendanceReport: vi.fn().mockResolvedValue({
    success: true,
    data: {
      planilla: [
        {
          studentDni: "12345678",
          studentName: "Ana Torres",
          summary: {
            total: 10,
            presente: 9,
            tardanza: 1,
            injustificada: 0,
            justificada: 0,
          },
        },
      ],
    },
  }),
}));

describe("report actions integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.section.findUnique.mockResolvedValue({
      id: "section_1",
      name: "A",
      gradeLevel: { name: "Primero" },
    });
  });

  it("exportFinancialReport permite roles financieros y audita metadata sin archivo completo", async () => {
    const { exportFinancialReport } = await import("@/lib/actions/report.actions");
    allowRole(requireRoleMock, "CAJA");
    prismaMock.payment.findMany.mockResolvedValue([
      { status: "PENDIENTE", balance: 100, concept: { name: "Mensualidad" } },
      { status: "VENCIDO", balance: 50, concept: { name: "Mensualidad" } },
    ]);
    prismaMock.paymentTransaction.findMany.mockResolvedValue([
      {
        amount: 200,
        paidAt: new Date("2026-03-15T12:00:00.000Z"),
        method: "EFECTIVO",
        payment: {
          concept: { name: "Mensualidad" },
          enrollment: {
            student: {
              firstName: "Ana",
              lastName: "Torres",
              dni: "12345678",
            },
          },
        },
      },
    ]);

    const result = await exportFinancialReport(2026);

    expect(result.success).toBe(true);
    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN", "DIRECTOR", "CAJA"]);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: expect.objectContaining({
          reportType: "financial_excel",
          year: 2026,
          transactionsCount: 1,
        }),
        metadata: { module: "reports" },
      }),
    );
    expect(createAuditLogMock.mock.calls[0][0].newValue).not.toHaveProperty("data");
  });

  it("exportFinancialReport rechaza rol no financiero sin consultar datos", async () => {
    const { exportFinancialReport } = await import("@/lib/actions/report.actions");
    requireRoleMock.mockRejectedValue(new Error("No autorizado"));

    const result = await exportFinancialReport(2026);

    expect(result.success).toBe(false);
    expect(prismaMock.payment.findMany).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it("exportGradesToExcel permite roles academicos y audita exportacion", async () => {
    const { exportGradesToExcel } = await import("@/lib/actions/report.actions");
    allowRole(requireRoleMock, "DOCENTE");

    const result = await exportGradesToExcel("section_1", "BIMESTRE_1");

    expect(result.success).toBe(true);
    expect(requireRoleMock).toHaveBeenCalledWith([
      "ADMIN",
      "DIRECTOR",
      "DOCENTE",
      "COORDINADOR",
    ]);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: expect.objectContaining({ reportType: "grades_excel" }),
      }),
    );
  });

  it("exportAttendanceReport permite roles academicos", async () => {
    const { exportAttendanceReport } = await import("@/lib/actions/report.actions");
    allowRole(requireRoleMock, "COORDINADOR");

    const result = await exportAttendanceReport("section_1", 3, 2026);

    expect(result.success).toBe(true);
    expect(requireRoleMock).toHaveBeenCalledWith([
      "ADMIN",
      "DIRECTOR",
      "DOCENTE",
      "COORDINADOR",
    ]);
  });
});
