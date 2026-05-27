import { describe, expect, it } from "vitest";

import {
  getAllowedRolesForPath,
  hasAllowedRole,
  ROLE_GROUPS,
} from "@/lib/rbac";

describe("ROLE_GROUPS", () => {
  it("define roles de admision para matriculas y estudiantes", () => {
    expect(ROLE_GROUPS.ADMISSIONS).toEqual(
      expect.arrayContaining(["ADMIN", "DIRECTOR", "RECEPCION"]),
    );
  });

  it("define roles financieros para pagos", () => {
    expect(ROLE_GROUPS.FINANCE).toEqual(
      expect.arrayContaining(["ADMIN", "DIRECTOR", "CAJA"]),
    );
  });

  it("define roles academicos para notas y asistencia", () => {
    expect(ROLE_GROUPS.ACADEMIC).toEqual(
      expect.arrayContaining(["ADMIN", "DIRECTOR", "COORDINADOR", "DOCENTE"]),
    );
  });

  it("define roles disciplinarios para incidencias e inhabilitaciones", () => {
    expect(ROLE_GROUPS.DISCIPLINE).toEqual(
      expect.arrayContaining(["ADMIN", "DIRECTOR", "COORDINADOR"]),
    );
  });

  it("mantiene reportes restringido y no abierto a todos los roles", () => {
    expect(ROLE_GROUPS.REPORTS).toEqual(
      expect.arrayContaining(["ADMIN", "DIRECTOR", "COORDINADOR", "CAJA"]),
    );
    expect(ROLE_GROUPS.REPORTS).not.toContain("RECEPCION");
    expect(ROLE_GROUPS.REPORTS).not.toContain("DOCENTE");
  });
});

describe("helpers RBAC", () => {
  it("normaliza roles antes de validar permisos", () => {
    expect(hasAllowedRole("admin", ROLE_GROUPS.ADMINISTRATION)).toBe(true);
    expect(hasAllowedRole("DOCENTE", ROLE_GROUPS.FINANCE)).toBe(false);
  });

  it("resuelve roles permitidos por ruta protegida", () => {
    expect(getAllowedRolesForPath("/dashboard/pagos")).toBe(
      ROLE_GROUPS.FINANCE,
    );
    expect(getAllowedRolesForPath("/dashboard/matriculas/nueva")).toBe(
      ROLE_GROUPS.ADMISSIONS,
    );
  });
});
