import { describe, expect, it } from "vitest";

import { SectionSchema } from "@/lib/validations/academic.schema";

const baseSection = {
  name: "A",
  gradeLevelId: "grade-1",
  academicYearId: "year-1",
};

describe("SectionSchema", () => {
  it("acepta capacidad mayor a 0", () => {
    const result = SectionSchema.safeParse({
      ...baseSection,
      capacity: 35,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(35);
    }
  });

  it("rechaza capacidad cero", () => {
    const result = SectionSchema.safeParse({
      ...baseSection,
      capacity: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rechaza capacidad negativa", () => {
    const result = SectionSchema.safeParse({
      ...baseSection,
      capacity: -1,
    });

    expect(result.success).toBe(false);
  });

  it("convierte string numerico a numero", () => {
    const result = SectionSchema.safeParse({
      ...baseSection,
      capacity: "25",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(25);
    }
  });

  it("aplica capacidad por defecto de 30", () => {
    const result = SectionSchema.safeParse(baseSection);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.capacity).toBe(30);
    }
  });
});
