import { describe, expect, it } from "vitest";

import {
  filterByLevel,
  filterByStatus,
  filterDirectory,
} from "@/services/directory-filter.service";

const items = [
  { id: 1, status: "ACTIVO", student: { firstName: "Ana" }, level: "PRIMARIA" },
  { id: 2, status: "INACTIVO", student: { firstName: "Luis" }, level: "SECUNDARIA" },
];

describe("directory-filter.service", () => {
  it("filtra por estado", () => {
    expect(filterByStatus(items, "ACTIVO")).toEqual([items[0]]);
  });

  it("filtra por nivel", () => {
    expect(filterByLevel(items, "SECUNDARIA", (item) => item.level)).toEqual([
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

  it("no muta arreglo original", () => {
    const result = filterDirectory(items);
    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it("retorna todo si filtros estan vacios", () => {
    expect(filterByStatus(items, "TODOS")).toEqual(items);
    expect(filterDirectory(items, { status: "TODOS" })).toEqual(items);
  });
});
