"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { processCredentialLogin } from "@/lib/auth/login-credentials";
import {
  ConfirmPasswordResetSchema,
  LoginSchema,
  RequestPasswordResetSchema,
} from "@/lib/validations/auth.schema";
import {
  buildPasswordResetUrl,
  generatePasswordResetToken,
  getPasswordResetExpiresAt,
  hashPasswordResetToken,
  sendPasswordResetEmail,
} from "@/lib/auth/password-reset";
import {
  assertPasswordWasNotRecentlyUsed,
  PASSWORD_REUSE_ERROR,
  recordPasswordHistory,
} from "@/lib/auth/password-history";
import { rememberTrustedDevice } from "@/lib/auth/trusted-device";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

export type LoginActionFailure = {
  success: false;
  error: string;
  remainingAttempts?: number;
  lockedUntil?: string;
};

export async function loginAction(
  data: unknown,
): Promise<LoginActionFailure | void> {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Correo electrónico o contraseña incorrectos.",
    };
  }

  const loginResult = await processCredentialLogin(parsed.data);

  if (!loginResult.success) {
    return {
      success: false,
      error: loginResult.message,
      remainingAttempts: loginResult.remainingAttempts,
      lockedUntil: loginResult.lockedUntil?.toISOString(),
    };
  }

  if (parsed.data.rememberDevice) {
    await rememberTrustedDevice(loginResult.user.id);
  }

  try {
    const { signIn } = await import("@/lib/auth");
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (isAuthErrorLike(error)) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Correo electrónico o contraseña incorrectos.",
          };
        default:
          return {
            success: false,
            error: "Lo sentimos, ha ocurrido un error de autenticación.",
          };
      }
    }
    // Re-throw el error para permitir que Next.js maneje la redirección (NEXT_REDIRECT) tras un login exitoso
    throw error;
  }
}

function isAuthErrorLike(error: unknown): error is { type: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    typeof (error as { type?: unknown }).type === "string"
  );
}

export type RequestPasswordResetResult = {
  success: true;
  message: string;
  devResetUrl?: string;
};

export type ConfirmPasswordResetResult =
  | { success: true; message: string }
  | { success: false; error: string };

const PASSWORD_RESET_GENERIC_MESSAGE =
  "Si la cuenta existe y tiene correo de recuperacion configurado, enviaremos instrucciones.";

export async function requestPasswordResetAction(
  data: Record<string, string>,
): Promise<RequestPasswordResetResult> {
  const parsed = RequestPasswordResetSchema.safeParse(data);
  if (!parsed.success) {
    return { success: true, message: PASSWORD_RESET_GENERIC_MESSAGE };
  }

  const email = parsed.data.email;
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      recoveryEmail: true,
    },
  });

  if (!user || !user.active || !user.recoveryEmail) {
    await createAuditLog({
      action: AuditAction.REQUEST_PASSWORD_RESET,
      entity: AuditEntity.USER,
      entityId: user?.id ?? null,
      userId: user?.id ?? null,
      userEmail: user?.email ?? email,
      userRole: null,
      metadata: {
        module: "auth",
        outcome: !user
          ? "user_not_found"
          : !user.active
            ? "inactive_user"
            : "missing_recovery_email",
      },
    });

    return { success: true, message: PASSWORD_RESET_GENERIC_MESSAGE };
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = getPasswordResetExpiresAt();
  const resetUrl = buildPasswordResetUrl(token);

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    }),
  ]);

  const emailResult = await sendPasswordResetEmail({
    to: user.recoveryEmail,
    resetUrl,
    userName: user.name,
  });

  await createAuditLog({
    action: AuditAction.REQUEST_PASSWORD_RESET,
    entity: AuditEntity.USER,
    entityId: user.id,
    userId: user.id,
    userEmail: user.email,
    userRole: null,
    metadata: {
      module: "auth",
      outcome: "requested",
      recoveryEmailConfigured: true,
      emailSent: emailResult.sent,
      emailStatus: emailResult.sent ? "sent" : emailResult.reason,
      expiresAt: expiresAt.toISOString(),
    },
  });

  return {
    success: true,
    message: PASSWORD_RESET_GENERIC_MESSAGE,
    devResetUrl: process.env.NODE_ENV === "production" ? undefined : resetUrl,
  };
}

export async function confirmPasswordResetAction(
  data: Record<string, string>,
): Promise<ConfirmPasswordResetResult> {
  const parsed = ConfirmPasswordResetSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "El enlace o la contraseña no son validos.",
    };
  }

  const tokenHash = hashPasswordResetToken(parsed.data.token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          active: true,
          passwordHash: true,
        },
      },
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= new Date() ||
    !resetToken.user.active
  ) {
    return {
      success: false,
      error: "El enlace de recuperacion es invalido o ha expirado.",
    };
  }

  try {
    await assertPasswordWasNotRecentlyUsed({
      userId: resetToken.userId,
      newPassword: parsed.data.password,
      currentPasswordHash: resetToken.user.passwordHash,
    });
  } catch (error) {
    if (error instanceof Error && error.message === PASSWORD_REUSE_ERROR) {
      return { success: false, error: PASSWORD_REUSE_ERROR };
    }

    throw error;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
    }),
  ]);

  await recordPasswordHistory({ userId: resetToken.userId, passwordHash });

  await createAuditLog({
    action: AuditAction.RESET_PASSWORD,
    entity: AuditEntity.USER,
    entityId: resetToken.userId,
    userId: resetToken.userId,
    userEmail: resetToken.user.email,
    userRole: null,
    metadata: {
      module: "auth",
      outcome: "password_reset_completed",
    },
  });

  return {
    success: true,
    message: "Contraseña actualizada correctamente. Ya puedes iniciar sesion.",
  };
}
