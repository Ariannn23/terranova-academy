// src/lib/validations/user.schema.ts
// Schemas Zod para validación de operaciones sobre usuarios del sistema

import { z } from "zod";
import { ROLES } from "@/lib/rbac";

export const MIN_PASSWORD_LENGTH = 10;
export const MIN_PASSWORD_MESSAGE = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
export const DEFAULT_NEW_USER_PASSWORD_FALLBACK = "Terranova2026!";

export const INSTITUTIONAL_EMAIL_DOMAIN = "@terranova.edu.pe";
export const NAME_WITHOUT_NUMBERS_REGEX =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'.-]+$/;

export function resolveDefaultNewUserPassword(rawPassword?: string | null) {
  const normalized = rawPassword?.trim() ?? "";
  if (normalized.length >= MIN_PASSWORD_LENGTH) {
    return normalized;
  }
  return DEFAULT_NEW_USER_PASSWORD_FALLBACK;
}

const optionalRecoveryEmailSchema = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z
    .string()
    .email("Correo de recuperación inválido")
    .toLowerCase()
    .refine(
      (email) => !email.endsWith(INSTITUTIONAL_EMAIL_DOMAIN),
      "Usa un correo de apoyo externo, no el correo institucional.",
    )
    .nullable()
    .optional(),
);

export const userRoleEnum = z.enum(ROLES, {
  errorMap: () => ({ message: "Rol inválido" }),
});

/** Crear un nuevo usuario del sistema */
export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(NAME_WITHOUT_NUMBERS_REGEX, "El nombre solo debe contener letras y espacios."),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .refine(
      (email) => email.endsWith(INSTITUTIONAL_EMAIL_DOMAIN),
      `El correo debe terminar en ${INSTITUTIONAL_EMAIL_DOMAIN}`,
    ),
  recoveryEmail: optionalRecoveryEmailSchema,
  role: userRoleEnum,
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, MIN_PASSWORD_MESSAGE)
    .max(100, "La contraseña es demasiado larga"),
});

/** Actualizar datos básicos de un usuario (name y email son opcionales) */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .regex(NAME_WITHOUT_NUMBERS_REGEX, "El nombre solo debe contener letras y espacios.")
    .optional(),
  email: z
    .string()
    .email("Correo electrónico inválido")
    .toLowerCase()
    .refine(
      (email) => email.endsWith(INSTITUTIONAL_EMAIL_DOMAIN),
      `El correo debe terminar en ${INSTITUTIONAL_EMAIL_DOMAIN}`,
    )
    .optional(),
  recoveryEmail: optionalRecoveryEmailSchema,
});

/** Cambiar el rol de un usuario */
export const changeUserRoleSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  role: userRoleEnum,
});

/** Resetear la contraseña de un usuario */
export const resetUserPasswordSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, MIN_PASSWORD_MESSAGE)
    .max(100, "La contraseña es demasiado larga"),
});

/** Activar o desactivar un usuario */
export const toggleUserStatusSchema = z.object({
  userId: z.string().min(1, "El ID de usuario es obligatorio"),
  active: z.boolean({ required_error: "El estado activo es obligatorio" }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
