const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "authorization",
  "cookie",
  "session",
]);

export function sanitizeReportData<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (value instanceof Date) return value;
  if (typeof value !== "object") return value;

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeReportData(item)) as T;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) continue;
    sanitized[key] = sanitizeReportData(item);
  }

  return sanitized as T;
}

export function sanitizeStudentForReport<T extends Record<string, unknown>>(
  student: T,
) {
  return sanitizeReportData(student);
}

export function sanitizePaymentForReport<T extends Record<string, unknown>>(
  payment: T,
) {
  return sanitizeReportData(payment);
}

export function sanitizeIncidentForReport<T extends Record<string, unknown>>(
  incident: T,
) {
  return sanitizeReportData(incident);
}

export function sanitizeUserForReport<T extends Record<string, unknown>>(
  user: T,
) {
  return sanitizeReportData(user);
}
