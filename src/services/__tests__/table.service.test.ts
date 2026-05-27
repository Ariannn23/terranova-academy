import { describe, expect, it } from "vitest";

import {
  filterBySearchKeys,
  getAlignClass,
  getFilteredTableData,
  getNestedValue,
  getPageRange,
  getTotalPages,
  normalizeSearchKeys,
  paginate,
} from "@/services/table.service";

const rows = [
  { id: 1, student: { firstName: "Ana", dni: "123" }, section: { name: "A" } },
  { id: 2, student: { firstName: "Luis", dni: "456" }, section: { name: "B" } },
];

describe("table.service", () => {
  it("obtiene valor con path simple", () => {
    expect(getNestedValue(rows[0], "id")).toBe(1);
  });

  it("obtiene valor con path anidado", () => {
    expect(getNestedValue(rows[0], "student.firstName")).toBe("Ana");
  });

  it("devuelve undefined con path inexistente", () => {
    expect(getNestedValue(rows[0], "student.guardian.phone")).toBeUndefined();
  });

  it("filtra por coincidencia exacta", () => {
    expect(filterBySearchKeys(rows, "123", ["student.dni"])).toEqual([rows[0]]);
  });

  it("filtra case-insensitive", () => {
    expect(filterBySearchKeys(rows, "ana", ["student.firstName"])).toEqual([
      rows[0],
    ]);
  });

  it("retorna copia completa si busqueda esta vacia", () => {
    const result = filterBySearchKeys(rows, "", ["student.firstName"]);
    expect(result).toEqual(rows);
    expect(result).not.toBe(rows);
  });

  it("normaliza searchKey simple y multiple", () => {
    expect(normalizeSearchKeys("student.dni")).toEqual(["student.dni"]);
    expect(normalizeSearchKeys(["student.dni", "section.name"])).toEqual([
      "student.dni",
      "section.name",
    ]);
    expect(normalizeSearchKeys()).toEqual([]);
  });

  it("obtiene datos filtrados para tabla", () => {
    expect(getFilteredTableData(rows, "B", ["section.name"])).toEqual([
      rows[1],
    ]);
    expect(getFilteredTableData(rows, "ana", [])).toBe(rows);
  });

  it("pagina primera pagina", () => {
    expect(paginate(rows, 1, 1)).toEqual([rows[0]]);
  });

  it("pagina intermedia", () => {
    expect(paginate([1, 2, 3, 4], 2, 2)).toEqual([3, 4]);
  });

  it("pagina fuera de rango", () => {
    expect(paginate(rows, 99, 10)).toEqual([]);
  });

  it("calcula total de paginas", () => {
    expect(getTotalPages(21, 10)).toBe(3);
    expect(getTotalPages(0, 10)).toBe(1);
    expect(getTotalPages(10, 0)).toBe(1);
  });

  it("calcula rango visible de pagina", () => {
    expect(getPageRange(1, 10, 25)).toEqual({ start: 1, end: 10 });
    expect(getPageRange(3, 10, 25)).toEqual({ start: 21, end: 25 });
    expect(getPageRange(1, 10, 0)).toEqual({ start: 0, end: 0 });
  });

  it("resuelve clases de alineacion", () => {
    expect(getAlignClass("left")).toBe("text-left");
    expect(getAlignClass("center")).toBe("text-center");
    expect(getAlignClass("right")).toBe("text-right");
    expect(getAlignClass()).toBe("text-left");
  });
});
