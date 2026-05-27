// src/lib/validations/__tests__/user.schema.test.ts
import { describe, it, expect } from "vitest";
import {
  createUserSchema,
  updateUserSchema,
  changeUserRoleSchema,
  resetUserPasswordSchema,
  toggleUserStatusSchema,
} from "@/lib/validations/user.schema";

describe("createUserSchema", () => {
  it("acepta Terranova2026! como contraseña temporal sugerida", () => {
    const result = createUserSchema.safeParse({
      name: "Usuario Temporal",
      email: "temporal@terranova.edu.pe",
      role: "CAJA",
      password: "Terranova2026!",
    });
    expect(result.success).toBe(true);
  });

  it("acepta datos válidos para crear un usuario", () => {
    const result = createUserSchema.safeParse({
      name: "Ana García",
      email: "ana@terranova.edu.pe",
      role: "DOCENTE",
      password: "SecurePass123",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza nombre vacío", () => {
    const result = createUserSchema.safeParse({
      name: "A",
      email: "ana@terranova.edu.pe",
      role: "DOCENTE",
      password: "SecurePass123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.name).toBeDefined();
  });

  it("rechaza email inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Ana García",
      email: "no-es-email",
      role: "DOCENTE",
      password: "SecurePass123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toBeDefined();
  });

  it("rechaza contraseña menor a 8 caracteres", () => {
    const result = createUserSchema.safeParse({
      name: "Ana García",
      email: "ana@terranova.edu.pe",
      role: "DOCENTE",
      password: "corta",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });

  it("rechaza contraseña vacía", () => {
    const result = createUserSchema.safeParse({
      name: "Ana García",
      email: "ana@terranova.edu.pe",
      role: "DOCENTE",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });

  it("rechaza un rol inválido", () => {
    const result = createUserSchema.safeParse({
      name: "Ana García",
      email: "ana@terranova.edu.pe",
      role: "SUPERUSER",
      password: "SecurePass123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.role).toBeDefined();
  });

  it("acepta todos los roles válidos del sistema", () => {
    const roles = [
      "ADMIN",
      "DIRECTOR",
      "DOCENTE",
      "RECEPCION",
      "CAJA",
      "COORDINADOR",
    ] as const;
    for (const role of roles) {
      const result = createUserSchema.safeParse({
        name: "Usuario Test",
        email: `${role.toLowerCase()}@test.com`,
        role,
        password: "SecurePass123",
      });
      expect(result.success, `Rol ${role} debe ser aceptado`).toBe(true);
    }
  });
});

describe("updateUserSchema", () => {
  it("acepta actualización solo de nombre", () => {
    const result = updateUserSchema.safeParse({ name: "Nuevo Nombre" });
    expect(result.success).toBe(true);
  });

  it("acepta actualización solo de email", () => {
    const result = updateUserSchema.safeParse({
      email: "nuevo@terranova.edu.pe",
    });
    expect(result.success).toBe(true);
  });

  it("acepta objeto vacío (sin cambios)", () => {
    const result = updateUserSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido en actualización", () => {
    const result = updateUserSchema.safeParse({ email: "no-es-email" });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.email).toBeDefined();
  });
});

describe("changeUserRoleSchema", () => {
  it("acepta cambio de rol válido", () => {
    const result = changeUserRoleSchema.safeParse({
      userId: "clabcdef123",
      role: "DIRECTOR",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza userId vacío", () => {
    const result = changeUserRoleSchema.safeParse({
      userId: "",
      role: "DIRECTOR",
    });
    expect(result.success).toBe(false);
  });

  it("rechaza rol inválido en cambio de rol", () => {
    const result = changeUserRoleSchema.safeParse({
      userId: "clabcdef123",
      role: "SUPERADMIN",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.role).toBeDefined();
  });
});

describe("resetUserPasswordSchema", () => {
  it("acepta Terranova2026! para reset", () => {
    const result = resetUserPasswordSchema.safeParse({
      userId: "clabcdef123",
      password: "Terranova2026!",
    });
    expect(result.success).toBe(true);
  });

  it("acepta contraseña válida para reset", () => {
    const result = resetUserPasswordSchema.safeParse({
      userId: "clabcdef123",
      password: "NuevaPass456",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza contraseña menor a 8 caracteres en reset", () => {
    const result = resetUserPasswordSchema.safeParse({
      userId: "clabcdef123",
      password: "abc",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });

  it("rechaza contraseña vacía en reset", () => {
    const result = resetUserPasswordSchema.safeParse({
      userId: "clabcdef123",
      password: "",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.password).toBeDefined();
  });

  it("rechaza userId vacío en reset", () => {
    const result = resetUserPasswordSchema.safeParse({
      userId: "",
      password: "NuevaPass456",
    });
    expect(result.success).toBe(false);
  });
});

// ─── toggleUserStatusSchema ───────────────────────────────────────────────────
describe("toggleUserStatusSchema", () => {
  it("acepta active: true", () => {
    const result = toggleUserStatusSchema.safeParse({
      userId: "clabcdef123",
      active: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(true);
    }
  });

  it("acepta active: false", () => {
    const result = toggleUserStatusSchema.safeParse({
      userId: "clabcdef123",
      active: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.active).toBe(false);
    }
  });

  it("rechaza userId vacío", () => {
    const result = toggleUserStatusSchema.safeParse({
      userId: "",
      active: true,
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.userId).toBeDefined();
  });

  it("rechaza cuando active está ausente", () => {
    const result = toggleUserStatusSchema.safeParse({
      userId: "clabcdef123",
    });
    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors.active).toBeDefined();
  });

  it("rechaza active como string en lugar de boolean", () => {
    const result = toggleUserStatusSchema.safeParse({
      userId: "clabcdef123",
      active: "true",
    });
    expect(result.success).toBe(false);
  });
});
