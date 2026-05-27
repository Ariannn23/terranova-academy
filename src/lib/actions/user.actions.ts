"use server";

// src/lib/actions/user.actions.ts
// Server Actions para gestión administrativa de usuarios del sistema
// Solo accesible por el rol ADMIN

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";
import {
  createUserSchema,
  updateUserSchema,
  changeUserRoleSchema,
  resetUserPasswordSchema,
  toggleUserStatusSchema,
} from "@/lib/validations/user.schema";
import type { SafeUser } from "@/types/user";

const DEFAULT_NEW_USER_PASSWORD =
  process.env.DEFAULT_NEW_USER_PASSWORD?.trim() || "Terranova2026!";

// ─── Selector seguro (sin passwordHash) ──────────────────────────────────────
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─── getUsers ─────────────────────────────────────────────────────────────────
/**
 * Obtiene la lista de todos los usuarios del sistema.
 * Solo accesible por ADMIN. No devuelve passwordHash.
 */
export async function getUsers(): Promise<
  { success: true; data: SafeUser[] } | { success: false; error: string }
> {
  try {
    await requireRole(["ADMIN"]);

    const users = await prisma.user.findMany({
      select: SAFE_USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users as SafeUser[] };
  } catch (error) {
    const err = error as Error;
    if (
      err.name === "AuthenticationError" ||
      err.name === "AuthorizationError"
    ) {
      return { success: false, error: err.message };
    }
    console.error("[user.actions] Error in getUsers:", error);
    return { success: false, error: "Error al obtener los usuarios" };
  }
}

// ─── createUser ───────────────────────────────────────────────────────────────
/**
 * Crea un nuevo usuario del sistema.
 * Solo accesible por ADMIN. Hashea la contraseña antes de guardar.
 * El usuario se crea con active: true por defecto.
 */
export async function createUser(data: unknown): Promise<
  | { success: true; data: SafeUser; temporaryPassword: string }
  | { success: false; error: string | object }
> {
  try {
    await requireRole(["ADMIN"]);

    const parsed = createUserSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten() };
    }

    const { name, email, role } = parsed.data;
    const password = parsed.data.password.trim() || DEFAULT_NEW_USER_PASSWORD;

    // Verificar email único
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        success: false,
        error: "Ya existe un usuario con ese correo electrónico",
      };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, role, passwordHash, active: true },
      select: SAFE_USER_SELECT,
    });

    revalidatePath("/dashboard/usuarios");

    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.USER,
      entityId: user.id,
      newValue: { name, email, role, active: true },
      metadata: { module: "users", reason: "Nuevo usuario creado por ADMIN" },
    });

    return {
      success: true,
      data: user as SafeUser,
      temporaryPassword: password,
    };
  } catch (error) {
    const err = error as Error;
    if (
      err.name === "AuthenticationError" ||
      err.name === "AuthorizationError"
    ) {
      return { success: false, error: err.message };
    }
    console.error("[user.actions] Error in createUser:", error);
    return { success: false, error: "Error al crear el usuario" };
  }
}

// ─── updateUser ───────────────────────────────────────────────────────────────
/**
 * Actualiza nombre y/o email de un usuario.
 * Solo accesible por ADMIN.
 */
export async function updateUser(
  id: string,
  data: unknown,
): Promise<
  | { success: true; data: SafeUser }
  | { success: false; error: string | object }
> {
  try {
    await requireRole(["ADMIN"]);

    const parsed = updateUserSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten() };
    }

    // Verificar que no haya otro usuario con ese email
    if (parsed.data.email) {
      const conflict = await prisma.user.findFirst({
        where: { email: parsed.data.email, NOT: { id } },
      });
      if (conflict) {
        return {
          success: false,
          error: "Ya existe otro usuario con ese correo electrónico",
        };
      }
    }

    const before = await prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: SAFE_USER_SELECT,
    });

    revalidatePath("/dashboard/usuarios");

    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: user.id,
      oldValue: before,
      newValue: parsed.data,
      metadata: { module: "users", reason: "Datos de usuario actualizados" },
    });

    return { success: true, data: user as SafeUser };
  } catch (error) {
    const err = error as Error;
    if (
      err.name === "AuthenticationError" ||
      err.name === "AuthorizationError"
    ) {
      return { success: false, error: err.message };
    }
    console.error("[user.actions] Error in updateUser:", error);
    return { success: false, error: "Error al actualizar el usuario" };
  }
}

// ─── changeUserRole ───────────────────────────────────────────────────────────
/**
 * Cambia el rol de un usuario.
 * Protección: no permite degradar al último ADMIN activo del sistema.
 */
export async function changeUserRole(data: unknown): Promise<
  | { success: true; data: SafeUser }
  | { success: false; error: string | object }
> {
  try {
    await requireRole(["ADMIN"]);

    const parsed = changeUserRoleSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten() };
    }

    const { userId, role } = parsed.data;

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });

    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Protección: no degradar el último ADMIN activo
    if (target.role === "ADMIN" && role !== "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", active: true },
      });
      if (activeAdminCount <= 1) {
        return {
          success: false,
          error:
            "No se puede cambiar el rol del único ADMIN activo del sistema. Primero asigna el rol ADMIN a otro usuario.",
        };
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: SAFE_USER_SELECT,
    });

    revalidatePath("/dashboard/usuarios");

    await createAuditLog({
      action: AuditAction.CHANGE_STATUS,
      entity: AuditEntity.USER,
      entityId: user.id,
      oldValue: { role: target.role },
      newValue: { role },
      metadata: {
        module: "users",
        reason: `Rol cambiado de ${target.role} a ${role}`,
      },
    });

    return { success: true, data: user as SafeUser };
  } catch (error) {
    const err = error as Error;
    if (
      err.name === "AuthenticationError" ||
      err.name === "AuthorizationError"
    ) {
      return { success: false, error: err.message };
    }
    console.error("[user.actions] Error in changeUserRole:", error);
    return { success: false, error: "Error al cambiar el rol del usuario" };
  }
}

// ─── resetUserPassword ────────────────────────────────────────────────────────
/**
 * Resetea la contraseña de un usuario.
 * Solo accesible por ADMIN. Hashea la nueva contraseña con bcrypt.
 * No registra la contraseña en ningún log.
 */
export async function resetUserPassword(data: unknown): Promise<
  { success: true } | { success: false; error: string | object }
> {
  try {
    await requireRole(["ADMIN"]);

    const parsed = resetUserPasswordSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten() };
    }

    const { userId, password } = parsed.data;

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    revalidatePath("/dashboard/usuarios");

    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.USER,
      entityId: userId,
      metadata: {
        module: "users",
        reason: "Contraseña reseteada por ADMIN",
        targetEmail: target.email,
      },
    });

    return { success: true };
  } catch (error) {
    const err = error as Error;
    if (
      err.name === "AuthenticationError" ||
      err.name === "AuthorizationError"
    ) {
      return { success: false, error: err.message };
    }
    console.error("[user.actions] Error in resetUserPassword:", error);
    return { success: false, error: "Error al resetear la contraseña" };
  }
}

// ─── toggleUserStatus ─────────────────────────────────────────────────────────
/**
 * Activa o desactiva un usuario del sistema.
 * Solo accesible por ADMIN.
 * Protección: no permite desactivar al último ADMIN activo del sistema.
 * Un usuario inactivo no puede iniciar sesión.
 */
export async function toggleUserStatus(data: unknown): Promise<
  | { success: true; data: SafeUser; message: string }
  | { success: false; error: string | object }
> {
  try {
    await requireRole(["ADMIN"]);

    const parsed = toggleUserStatusSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten() };
    }

    const { userId, active } = parsed.data;

    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: SAFE_USER_SELECT,
    });

    if (!target) {
      return { success: false, error: "Usuario no encontrado" };
    }

    // Protección: no desactivar al último ADMIN activo
    if (!active && target.role === "ADMIN") {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", active: true },
      });
      if (activeAdminCount <= 1) {
        return {
          success: false,
          error:
            "No se puede desactivar al único ADMIN activo del sistema. Primero asigna el rol ADMIN a otro usuario activo.",
        };
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { active },
      select: SAFE_USER_SELECT,
    });

    revalidatePath("/dashboard/usuarios");

    await createAuditLog({
      action: AuditAction.CHANGE_STATUS,
      entity: AuditEntity.USER,
      entityId: userId,
      oldValue: { active: target.active },
      newValue: { active },
      metadata: {
        module: "users",
        reason: active
          ? `Usuario activado: ${target.email}`
          : `Usuario desactivado: ${target.email}`,
      },
    });

    const message = active
      ? "Usuario activado correctamente."
      : "Usuario desactivado correctamente.";

    return { success: true, data: user as SafeUser, message };
  } catch (error) {
    const err = error as Error;
    if (
      err.name === "AuthenticationError" ||
      err.name === "AuthorizationError"
    ) {
      return { success: false, error: err.message };
    }
    console.error("[user.actions] Error in toggleUserStatus:", error);
    return { success: false, error: "Error al cambiar el estado del usuario" };
  }
}
