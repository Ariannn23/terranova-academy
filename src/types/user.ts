// src/types/user.ts
// Tipos de usuario del sistema TerraNova Academy
// No exponer passwordHash en ningún tipo público

import { type AppRole } from "@/lib/rbac";

export type UserRole = AppRole;

/** Representación pública segura de un usuario del sistema */
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
};

/** Payload para crear un nuevo usuario */
export type CreateUserInput = {
  name: string;
  email: string;
  role: UserRole;
  password: string;
};

/** Payload para actualizar datos básicos de un usuario */
export type UpdateUserInput = {
  name?: string;
  email?: string;
};

/** Payload para cambiar el rol de un usuario */
export type ChangeUserRoleInput = {
  userId: string;
  role: UserRole;
};

/** Payload para resetear contraseña */
export type ResetUserPasswordInput = {
  userId: string;
  password: string;
};
