"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export async function getPaymentDashboardStats(month?: number, year?: number) {
  try {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();

    const startDate = startOfMonth(new Date(targetYear, targetMonth));
    const endDate = endOfMonth(new Date(targetYear, targetMonth));

    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // 1. Total Cobrado este mes
    const paidThisMonth = await prisma.payment.aggregate({
      where: {
        status: "PAGADO",
        paidAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    // 2. Total Pendiente (general o de este mes? Generalmente es lo que vence este mes pero no se ha pagado)
    const pendingThisMonth = await prisma.payment.aggregate({
      where: {
        status: "PENDIENTE",
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: { amount: true },
    });

    // 3. Vencido (Histórico global, todo lo anterior a hoy que no está pagado)
    const totalOverdue = await prisma.payment.aggregate({
      where: {
        status: "VENCIDO",
      },
      _sum: { amount: true },
    });

    // Si hay pendientes en el pasado, técnicamente también son vencidos,
    // pero confiamos en que un job o la consulta los haya marcado.
    // Por si acaso, sumamos los pendientes con fecha de vencimiento pasada:
    const pendingOverdue = await prisma.payment.aggregate({
      where: {
        status: "PENDIENTE",
        dueDate: {
          lt: now,
        },
      },
      _sum: { amount: true },
    });

    const realOverdue =
      (totalOverdue._sum.amount || 0) + (pendingOverdue._sum.amount || 0);

    // 4. Por vencer esta semana
    const dueThisWeek = await prisma.payment.aggregate({
      where: {
        status: "PENDIENTE",
        dueDate: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      _sum: { amount: true },
    });

    // Obtener los últimos 10 pagos registrados para la tabla resumen
    const latestPayments = await prisma.payment.findMany({
      where: {
        status: "PAGADO",
      },
      include: {
        enrollment: {
          include: {
            student: { select: { firstName: true, lastName: true, dni: true } },
            section: { include: { gradeLevel: true } },
          },
        },
        concept: true,
      },
      orderBy: {
        paidAt: "desc",
      },
      take: 10,
    });

    return {
      success: true,
      data: {
        totalPaid: paidThisMonth._sum.amount || 0,
        totalPending: pendingThisMonth._sum.amount || 0,
        totalOverdue: realOverdue,
        dueThisWeek: dueThisWeek._sum.amount || 0,
        latestPayments,
      },
    };
  } catch (error) {
    console.error("Error obteniendo estadísticas de pagos:", error);
    return {
      success: false,
      error: "Error al cargar el dashboard financiero.",
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
          { code: { contains: query } },
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
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("Error buscando estudiantes p/pago:", error);
    return { success: false, error: "Error en la búsqueda rápida." };
  }
}

export async function getStudentPendingPayments(studentId: string) {
  try {
    const activeEnrollment = await prisma.enrollment.findFirst({
      where: { studentId, active: true },
    });

    if (!activeEnrollment) {
      return {
        success: false,
        error: "El estudiante no tiene matrícula activa.",
      };
    }

    const unPaid = await prisma.payment.findMany({
      where: {
        enrollmentId: activeEnrollment.id,
        status: { in: ["PENDIENTE", "VENCIDO"] },
      },
      include: {
        concept: true,
      },
      orderBy: {
        dueDate: "asc", // Los más urgentes/antiguos primero
      },
    });

    return { success: true, data: unPaid };
  } catch (error) {
    console.error("Error obteniendo cuotas pendientes:", error);
    return { success: false, error: "Error al buscar deuda." };
  }
}

export async function processPayment(paymentId: string, method: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new Error("Pago no encontrado");
    if (payment.status === "PAGADO")
      throw new Error("El recibo ya figura como PAGADO");

    const receipt = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "PAGADO",
        paidAt: new Date(),
        method,
      },
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

    return { success: true, data: receipt };
  } catch (error: any) {
    console.error("Error registrando pago:", error);
    return {
      success: false,
      error: error.message || "No se pudo procesar el pago.",
    };
  }
}

export async function getOverduePayments() {
  try {
    const overdue = await prisma.payment.findMany({
      where: {
        status: { in: ["VENCIDO", "PENDIENTE"] },
        dueDate: { lt: new Date() },
      },
      include: {
        concept: true,
        enrollment: {
          include: {
            student: true,
            section: { include: { gradeLevel: true } },
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return { success: true, data: overdue };
  } catch (error) {
    console.error("Error obteniendo mora:", error);
    return {
      success: false,
      error: "No se pudieron obtener los reportes de deuda.",
    };
  }
}

export async function getStudentPaymentHistory(enrollmentId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: true,
        section: { include: { gradeLevel: true } },
        payments: {
          include: { concept: true },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!enrollment) return { success: false, error: "No encontrado" };

    return { success: true, data: enrollment };
  } catch (error) {
    console.error("Error cargando historial de pagos:", error);
    return { success: false, error: "Error de bases de datos." };
  }
}
