import { describe, expect, it } from "vitest";

import {
  filterBySearchKeys,
  getNestedValue,
  getTotalPages,
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

  it("pagina primera pagina", () => {
    expect(paginate(rows, 1, 1)).toEqual([rows[0]]);
  });

  it("pagina fuera de rango", () => {
    expect(paginate(rows, 99, 10)).toEqual([]);
  });

  it("calcula total de paginas", () => {
    expect(getTotalPages(21, 10)).toBe(3);
    expect(getTotalPages(0, 10)).toBe(1);
  });
});
