"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  PaymentConceptSchema,
  RegisterPaymentReceiptSchema,
} from "@/lib/validations/payment.schema";
import { PaymentStatus, PaymentType, Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";
import { REPORT_PERMISSIONS } from "@/lib/report-permissions";

const roundMoney = (value: number) => Math.round(value * 100) / 100;

// ==========================================
// ACCIONES PARA CONCEPTOS DE PAGO
// ==========================================

export async function getPaymentConcepts(type?: PaymentType) {
  try {
    await requireRole(ROLE_GROUPS.FINANCE);

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
  await requireRole(ROLE_GROUPS.FINANCE);

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
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.PAYMENT,
      entityId: concept.id,
      newValue: {
        name: concept.name,
        type: concept.type,
        amount: concept.amount,
        active: concept.active,
      },
      metadata: {
        module: "payments",
        operation: "create_payment_concept",
      },
    });
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
    await requireRole(ROLE_GROUPS.FINANCE);

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

    const [statsRows, latestTransactions] = await Promise.all([
      prisma.$queryRaw<
        {
          paid_month: number;
          pending_month: number;
          total_overdue: number;
          due_week: number;
        }[]
      >`
        SELECT
          COALESCE((
            SELECT SUM(pt.amount)
            FROM "PaymentTransaction" pt
            WHERE pt."paidAt" >= ${startDate} AND pt."paidAt" <= ${endDate}
          ), 0)::float AS paid_month,

          COALESCE(SUM(balance) FILTER (
            WHERE status = 'PENDIENTE'
            AND "dueDate" >= ${startDate} AND "dueDate" <= ${endDate}
          ), 0)::float AS pending_month,

          -- total_overdue scoped al año académico activo para evitar full table scan
          -- y permitir que el planner use @@index([status, dueDate])
          COALESCE(SUM(balance) FILTER (
            WHERE status = 'VENCIDO'
            AND "dueDate" >= ${yearStart} AND "dueDate" <= ${yearEnd}
          ), 0)::float AS total_overdue,

          COALESCE(SUM(balance) FILTER (
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
      prisma.paymentTransaction.findMany({
        select: {
          id: true,
          amount: true,
          paidAt: true,
          method: true,
          payment: {
            select: {
              id: true,
              balance: true,
              status: true,
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
          },
        },
        orderBy: { paidAt: "desc" },
        take: 10,
      }),
    ]);

    const latestPayments = latestTransactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      paidAt: transaction.paidAt,
      method: transaction.method,
      reference: transaction.payment.reference,
      balance: transaction.payment.balance,
      status: transaction.payment.status,
      concept: transaction.payment.concept,
      enrollment: transaction.payment.enrollment,
    }));

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
    await requireRole(ROLE_GROUPS.FINANCE);

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
        code: true,
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

export type SearchStudentResult = NonNullable<Awaited<ReturnType<typeof searchStudentsForPayment>>["data"]>[0];

export async function getStudentPendingPayments(studentId: string) {
  try {
    await requireRole(ROLE_GROUPS.FINANCE);

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
        balance: { gt: 0 },
      },
      include: {
        concept: true,
        transactions: { orderBy: { paidAt: "desc" } },
      },
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
    await requireAuth();

    const payments = await prisma.payment.findMany({
      where: { enrollmentId },
      include: {
        concept: true,
        transactions: { orderBy: { paidAt: "desc" } },
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
async function generateReceiptNumber(
  tx: Prisma.TransactionClient,
  date: Date,
): Promise<string> {
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
  const currentUser = await requireRole(ROLE_GROUPS.FINANCE);

  const parsed = RegisterPaymentReceiptSchema.safeParse(data);
  if (!parsed.success)
    return {
      success: false,
      error: "Datos inválidos",
      details: parsed.error.flatten(),
    };

  const { paymentId, amount, method, paidAt, notes } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: {
          concept: true,
          enrollment: {
            include: {
              student: true,
              section: { include: { gradeLevel: true } },
            },
          },
        },
      });

      if (!payment) throw new Error("Pago no encontrado");
      if (payment.status === PaymentStatus.PAGADO)
        throw new Error("Este registro ya se encuentra pagado");
      if (payment.status === PaymentStatus.ANULADO)
        throw new Error("No se puede registrar un abono sobre un pago anulado");
      if (!payment.enrollment.active)
        throw new Error("La matrícula del estudiante no está activa.");

      const currentBalance = roundMoney(payment.balance);
      const paymentAmount = roundMoney(amount);

      if (paymentAmount <= 0) {
        throw new Error("El monto del abono debe ser mayor a 0");
      }
      if (paymentAmount > currentBalance) {
        throw new Error("El monto del abono excede el saldo pendiente");
      }

      const receiptNumber = await generateReceiptNumber(tx, paidAt);
      const newBalance = roundMoney(currentBalance - paymentAmount);
      const newStatus =
        newBalance === 0 ? PaymentStatus.PAGADO : payment.status;

      const transaction = await tx.paymentTransaction.create({
        data: {
          paymentId,
          amount: paymentAmount,
          method,
          paidAt,
          createdBy: currentUser.id,
        },
      });

      const updatedPayment = await tx.payment.update({
        where: { id: paymentId },
        data: {
          balance: newBalance,
          status: newStatus,
          paidAt: newStatus === PaymentStatus.PAGADO ? paidAt : payment.paidAt,
          method: method,
          reference: receiptNumber,
          notes: notes
            ? payment.notes
              ? `${payment.notes}\n${notes}`
              : notes
            : payment.notes,
        },
        include: {
          concept: true,
          enrollment: {
            include: {
              student: true,
              section: { include: { gradeLevel: true } },
            },
          },
          transactions: { orderBy: { paidAt: "desc" } },
        },
      });

      return {
        ...updatedPayment,
        transactionId: transaction.id,
        amount: transaction.amount,
        paidAt: transaction.paidAt,
        method: transaction.method,
        balance: updatedPayment.balance,
        originalAmount: updatedPayment.amount,
      };
    });

    revalidatePath("/dashboard/pagos");
    await createAuditLog({
      action: AuditAction.REGISTER_PAYMENT,
      entity: AuditEntity.PAYMENT_TRANSACTION,
      entityId: result.transactionId,
      newValue: {
        paymentId,
        amount: result.amount,
        method: result.method,
        paidAt: result.paidAt,
        remainingBalance: result.balance,
        originalAmount: result.originalAmount,
      },
      metadata: {
        module: "payments",
        paymentStatus: result.status,
        conceptId: result.conceptId,
        enrollmentId: result.enrollmentId,
      },
    });
    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("Error in registerPayment:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Error al registrar el cobro",
    };
  }
}

export type ReceiptData = NonNullable<Awaited<ReturnType<typeof registerPayment>>["data"]>;

export async function updateOverduePayments() {
  try {
    await requireRole(ROLE_GROUPS.FINANCE);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        balance: { gt: 0 },
        dueDate: { lt: today },
      },
      data: { status: PaymentStatus.VENCIDO },
    });

    if (result.count > 0) revalidatePath("/dashboard/pagos");
    if (result.count > 0) {
      await createAuditLog({
        action: AuditAction.CHANGE_STATUS,
        entity: AuditEntity.PAYMENT,
        newValue: {
          status: PaymentStatus.VENCIDO,
          affectedCount: result.count,
        },
        metadata: {
          module: "payments",
          operation: "update_overdue_payments",
        },
      });
    }
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error in updateOverduePayments:", error);
    return { success: false, error: "Error al actualizar estado de morosidad" };
  }
}

export async function getOverduePayments() {
  try {
    await requireRole(ROLE_GROUPS.FINANCE);

    const payments = await prisma.payment.findMany({
      where: { status: PaymentStatus.VENCIDO, balance: { gt: 0 } },
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
    await requireRole(ROLE_GROUPS.FINANCE);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);

    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        balance: { gt: 0 },
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
    await requireRole(ROLE_GROUPS.FINANCE);

    const startOfMonth = new Date(year, month - 1, 1); // JS dates month is 0-indexed
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const [payments, transactions] = await Promise.all([
      prisma.payment.findMany({
        where: {
          dueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
      prisma.paymentTransaction.findMany({
        where: {
          paidAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        select: { amount: true },
      }),
    ]);

    let totalBilled = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;

    payments.forEach((p) => {
      totalBilled += p.amount;
      if (p.status === PaymentStatus.PENDIENTE) totalPending += p.balance;
      else if (p.status === PaymentStatus.VENCIDO) totalOverdue += p.balance;
    });
    totalPaid = transactions.reduce((acc, tx) => acc + tx.amount, 0);

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
    await requireRole([...REPORT_PERMISSIONS.financial]);

    // ── ANTES: 12 queries paralelas (Promise.all de 12 findMany) ─────────────────
    // ── AHORA: 1 sola query con DATE_TRUNC, resolución en memoria ─────────────
    //
    // ⚠️ SCHEMA-COUPLED: Este raw query usa amount, status y dueDate
    // de la tabla Payment. Si renombras alguna de esas columnas en
    // schema.prisma, actualiza este query manualmente también.
    const [rows, transactionRows] = await Promise.all([
      prisma.$queryRaw<
      {
        month: number;
        status: string;
        total_billed: number;
        total_balance: number;
      }[]
    >`
      SELECT
        EXTRACT(MONTH FROM "dueDate")::int AS month,
        status,
        SUM(amount)::float AS total_billed,
        SUM(balance)::float AS total_balance
      FROM "Payment"
      WHERE EXTRACT(YEAR FROM "dueDate") = ${year}
      GROUP BY EXTRACT(MONTH FROM "dueDate"), status
      ORDER BY month
    `,
      prisma.$queryRaw<
        {
          month: number;
          total_paid: number;
        }[]
      >`
        SELECT
          EXTRACT(MONTH FROM "paidAt")::int AS month,
          SUM(amount)::float AS total_paid
        FROM "PaymentTransaction"
        WHERE EXTRACT(YEAR FROM "paidAt") = ${year}
        GROUP BY EXTRACT(MONTH FROM "paidAt")
        ORDER BY month
      `,
    ]);

    // Construir el reporte mes a mes en memoria (sin más queries)
    const reportList = Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const monthRows = rows.filter((r) => r.month === m);
      const paidRows = transactionRows.filter((r) => r.month === m);

      let totalBilled = 0;
      let totalPaid = 0;
      let totalPending = 0;
      let totalOverdue = 0;

      for (const r of monthRows) {
        totalBilled += r.total_billed;
        if (r.status === PaymentStatus.PENDIENTE) totalPending += r.total_balance;
        else if (r.status === PaymentStatus.VENCIDO) totalOverdue += r.total_balance;
      }
      totalPaid = paidRows.reduce((acc, r) => acc + r.total_paid, 0);

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
