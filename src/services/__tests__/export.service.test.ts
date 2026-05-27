import { describe, expect, it } from "vitest";

import { buildCsvContent } from "@/services/export.service";

describe("export.service", () => {
  it("construye CSV con filas simples", () => {
    expect(
      buildCsvContent([
        ["DNI", "Nombre"],
        ["123", "Ana"],
      ]),
    ).toBe("DNI,Nombre\n123,Ana");
  });

  it("escapa valores con comas", () => {
    expect(buildCsvContent([["Concepto", "Matricula, Marzo"]])).toBe(
      'Concepto,"Matricula, Marzo"',
    );
  });

  it("escapa comillas", () => {
    expect(buildCsvContent([["Nombre", 'Ana "Principal"']])).toBe(
      'Nombre,"Ana ""Principal"""',
    );
  });

  it("maneja valores vacios", () => {
    expect(buildCsvContent([["A", null, undefined, "B"]])).toBe("A,,,B");
  });
});
