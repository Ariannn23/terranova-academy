import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const AuditAction = {
  CREATE: "CREATE",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
  REGISTER_PAYMENT: "REGISTER_PAYMENT",
  CHANGE_STATUS: "CHANGE_STATUS",
  EXPORT_REPORT: "EXPORT_REPORT",
  GENERATE_PDF: "GENERATE_PDF",
  LOGIN_ATTEMPT: "LOGIN_ATTEMPT",
  REQUEST_PASSWORD_RESET: "REQUEST_PASSWORD_RESET",
  RESET_PASSWORD: "RESET_PASSWORD",
} as const;

export const AuditEntity = {
  STUDENT: "STUDENT",
  ENROLLMENT: "ENROLLMENT",
  PAYMENT: "PAYMENT",
  PAYMENT_TRANSACTION: "PAYMENT_TRANSACTION",
  GRADE: "GRADE",
  ATTENDANCE: "ATTENDANCE",
  INCIDENT: "INCIDENT",
  DISABILITY: "DISABILITY",
  REPORT: "REPORT",
  PDF: "PDF",
  USER: "USER",
  TEACHER: "TEACHER",
  COURSE: "COURSE",
  SECTION: "SECTION",
} as const;

type CreateAuditLogInput = {
  action: string;
  entity: string;
  entityId?: string | null;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "authorization",
  "cookie",
]);

function sanitizeAuditValue(value: unknown, depth = 0): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (depth > 4) return "[MAX_DEPTH]";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => sanitizeAuditValue(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
      continue;
    }
    sanitized[key] = sanitizeAuditValue(item, depth + 1);
  }
  return sanitized;
}

export function safeSerializeAuditValue(value: unknown) {
  if (value === undefined) return Prisma.JsonNull;

  try {
    const sanitized = sanitizeAuditValue(value);
    return JSON.parse(JSON.stringify(sanitized)) as Prisma.InputJsonValue;
  } catch {
    return { value: String(value) };
  }
}

export async function createAuditLog(input: CreateAuditLogInput) {
  try {
    const currentUser = await getCurrentUser().catch(() => null);

    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? currentUser?.id ?? null,
        userEmail: input.userEmail ?? currentUser?.email ?? null,
        userRole: input.userRole ?? currentUser?.role ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        oldValue: safeSerializeAuditValue(input.oldValue),
        newValue: safeSerializeAuditValue(input.newValue),
        metadata: safeSerializeAuditValue(input.metadata),
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}
