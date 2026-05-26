import { describe, expect, it } from "vitest";

import {
  buildAttendanceChartData,
  mapPriorityAlerts,
  mapRevenueData,
} from "@/services/dashboard.service";

describe("dashboard.service", () => {
  it("mapea datos de ingresos para graficos", () => {
    expect(mapRevenueData([{ month: "Mayo", totalPaid: 1200 }])).toEqual([
      { name: "Mayo", value: 1200 },
    ]);
  });

  it("ordena alertas por severidad y fecha", () => {
    const result = mapPriorityAlerts([
      { id: "1", title: "Low", severity: "low", createdAt: "2026-01-01" },
      { id: "2", title: "High", severity: "high", createdAt: "2026-01-01" },
    ]);

    expect(result[0].id).toBe("2");
  });

  it("construye datos de asistencia", () => {
    expect(
      buildAttendanceChartData([
        { label: "1A", presente: 10, tardanza: 2, justificada: 1, injustificada: 3 },
      ]),
    ).toEqual([{ name: "1A", presentes: 10, tardanzas: 2, faltas: 4 }]);
  });
});
