import crypto from "crypto";
import { Resend } from "resend";

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;

export type PasswordResetEmailResult =
  | { sent: true }
  | { sent: false; reason: "email_not_configured" | "send_failed" };

export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiresAt(now = new Date()) {
  return new Date(now.getTime() + PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
}

export function buildPasswordResetUrl(token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000";

  return `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(
    token,
  )}`;
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
  userName: string;
}): Promise<PasswordResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false, reason: "email_not_configured" };
  }

  try {
    const resend = new Resend(apiKey);

    await resend.emails.send({
      from,
      to: input.to,
      subject: "Recuperacion de acceso - TerraNova Academy",
      html: buildPasswordResetEmailHtml(input.userName, input.resetUrl),
    });

    return { sent: true };
  } catch (error) {
    console.error("[password-reset] Error sending reset email:", error);
    return { sent: false, reason: "send_failed" };
  }
}

function buildPasswordResetEmailHtml(userName: string, resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
      <h1 style="font-size: 20px;">TerraNova Academy</h1>
      <p>Hola ${escapeHtml(userName)},</p>
      <p>Recibimos una solicitud para recuperar el acceso a tu cuenta.</p>
      <p>
        <a href="${escapeHtml(resetUrl)}" style="display: inline-block; background: #047857; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none;">
          Crear nueva contraseña
        </a>
      </p>
      <p>Este enlace vence en ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.</p>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
