import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatStudentName,
} from "@/services/formatting.service";

describe("formatting.service", () => {
  it("formatea moneda PEN con numero valido", () => {
    expect(formatCurrency(1500.5)).toContain("1,500.50");
  });

  it("formatea moneda con cero", () => {
    expect(formatCurrency(0)).toContain("0.00");
  });

  it("formatea Date", () => {
    expect(formatDate(new Date("2026-05-26T00:00:00"))).toMatch(/26\/05\/2026/);
  });

  it("formatea string ISO", () => {
    expect(formatDate("2026-05-26T00:00:00")).toMatch(/26\/05\/2026/);
  });

  it("devuelve guion para null, undefined o fecha invalida", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate(undefined)).toBe("-");
    expect(formatDate("not-a-date")).toBe("-");
  });

  it("formatea fecha y hora", () => {
    expect(formatDateTime("2026-05-26T14:30:00")).toContain("26/05/2026");
  });

  it("formatea nombre completo de estudiante", () => {
    expect(formatStudentName({ firstName: "Ana", lastName: "Rojas" })).toBe(
      "Ana Rojas",
    );
  });

  it("maneja datos incompletos de estudiante", () => {
    expect(formatStudentName({ names: "Luis" })).toBe("Luis");
    expect(formatStudentName({})).toBe("Sin nombre");
  });
});
