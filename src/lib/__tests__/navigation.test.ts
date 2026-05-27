import { describe, expect, it } from "vitest";
import {
  canAccessNavigationItem,
  filterNavigationByRole,
} from "@/lib/navigation";

describe("Visual Navigation Filtering Helpers", () => {
  describe("canAccessNavigationItem", () => {
    it("permite a ADMIN ver todos los módulos administrativos y generales", () => {
      expect(canAccessNavigationItem("ADMIN", { href: "/dashboard" })).toBe(true);
      expect(canAccessNavigationItem("ADMIN", { href: "/dashboard/configuracion" })).toBe(true);
      expect(canAccessNavigationItem("ADMIN", { href: "/dashboard/pagos" })).toBe(true);
      expect(canAccessNavigationItem("ADMIN", { href: "/dashboard/matriculas" })).toBe(true);
    });

    it("permite a DIRECTOR ver módulos de gestión amplios", () => {
      expect(canAccessNavigationItem("DIRECTOR", { href: "/dashboard" })).toBe(true);
      expect(canAccessNavigationItem("DIRECTOR", { href: "/dashboard/configuracion" })).toBe(true);
      expect(canAccessNavigationItem("DIRECTOR", { href: "/dashboard/pagos" })).toBe(true);
      expect(canAccessNavigationItem("DIRECTOR", { href: "/dashboard/matriculas" })).toBe(true);
    });

    it("permite a RECEPCION ver Matrículas y Estudiantes, pero no Pagos ni Configuración", () => {
      expect(canAccessNavigationItem("RECEPCION", { href: "/dashboard/matriculas" })).toBe(true);
      expect(canAccessNavigationItem("RECEPCION", { href: "/dashboard/estudiantes" })).toBe(true);
      expect(canAccessNavigationItem("RECEPCION", { href: "/dashboard/pagos" })).toBe(false);
      expect(canAccessNavigationItem("RECEPCION", { href: "/dashboard/configuracion" })).toBe(false);
    });

    it("permite a CAJA ver Pagos y Reportes, pero no Notas ni Configuración", () => {
      expect(canAccessNavigationItem("CAJA", { href: "/dashboard/pagos" })).toBe(true);
      expect(canAccessNavigationItem("CAJA", { href: "/dashboard/reportes" })).toBe(true);
      expect(canAccessNavigationItem("CAJA", { href: "/dashboard/notas" })).toBe(false);
      expect(canAccessNavigationItem("CAJA", { href: "/dashboard/configuracion" })).toBe(false);
    });

    it("permite a DOCENTE ver Notas, Asistencia, Horarios y Calendario, pero no Pagos ni Matrículas", () => {
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/notas" })).toBe(true);
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/asistencia" })).toBe(true);
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/horarios" })).toBe(true);
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/calendar" })).toBe(true);
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/pagos" })).toBe(false);
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/matriculas" })).toBe(false);
    });

    it("permite a COORDINADOR ver Incidencias, Inhabilitaciones y Reportes, pero no Configuración", () => {
      expect(canAccessNavigationItem("COORDINADOR", { href: "/dashboard/incidencias" })).toBe(true);
      expect(canAccessNavigationItem("COORDINADOR", { href: "/dashboard/inhabilitaciones" })).toBe(true);
      expect(canAccessNavigationItem("COORDINADOR", { href: "/dashboard/reportes" })).toBe(true);
      expect(canAccessNavigationItem("COORDINADOR", { href: "/dashboard/configuracion" })).toBe(false);
    });

    it("niega acceso a cualquier ruta si no hay un rol de usuario definido", () => {
      expect(canAccessNavigationItem(null, { href: "/dashboard/pagos" })).toBe(false);
      expect(canAccessNavigationItem(undefined, { href: "/dashboard/matriculas" })).toBe(false);
    });

    it("mantiene el link `/dashboard/matriculas/nueva` accesible para roles de admisión", () => {
      expect(canAccessNavigationItem("RECEPCION", { href: "/dashboard/matriculas/nueva" })).toBe(true);
      expect(canAccessNavigationItem("ADMIN", { href: "/dashboard/matriculas/nueva" })).toBe(true);
      expect(canAccessNavigationItem("DOCENTE", { href: "/dashboard/matriculas/nueva" })).toBe(false);
    });
  });

  describe("filterNavigationByRole", () => {
    it("filtra correctamente el listado de navegación para el rol RECEPCION", () => {
      const items = [
        { name: "Inicio", href: "/dashboard" },
        { name: "Matrículas", href: "/dashboard/matriculas" },
        { name: "Finanzas", href: "/dashboard/pagos" },
        { name: "Configuración", href: "/dashboard/configuracion" },
      ];
      
      const filtered = filterNavigationByRole(items, "RECEPCION");
      
      expect(filtered).toHaveLength(2);
      expect(filtered[0].href).toBe("/dashboard");
      expect(filtered[1].href).toBe("/dashboard/matriculas");
    });
  });
});
