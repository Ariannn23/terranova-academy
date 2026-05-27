// src/lib/validations/user.schema.ts
// Schemas Zod para validación de operaciones sobre usuarios del sistema

import { z } from "zod";
import { ROLES } from "@/lib/rbac";

export const userRoleEnum = z.enum(ROLES, {
  errorMap: () => ({ message: "Rol inválido" }),
});

/** Crear un nuevo usuario del sistema */
export const createUserSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  role: userRoleEnum,
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(100, "La contraseña es demasiado larga"),
});

/** Actualizar datos básicos de un usuario (name y email son opcionales) */
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .optional(),
  email: z.string().email("Correo electrónico inválido").optional(),
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
    .min(8, "La contraseña debe tener al menos 8 caracteres")
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
