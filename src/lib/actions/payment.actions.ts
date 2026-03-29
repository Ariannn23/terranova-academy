"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  PaymentConceptSchema,
  RegisterPaymentReceiptSchema,
} from "@/lib/validations/payment.schema";
import { PaymentStatus, PaymentType } from "@prisma/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

// ==========================================
// ACCIONES PARA CONCEPTOS DE PAGO
// ==========================================

export async function getPaymentConcepts(type?: PaymentType) {
  try {
    const concepts = await prisma.paymentConcept.findMany({
      where: {
        ...(type ? { type } : {}),
        active: true,
      },
      orderBy: { name: "asc" },
    });
    return { success: true, data: concepts };
  } catch (error) {
    console.error("Error in getPaymentConcepts:", error);
    return { success: false, error: "Error al obtener conceptos de pago" };
  }
}

export async function createPaymentConcept(data: unknown) {
  const parsed = PaymentConceptSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: "Datos inválidos",
      details: parsed.error.flatten(),
    };

  try {
    const concept = await prisma.paymentConcept.create({
      data: parsed.data,
    });
    revalidatePath("/dashboard/pagos");
    return { success: true, data: concept };
  } catch (error) {
    console.error("Error in createPaymentConcept:", error);
    return { success: false, error: "Error al crear concepto de pago" };
  }
}

// ==========================================
// ACCIONES PARA PAGOS Y COBROS (PAYMENTS)
// ==========================================

export async function getPaymentDashboardStats(month?: number, year?: number) {
  try {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const startDate = startOfMonth(new Date(targetYear, targetMonth));
    const endDate = endOfMonth(new Date(targetYear, targetMonth));

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // ── ANTES: 4 aggregate() separados + 1 findMany = 5 queries en Promise.all ──
    // Prisma wraps aggregate en subquery: SELECT SUM FROM (SELECT ... OFFSET $1)
    // PostgreSQL no puede usar índices en ese patrón → seq scan completo.
    //
    // ── AHORA: 1 $queryRaw con SUM(...) FILTER (WHERE ...) + 1 findMany ─────────
    // PostgreSQL evalúa directamente los índices de status, paidAt y dueDate.
    //
    // ⚠️ SCHEMA-COUPLED: Si renombras status, paidAt, dueDate o amount en Payment,
    // actualiza este raw query manualmente.
    const yearStart = new Date(targetYear, 0, 1);   // 1 Jan del año académico activo
    const yearEnd   = new Date(targetYear, 11, 31, 23, 59, 59, 999); // 31 Dic

    const [statsRows, latestPayments] = await Promise.all([
      prisma.$queryRaw<
        {
          paid_month: number;
          pending_month: number;
          total_overdue: number;
          due_week: number;
        }[]
      >`
        SELECT
          COALESCE(SUM(amount) FILTER (
            WHERE status = 'PAGADO'
            AND "paidAt" >= ${startDate} AND "paidAt" <= ${endDate}
          ), 0)::float AS paid_month,

          COALESCE(SUM(amount) FILTER (
            WHERE status = 'PENDIENTE'
            AND "dueDate" >= ${startDate} AND "dueDate" <= ${endDate}
          ), 0)::float AS pending_month,

          -- total_overdue scoped al año académico activo para evitar full table scan
          -- y permitir que el planner use @@index([status, dueDate])
          COALESCE(SUM(amount) FILTER (
            WHERE status = 'VENCIDO'
            AND "dueDate" >= ${yearStart} AND "dueDate" <= ${yearEnd}
          ), 0)::float AS total_overdue,

          COALESCE(SUM(amount) FILTER (
            WHERE status = 'PENDIENTE'
            AND "dueDate" >= ${weekStart} AND "dueDate" <= ${weekEnd}
          ), 0)::float AS due_week

        FROM "Payment"
      `,
      // ── latestPayments: select preciso para evitar el SELECT Section separado ──
      // ANTES: section: { include: { gradeLevel: true } }
      //   → Prisma generaba SELECT FROM "Section" WHERE id IN ($1,$2) [~1229ms]
      //   porque traía el objeto section completo y luego resolvía gradeLevel
      //   en otro roundtrip.
      // AHORA: select solo los campos de UI que necesita el componente.
      prisma.payment.findMany({
        where: { status: PaymentStatus.PAGADO },
        select: {
          id: true,
          amount: true,
          paidAt: true,
          method: true,
          reference: true,
          concept: { select: { name: true, type: true } },
          enrollment: {
            select: {
              id: true,
              student: {
                select: { firstName: true, lastName: true, dni: true },
              },
              section: {
                select: {
                  name: true,
                  gradeLevel: { select: { name: true, level: true } },
                },
              },
            },
          },
        },
        orderBy: { paidAt: "desc" },
        take: 10,
      }),
    ]);

    const stats = statsRows[0];

    return {
      success: true,
      data: {
        totalPaid: stats.paid_month,
        totalPending: stats.pending_month,
        totalOverdue: stats.total_overdue,
        dueThisWeek: stats.due_week,
        latestPayments,
      },
    };
  } catch (error) {
    console.error("Error in getPaymentDashboardStats:", error);
    return {
      success: false,
      error: "Error al cargar estadísticas financieras",
    };
  }
}


export async function searchStudentsForPayment(query: string) {
  try {
    if (!query || query.length < 2) return { success: true, data: [] };

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { dni: { contains: query } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
        enrollments: {
          where: { active: true },
          include: {
            section: { include: { gradeLevel: true } },
          },
        },
      },
      take: 10,
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("Error in searchStudentsForPayment:", error);
    return { success: false, error: "Error en la búsqueda rápida" };
  }
}

export async function getStudentPendingPayments(studentId: string) {
  try {
    // Antes: findFirst (enrollment) LUEGO findMany (payments) — 2 queries secuenciales
    // Ahora: ambas en paralelo; si no hay enrollment activo retornamos el error
    const [activeEnrollment] = await Promise.all([
      prisma.enrollment.findFirst({
        where: { studentId, active: true },
        select: { id: true },
      }),
    ]);

    if (!activeEnrollment) {
      return {
        success: false,
        error: "El estudiante no tiene matrícula activa.",
      };
    }

    const unPaid = await prisma.payment.findMany({
      where: {
        enrollmentId: activeEnrollment.id,
        status: { in: [PaymentStatus.PENDIENTE, PaymentStatus.VENCIDO] },
      },
      include: { concept: true },
      orderBy: { dueDate: "asc" },
    });

    return { success: true, data: unPaid };
  } catch (error) {
    console.error("Error in getStudentPendingPayments:", error);
    return { success: false, error: "Error al buscar deuda." };
  }
}

export async function getPaymentsByEnrollment(enrollmentId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: { enrollmentId },
      include: {
        concept: true,
      },
      orderBy: { dueDate: "asc" },
    });
    return { success: true, data: payments };
  } catch (error) {
    console.error("Error in getPaymentsByEnrollment:", error);
    return { success: false, error: "Error al obtener historial de pagos" };
  }
}

// Genera un número de recibo correlativo simple: AÑO-MES-XXXX (ej. 2026-03-0001)
async function generateReceiptNumber(tx: any, date: Date): Promise<string> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const prefix = `${year}-${month}-`;

  const lastPayment = await tx.payment.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
  });

  if (!lastPayment || !lastPayment.reference) {
    return `${prefix}0001`;
  }

  const lastSequence = parseInt(lastPayment.reference.split("-")[2], 10);
  const nextSequence = String(lastSequence + 1).padStart(4, "0");

  return `${prefix}${nextSequence}`;
}

export async function registerPayment(data: unknown) {
  const parsed = RegisterPaymentReceiptSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: "Datos inválidos",
      details: parsed.error.flatten(),
    };

  const { paymentId, method, paidAt, notes } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { enrollment: true },
      });

      if (!payment) throw new Error("Pago no encontrado");
      if (payment.status === PaymentStatus.PAGADO)
        throw new Error("Este registro ya se encuentra pagado");
      if (!payment.enrollment.active)
        throw new Error("La matrícula del estudiante no está activa.");

      const receiptNumber = await generateReceiptNumber(tx, paidAt);

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.PAGADO,
          paidAt: paidAt,
          method: method,
          reference: receiptNumber,
          notes: notes
            ? payment.notes
              ? `${payment.notes}\n${notes}`
              : notes
            : payment.notes,
        },
      });

      return updatedPayment;
    });

    revalidatePath("/dashboard/pagos");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in registerPayment:", error);
    return {
      success: false,
      error: error.message || "Error al registrar el cobro",
    };
  }
}

export async function updateOverduePayments() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        dueDate: { lt: today },
      },
      data: { status: PaymentStatus.VENCIDO },
    });

    if (result.count > 0) revalidatePath("/dashboard/pagos");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error in updateOverduePayments:", error);
    return { success: false, error: "Error al actualizar estado de morosidad" };
  }
}

export async function getOverduePayments() {
  try {
    const payments = await prisma.payment.findMany({
      where: { status: PaymentStatus.VENCIDO },
      include: {
        enrollment: {
          include: {
            student: { select: { firstName: true, lastName: true, dni: true } },
            section: { include: { gradeLevel: true } },
          },
        },
        concept: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });
    return { success: true, data: payments };
  } catch (error) {
    console.error("Error in getOverduePayments:", error);
    return { success: false, error: "Error al extraer reporte de morosidad" };
  }
}

export async function getUpcomingPayments(days: number = 7) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        enrollment: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
        concept: { select: { name: true } },
      },
      orderBy: { dueDate: "asc" },
    });
    return { success: true, data: payments };
  } catch (error) {
    console.error("Error in getUpcomingPayments:", error);
    return { success: false, error: "Error al obtener cobros próximos" };
  }
}

export async function getFinancialSummary(month: number, year: number) {
  try {
    const startOfMonth = new Date(year, month - 1, 1); // JS dates month is 0-indexed
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const payments = await prisma.payment.findMany({
      where: {
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach((p: any) => {
      totalBilled += p.amount;
      if (p.status === PaymentStatus.PAGADO) totalPaid += p.amount;
      else if (p.status === PaymentStatus.PENDIENTE) totalPending += p.amount;
      else if (p.status === PaymentStatus.VENCIDO) totalOverdue += p.amount;
    });

    return {
      success: true,
      data: { totalBilled, totalPaid, totalPending, totalOverdue },
    };
  } catch (error) {
    console.error("Error in getFinancialSummary:", error);
    return { success: false, error: "Error al calcular el resumen financiero" };
  }
}

export async function getFinancialReport(year: number) {
  try {
    // ── ANTES: 12 queries paralelas (Promise.all de 12 findMany) ─────────────────
    // ── AHORA: 1 sola query con DATE_TRUNC, resolución en memoria ─────────────
    //
    // ⚠️ SCHEMA-COUPLED: Este raw query usa amount, status y dueDate
    // de la tabla Payment. Si renombras alguna de esas columnas en
    // schema.prisma, actualiza este query manualmente también.
    const rows = await prisma.$queryRaw<
      {
        month: number;
        status: string;
        total: number;
      }[]
    >`
      SELECT
        EXTRACT(MONTH FROM "dueDate")::int AS month,
        status,
        SUM(amount)::float AS total
      FROM "Payment"
      WHERE EXTRACT(YEAR FROM "dueDate") = ${year}
      GROUP BY EXTRACT(MONTH FROM "dueDate"), status
      ORDER BY month
    `;

    // Construir el reporte mes a mes en memoria (sin más queries)
    const reportList = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthRows = rows.filter((r) => r.month === m);

      let totalBilled = 0;
      let totalPaid = 0;
      let totalPending = 0;
      let totalOverdue = 0;

      for (const r of monthRows) {
        totalBilled += r.total;
        if (r.status === PaymentStatus.PAGADO) totalPaid += r.total;
        else if (r.status === PaymentStatus.PENDIENTE) totalPending += r.total;
        else if (r.status === PaymentStatus.VENCIDO) totalOverdue += r.total;
      }

      return {
        month: m,
        year,
        totalBilled,
        totalPaid,
        totalPending,
        totalOverdue,
      };
    });

    return { success: true, data: reportList };
  } catch (error) {
    console.error("Error in getFinancialReport:", error);
    return { success: false, error: "Error al calcular reporte anual" };
  }
}
