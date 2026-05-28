import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const TRUSTED_DEVICE_COOKIE_NAME = "tn_trusted_device";
export const TRUSTED_DEVICE_TTL_DAYS = 30;
export const TRUSTED_DEVICE_TTL_SECONDS =
  TRUSTED_DEVICE_TTL_DAYS * 24 * 60 * 60;

export function generateTrustedDeviceToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashTrustedDeviceToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getTrustedDeviceExpiresAt(now = new Date()) {
  return new Date(now.getTime() + TRUSTED_DEVICE_TTL_SECONDS * 1000);
}

export async function rememberTrustedDevice(userId: string) {
  const token = generateTrustedDeviceToken();
  const tokenHash = hashTrustedDeviceToken(token);
  const expiresAt = getTrustedDeviceExpiresAt();
  const requestHeaders = headers();

  await prisma.trustedDeviceToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: requestHeaders.get("user-agent"),
      ip:
        requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        requestHeaders.get("x-real-ip"),
    },
  });

  cookies().set(TRUSTED_DEVICE_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TRUSTED_DEVICE_TTL_SECONDS,
    expires: expiresAt,
  });
}

export async function revokeCurrentTrustedDevice() {
  const token = cookies().get(TRUSTED_DEVICE_COOKIE_NAME)?.value;
  if (!token) return;

  await prisma.trustedDeviceToken.updateMany({
    where: {
      tokenHash: hashTrustedDeviceToken(token),
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });

  cookies().delete(TRUSTED_DEVICE_COOKIE_NAME);
}
