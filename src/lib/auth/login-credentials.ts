import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";
import { LoginSchema } from "@/lib/validations/auth.schema";

export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

export const GENERIC_LOGIN_ERROR =
  "Correo electrónico o contraseña incorrectos.";

export const LOCKED_LOGIN_MESSAGE =
  "Cuenta bloqueada temporalmente por seguridad. Inténtalo nuevamente en 15 minutos.";

export type CredentialLoginSuccess = {
  success: true;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

export type CredentialLoginFailure = {
  success: false;
  message: string;
  remainingAttempts?: number;
  lockedUntil?: Date;
};

export type CredentialLoginResult =
  | CredentialLoginSuccess
  | CredentialLoginFailure;

type UserLockoutRecord = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  passwordHash: string;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastFailedLoginAt: Date | null;
};

const userLockoutSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  passwordHash: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  lastFailedLoginAt: true,
} as const;

export function isAccountLocked(lockedUntil: Date | null | undefined, now = new Date()) {
  return lockedUntil != null && lockedUntil > now;
}

export function getRemainingAttempts(failedLoginAttempts: number) {
  return Math.max(0, MAX_FAILED_LOGIN_ATTEMPTS - failedLoginAttempts);
}

export function buildInvalidPasswordMessage(remainingAttempts: number) {
  if (remainingAttempts <= 0) {
    return LOCKED_LOGIN_MESSAGE;
  }

  return `Credenciales incorrectas. Te quedan ${remainingAttempts} intentos antes del bloqueo temporal.`;
}

async function auditLoginAttempt(
  user: Pick<UserLockoutRecord, "id" | "email" | "role">,
  outcome: "success" | "failed" | "locked" | "inactive",
  metadata?: Record<string, unknown>,
) {
  await createAuditLog({
    action: AuditAction.LOGIN_ATTEMPT,
    entity: AuditEntity.USER,
    entityId: user.id,
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    metadata: { module: "auth", outcome, ...metadata },
  });
}

async function clearExpiredLockout(user: UserLockoutRecord): Promise<UserLockoutRecord> {
  if (!user.lockedUntil || user.lockedUntil > new Date()) {
    return user;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLoginAt: null,
    },
    select: userLockoutSelect,
  });
}

async function resetLoginAttempts(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastFailedLoginAt: null,
    },
  });
}

async function registerFailedAttempt(user: UserLockoutRecord) {
  const now = new Date();
  const nextAttempts = user.failedLoginAttempts + 1;
  const shouldLock = nextAttempts >= MAX_FAILED_LOGIN_ATTEMPTS;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: nextAttempts,
      lastFailedLoginAt: now,
      lockedUntil: shouldLock
        ? new Date(now.getTime() + LOCKOUT_DURATION_MS)
        : user.lockedUntil,
    },
    select: userLockoutSelect,
  });

  const remainingAttempts = getRemainingAttempts(updated.failedLoginAttempts);

  if (shouldLock) {
    await auditLoginAttempt(user, "locked", {
      failedLoginAttempts: updated.failedLoginAttempts,
      lockedUntil: updated.lockedUntil?.toISOString(),
    });

    return {
      success: false as const,
      message: LOCKED_LOGIN_MESSAGE,
      remainingAttempts: 0,
      lockedUntil: updated.lockedUntil ?? undefined,
    };
  }

  await auditLoginAttempt(user, "failed", {
    failedLoginAttempts: updated.failedLoginAttempts,
    remainingAttempts,
  });

  return {
    success: false as const,
    message: buildInvalidPasswordMessage(remainingAttempts),
    remainingAttempts,
  };
}

export async function processCredentialLogin(
  rawCredentials: unknown,
  options?: { sessionBootstrap?: boolean },
): Promise<CredentialLoginResult> {
  const parsed = LoginSchema.safeParse(rawCredentials);
  if (!parsed.success) {
    return { success: false, message: GENERIC_LOGIN_ERROR };
  }

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: userLockoutSelect,
  });

  if (!user) {
    return { success: false, message: GENERIC_LOGIN_ERROR };
  }

  const activeUser = await clearExpiredLockout(user);

  if (isAccountLocked(activeUser.lockedUntil)) {
    await auditLoginAttempt(activeUser, "locked", {
      failedLoginAttempts: activeUser.failedLoginAttempts,
      lockedUntil: activeUser.lockedUntil?.toISOString(),
    });

    return {
      success: false,
      message: LOCKED_LOGIN_MESSAGE,
      remainingAttempts: 0,
      lockedUntil: activeUser.lockedUntil ?? undefined,
    };
  }

  if (!activeUser.active) {
    await auditLoginAttempt(activeUser, "inactive");
    return { success: false, message: GENERIC_LOGIN_ERROR };
  }

  const valid = await bcrypt.compare(
    parsed.data.password,
    activeUser.passwordHash,
  );

  if (!valid) {
    if (options?.sessionBootstrap) {
      return { success: false, message: GENERIC_LOGIN_ERROR };
    }
    return registerFailedAttempt(activeUser);
  }

  if (!options?.sessionBootstrap) {
    await resetLoginAttempts(activeUser.id);
    await auditLoginAttempt(activeUser, "success");
  }

  return {
    success: true,
    user: {
      id: activeUser.id,
      email: activeUser.email,
      name: activeUser.name,
      role: activeUser.role,
    },
  };
}
