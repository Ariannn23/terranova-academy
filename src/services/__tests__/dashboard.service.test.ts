import { describe, expect, it } from "vitest";

import {
  buildWeeklyAttendanceData,
  buildAttendanceChartData,
  mapDashboardPriorityAlerts,
  mapPriorityAlerts,
  mapRevenueData,
  normalizeMonthlyRevenue,
} from "@/services/dashboard.service";

describe("dashboard.service", () => {
  it("mapea datos de ingresos para graficos", () => {
    expect(mapRevenueData([{ month: "Mayo", totalPaid: 1200 }])).toEqual([
      { name: "Mayo", value: 1200 },
    ]);
  });

  it("normaliza ingresos mensuales para el dashboard", () => {
    expect(
      normalizeMonthlyRevenue(
        [
          { month: 1, totalPaid: 100, totalPending: 40, totalOverdue: 10 },
          { month: 2, totalPaid: 200, totalPending: 0, totalOverdue: 5 },
        ],
        1,
      ),
    ).toEqual([{ month: "Ene", ingresos: 100, pendientes: 50 }]);
  });

  it("retorna ingresos vacios si no hay datos", () => {
    expect(normalizeMonthlyRevenue([], 12)).toEqual([]);
  });

  it("ordena alertas por severidad y fecha", () => {
    const result = mapPriorityAlerts([
      { id: "1", title: "Low", severity: "low", createdAt: "2026-01-01" },
      { id: "2", title: "High", severity: "high", createdAt: "2026-01-01" },
    ]);

    expect(result[0].id).toBe("2");
  });

  it("mapea alertas prioritarias del dashboard", () => {
    const result = mapDashboardPriorityAlerts({
      incidents: [
        {
          id: "i1",
          date: "2026-01-01",
          enrollment: {
            student: { firstName: "Ana", lastName: "Torres" },
          },
        },
      ],
      disabledStudents: [
        {
          id: "s1",
          firstName: "Luis",
          lastName: "Ramos",
          updatedAt: "2026-01-02",
        },
      ],
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "inc-i1",
      type: "INCIDENT",
      subtitle: "Ana Torres",
    });
  });

  it("retorna alertas vacias si no hay datos", () => {
    expect(mapDashboardPriorityAlerts()).toEqual([]);
  });

  it("construye datos de asistencia", () => {
    expect(
      buildAttendanceChartData([
        { label: "1A", presente: 10, tardanza: 2, justificada: 1, injustificada: 3 },
      ]),
    ).toEqual([{ name: "1A", presentes: 10, tardanzas: 2, faltas: 4 }]);
  });

  it("construye asistencia semanal desde el promedio", () => {
    expect(buildWeeklyAttendanceData(90)).toEqual([
      { date: "Lun", porcentaje: 90 },
      { date: "Mar", porcentaje: 90 },
      { date: "Mié", porcentaje: 90 },
      { date: "Jue", porcentaje: 90 },
      { date: "Vie", porcentaje: 90 },
    ]);
  });

  it("usa promedio por defecto si no hay asistencia", () => {
    expect(buildWeeklyAttendanceData(0)[0].porcentaje).toBe(96);
    expect(buildWeeklyAttendanceData(undefined)[0].porcentaje).toBe(96);
  });
});
