"use server";

import { prisma } from "@/lib/prisma";
import { PaymentStatus, StudentStatus } from "@prisma/client";

// 1. Resumen Financiero: Calcula ingresos vs pendientes del año actual
export async function getFinancialSummary() {
  try {
    const currentYear = new Date().getFullYear();

    // Todos los pagos del año
    const payments = await prisma.payment.findMany({
      where: {
        dueDate: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31),
        },
      },
      select: { amount: true, status: true, dueDate: true },
    });

    let totalCollected = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    const now = new Date();

    payments.forEach((p) => {
      // Ingresos reales
      if (p.status === PaymentStatus.PAGADO) {
        totalCollected += p.amount;
      }
      // Pendientes vs Vencidos
      if (p.status === PaymentStatus.PENDIENTE) {
        if (p.dueDate < now) {
          totalOverdue += p.amount;
        } else {
          totalPending += p.amount;
        }
      }
    });

    return {
      success: true,
      data: {
        totalCollected,
        totalPending,
        totalOverdue,
      },
    };
  } catch (error) {
    console.error("Error en getFinancialSummary:", error);
    return {
      success: false,
      error: "No se pudo cargar el resumen financiero.",
    };
  }
}

// 2. Estudiantes en Riesgo o con bajas calificaciones
export async function getStudentsAtRisk() {
  try {
    // Definimos "En riesgo" como alumnos con status EN_RIESGO, OBSERVADO
    // o aquellos inhabilitados
    const count = await prisma.student.count({
      where: {
        status: {
          in: [
            StudentStatus.EN_RIESGO,
            StudentStatus.OBSERVADO,
            StudentStatus.INHABILITADO,
          ],
        },
      },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("Error en getStudentsAtRisk:", error);
    return {
      success: false,
      error: "Error al calcular estudiantes en riesgo.",
    };
  }
}

// 3. Asistencia Crítica (Alumnos con menos del 80%)
export async function getCriticalAttendance() {
  try {
    // Para simplificar el KPI, devolvemos el total de incidencias de inasistencia (injustificadas)
    // recientes en la última semana, en un app real se promedia vs dias.
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const absencesCount = await prisma.attendance.count({
      where: {
        status: "FALTA_INJUSTIFICADA",
        date: { gte: oneWeekAgo },
      },
    });

    // Simulación del KPI % Asistencia Promedio hoy:
    // (Total Asistencias / Total Registros de hoy)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendancesToday = await prisma.attendance.groupBy({
      by: ["status"],
      where: { date: { gte: today } },
      _count: true,
    });

    let present = 0;
    let total = 0;
    attendancesToday.forEach((a) => {
      total += a._count;
      if (a.status === "PRESENTE" || a.status === "TARDANZA")
        present += a._count;
    });

    const averageToday = total === 0 ? 0 : Math.round((present / total) * 100);

    return {
      success: true,
      data: {
        absencesLastWeek: absencesCount,
        averageToday,
      },
    };
  } catch (error) {
    console.error("Error en getCriticalAttendance:", error);
    return { success: false, error: "Error al cargar estado de asistencia." };
  }
}

// 4. Cobros próximos a vencer (Esta semana)
export async function getUpcomingPayments() {
  try {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    // Listar las próx 5 cuotas pendientes por vencer o recién vencidas
    const upcoming = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDIENTE,
        dueDate: {
          gte: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() - 7,
          ), // Desde hace 7 días (vencidos recientes)
          lte: nextWeek, // Hasta la prox semana
        },
      },
      include: {
        enrollment: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
    });

    return { success: true, data: upcoming };
  } catch (error) {
    console.error("Error en getUpcomingPayments:", error);
    return { success: false, error: "Error al cargar cobros pendientes." };
  }
}

// 5. Alertas Prioritarias Mixtas (Inhabilitados, Incidentes)
export async function getPriorityAlerts() {
  try {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 15);

    // Usar incidentes severos como alertas
    const incidents = await prisma.incident.findMany({
      where: {
        severity: "GRAVE",
        date: { gte: recentDate },
      },
      include: {
        enrollment: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { date: "desc" },
      take: 3,
    });

    // Estudiantes inhabilitados que requieren revisión
    const disabledStudents = await prisma.student.findMany({
      where: {
        status: StudentStatus.INHABILITADO,
        updatedAt: { gte: recentDate },
      },
      orderBy: { updatedAt: "desc" },
      take: 2,
    });

    return {
      success: true,
      data: { incidents, disabledStudents },
    };
  } catch (error) {
    console.error("Error en getPriorityAlerts:", error);
    return { success: false, error: "Error al cargar alertas." };
  }
}
