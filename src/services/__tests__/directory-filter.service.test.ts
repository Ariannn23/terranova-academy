import { describe, expect, it } from "vitest";

import {
  filterByOption,
  filterByLevel,
  filterByStatus,
  filterDirectory,
  matchesSearchTerm,
  normalizeText,
} from "@/services/directory-filter.service";

const items = [
  {
    id: 1,
    status: "ACTIVO",
    student: { firstName: "Ana", dni: "123" },
    level: "PRIMARIA",
    severity: "LEVE",
    reason: "DISCIPLINA",
  },
  {
    id: 2,
    status: "INACTIVO",
    student: { firstName: "Luis", dni: "456" },
    level: "SECUNDARIA",
    severity: "GRAVE",
    reason: "EXCESO_FALTAS",
  },
];

describe("directory-filter.service", () => {
  it("normaliza texto de forma estable", () => {
    expect(normalizeText("  Ana  ")).toBe("ana");
    expect(normalizeText(null)).toBe("");
  });

  it("detecta busqueda por multiples campos", () => {
    expect(matchesSearchTerm(items[0], "123", ["student.firstName", "student.dni"])).toBe(
      true,
    );
    expect(matchesSearchTerm(items[0], "no-match", ["student.firstName"])).toBe(
      false,
    );
  });

  it("filtra por estado", () => {
    expect(filterByStatus(items, "ACTIVO")).toEqual([items[0]]);
  });

  it("filtra por nivel", () => {
    expect(filterByLevel(items, "SECUNDARIA", (item) => item.level)).toEqual([
      items[1],
    ]);
  });

  it("filtra por una opcion generica", () => {
    expect(filterByOption(items, "GRAVE", (item) => item.severity)).toEqual([
      items[1],
    ]);
  });

  it("filtra por texto", () => {
    expect(
      filterDirectory(items, {
        searchTerm: "ana",
        searchKeys: ["student.firstName"],
      }),
    ).toEqual([items[0]]);
  });

  it("filtra combinado texto y estado", () => {
    expect(
      filterDirectory(items, {
        searchTerm: "luis",
        searchKeys: ["student.firstName"],
        status: "INACTIVO",
        getStatus: (item) => item.status,
      }),
    ).toEqual([items[1]]);
  });

  it("filtra por nivel y severidad", () => {
    expect(
      filterDirectory(items, {
        level: "PRIMARIA",
        getLevel: (item) => item.level,
        severity: "LEVE",
        getSeverity: (item) => item.severity,
      }),
    ).toEqual([items[0]]);
  });

  it("filtra por motivo", () => {
    expect(
      filterDirectory(items, {
        reason: "EXCESO_FALTAS",
        getReason: (item) => item.reason,
      }),
    ).toEqual([items[1]]);
  });

  it("no muta arreglo original", () => {
    const result = filterDirectory(items);
    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it("retorna todo si filtros estan vacios", () => {
    expect(filterByStatus(items, "TODOS")).toEqual(items);
    expect(filterByStatus(items, "ALL")).toEqual(items);
    expect(filterDirectory(items, { status: "TODOS" })).toEqual(items);
  });
});
