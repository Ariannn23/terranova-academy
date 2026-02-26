"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  PaymentConceptSchema,
  CreatePaymentSchema,
  RegisterPaymentReceiptSchema,
  UpdatePaymentSchema,
  PaymentTypeEnum,
} from "@/lib/validations/payment.schema";
import { PaymentStatus, PaymentType } from "@prisma/client";

// ==========================================
// ACCIONES PARA CONCEPTOS DE PAGO
// ==========================================

export async function getPaymentConcepts(type?: PaymentType) {
  try {
    const concepts = await prisma.paymentConcept.findMany({
      where: {
        ...(type ? { type } : {}),
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
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

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

export async function updatePaymentConcept(id: string, data: unknown) {
  const parsed = PaymentConceptSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const concept = await prisma.paymentConcept.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/pagos");
    return { success: true, data: concept };
  } catch (error: any) {
    if (error.code === "P2025") {
      return { success: false, error: "Concepto no encontrado" };
    }
    console.error("Error in updatePaymentConcept:", error);
    return { success: false, error: "Error al actualizar concepto de pago" };
  }
}

export async function deactivatePaymentConcept(id: string) {
  try {
    await prisma.paymentConcept.update({
      where: { id },
      data: { active: false },
    });
    revalidatePath("/dashboard/pagos");
    return { success: true };
  } catch (error) {
    console.error("Error in deactivatePaymentConcept:", error);
    return { success: false, error: "Error al desactivar concepto de pago" };
  }
}

// ==========================================
// ACCIONES PARA PAGOS Y COBROS (PAYMENTS)
// ==========================================

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
async function generateReceiptNumber(
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  date: Date,
): Promise<string> {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const prefix = `${year}-${month}-`;

  // Buscar el último pago registrado este mes que tenga referencia
  const lastPayment = await tx.payment.findFirst({
    where: {
      reference: {
        startsWith: prefix,
      },
    },
    orderBy: {
      reference: "desc",
    },
  });

  if (!lastPayment || !lastPayment.reference) {
    return `${prefix}0001`; // Primer recibo del mes
  }

  // Extraer el correlativo (los últimos 4 dígitos) y sumarle 1
  const lastSequence = parseInt(lastPayment.reference.split("-")[2], 10);
  const nextSequence = String(lastSequence + 1).padStart(4, "0");

  return `${prefix}${nextSequence}`;
}

export async function registerPayment(data: unknown) {
  const parsed = RegisterPaymentReceiptSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  const { paymentId, method, paidAt, notes } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener el pago actual y verificar matrícula
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { enrollment: true },
      });

      if (!payment) {
        throw new Error("Pago no encontrado");
      }

      if (payment.status === PaymentStatus.PAGADO) {
        throw new Error("Este registro ya se encuentra pagado");
      }

      if (!payment.enrollment.active) {
        throw new Error(
          "No se puede registrar el pago. La matrícula del estudiante no está activa.",
        );
      }

      // 2. Generar número de recibo (referencia)
      const receiptNumber = await generateReceiptNumber(tx, paidAt);

      // 3. Procesar el cobro
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

// Generador masivo de mensualidades para un año académico (se ejecuta ej. cada mes mediante Cron)
export async function generateMonthlyPayments(
  academicYearId: string,
  monthDate: Date,
  amountOverride?: number,
) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Obtener todas las matrículas activas del año
      const enrollments = await tx.enrollment.findMany({
        where: {
          academicYearId,
          active: true,
        },
      });

      if (enrollments.length === 0) {
        return { count: 0, message: "No hay alumnos matriculados" };
      }

      // 2. Buscar/Crear el concepto por defecto de Mensualidad
      let concept = await tx.paymentConcept.findFirst({
        where: { type: PaymentType.MENSUALIDAD, active: true },
      });

      const amountToCharge = amountOverride || concept?.amount || 0;

      if (!concept) {
        concept = await tx.paymentConcept.create({
          data: {
            name: "Mensualidad Regular",
            type: PaymentType.MENSUALIDAD,
            amount: amountToCharge,
          },
        });
      }

      // 3. Crear el cobro para cada estudiante para ese mes
      // (Suponemos dueDate el día 5 del mes proporcionado)
      const dueDate = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        5,
      );
      const startOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth(),
        1,
      );
      const endOfMonth = new Date(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0,
      );

      let createdCount = 0;

      for (const enr of enrollments) {
        // Evitar doble facturación (no crear si ya tiene deuda de mensualidad ese mes)
        const existingPayment = await tx.payment.findFirst({
          where: {
            enrollmentId: enr.id,
            conceptId: concept.id,
            dueDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        if (!existingPayment) {
          await tx.payment.create({
            data: {
              enrollmentId: enr.id,
              conceptId: concept.id,
              amount: amountToCharge,
              dueDate: dueDate,
              status: PaymentStatus.PENDIENTE,
            },
          });
          createdCount++;
        }
      }

      return { count: createdCount };
    });

    revalidatePath("/dashboard/pagos");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error in generateMonthlyPayments:", error);
    return {
      success: false,
      error: "Error al generar cobros mensuales masivos",
    };
  }
}

// Actualiza los estados de PENDIENTE a VENCIDO basados en la fecha
export async function updateOverduePayments() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await prisma.payment.updateMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        dueDate: {
          lt: today,
        },
      },
      data: {
        status: PaymentStatus.VENCIDO,
      },
    });

    if (result.count > 0) {
      revalidatePath("/dashboard/pagos");
    }

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error in updateOverduePayments:", error);
    return { success: false, error: "Error al actualizar estado de morosidad" };
  }
}

// ==========================================
// REPORTES FINANCIEROS
// ==========================================

export async function getOverduePayments() {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.VENCIDO,
      },
      include: {
        enrollment: {
          include: {
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
        concept: {
          select: { name: true },
        },
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
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const reportList = await Promise.all(
      months.map(async (m) => {
        const res = await getFinancialSummary(m, year);
        return {
          month: m,
          year,
          ...res.data,
        };
      }),
    );

    return { success: true, data: reportList };
  } catch (error) {
    console.error("Error in getFinancialReport:", error);
    return { success: false, error: "Error al calcular reporte anual" };
  }
}
