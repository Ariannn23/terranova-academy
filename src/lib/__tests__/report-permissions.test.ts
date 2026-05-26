import { describe, expect, it } from "vitest";

import {
  canAccessReport,
  getReportPermissions,
  REPORT_PERMISSIONS,
} from "@/lib/report-permissions";

describe("REPORT_PERMISSIONS", () => {
  it("permite a CAJA acceder a financiero y recibos", () => {
    expect(canAccessReport("CAJA", "financial")).toBe(true);
    expect(canAccessReport("CAJA", "receipt")).toBe(true);
  });

  it("bloquea a DOCENTE y RECEPCION de reportes financieros", () => {
    expect(canAccessReport("DOCENTE", "financial")).toBe(false);
    expect(canAccessReport("RECEPCION", "financial")).toBe(false);
  });

  it("permite a COORDINADOR acceder a incidencias", () => {
    expect(canAccessReport("COORDINADOR", "incidents")).toBe(true);
  });

  it("bloquea a CAJA de incidencias y notas", () => {
    expect(canAccessReport("CAJA", "incidents")).toBe(false);
    expect(canAccessReport("CAJA", "grades")).toBe(false);
  });

  it("ADMIN y DIRECTOR tienen acceso a los reportes definidos", () => {
    for (const reportType of Object.keys(REPORT_PERMISSIONS) as Array<
      keyof typeof REPORT_PERMISSIONS
    >) {
      expect(canAccessReport("ADMIN", reportType)).toBe(true);
      expect(canAccessReport("DIRECTOR", reportType)).toBe(true);
    }
  });

  it("resuelve permisos por tipo de PDF", () => {
    expect(getReportPermissions("receipt")).toBe(REPORT_PERMISSIONS.receipt);
    expect(getReportPermissions("student-incidents")).toBe(
      REPORT_PERMISSIONS.incidents,
    );
    expect(getReportPermissions("unknown")).toBeNull();
  });
});
