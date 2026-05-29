import crypto from "crypto";
import nodemailer from "nodemailer";

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
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL;

  if (!host || !port || !user || !pass || !from) {
    return { sent: false, reason: "email_not_configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: "Recuperacion de acceso - TerraNova Academy",
      html: buildPasswordResetEmailHtml(input.userName, input.resetUrl),
    });

    return { sent: true };
  } catch (error) {
    console.error("[password-reset] SMTP send error:", error);
    return { sent: false, reason: "send_failed" };
  }
}

function buildPasswordResetEmailHtml(userName: string, resetUrl: string) {
  const safeUserName = escapeHtml(userName);
  const safeResetUrl = escapeHtml(resetUrl);

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Recuperacion de acceso</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background-color:#f8fafc;margin:0;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:24px;box-shadow:0 20px 45px rgba(15,23,42,0.08);overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 18px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:20px;line-height:28px;font-weight:700;color:#0f172a;">
                          <span style="color:#047857;">TerraNova</span> Academy
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top:18px;">
                          <div style="height:1px;line-height:1px;background-color:#e2e8f0;">&nbsp;</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:14px 32px 8px 32px;">
                    <div style="display:inline-block;padding:6px 12px;border-radius:999px;background-color:#ecfdf5;color:#047857;font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
                      Seguridad de cuenta
                    </div>
                    <h1 style="margin:18px 0 0 0;font-size:28px;line-height:36px;font-weight:800;color:#020617;">
                      Recuperacion de acceso
                    </h1>
                    <p style="margin:16px 0 0 0;font-size:15px;line-height:24px;color:#475569;">
                      Hola ${safeUserName}, recibimos una solicitud para crear una nueva contrasena de acceso a TerraNova Academy.
                    </p>
                    <p style="margin:12px 0 0 0;font-size:15px;line-height:24px;color:#475569;">
                      Para continuar, usa el siguiente enlace seguro. Por proteccion, el enlace solo estara disponible por tiempo limitado.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:28px 32px 16px 32px;">
                    <a href="${safeResetUrl}" style="display:inline-block;width:100%;max-width:320px;background-color:#047857;color:#ffffff;border-radius:14px;padding:15px 22px;font-size:15px;line-height:20px;font-weight:700;text-align:center;text-decoration:none;box-shadow:0 12px 24px rgba(4,120,87,0.22);">
                      Crear nueva contraseña
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 32px 24px 32px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;">
                      <tr>
                        <td style="padding:16px 18px;">
                          <p style="margin:0;font-size:14px;line-height:22px;color:#334155;">
                            <strong style="color:#0f172a;">Este enlace expirara en ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.</strong>
                          </p>
                          <p style="margin:8px 0 0 0;font-size:13px;line-height:21px;color:#64748b;">
                            Si no solicitaste este cambio, puedes ignorar este correo. Tu cuenta seguira protegida.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px 30px 32px;background-color:#0f172a;">
                    <p style="margin:0;font-size:13px;line-height:20px;color:#cbd5e1;text-align:center;">
                      TerraNova Academy &bull; Sistema de Gestion Escolar
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin:18px 0 0 0;font-size:12px;line-height:18px;color:#94a3b8;text-align:center;">
                Este es un mensaje automatico. No compartas este enlace con otras personas.
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>
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
