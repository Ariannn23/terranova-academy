import { type AppRole, hasAllowedRole } from "@/lib/rbac";

export const REPORT_PERMISSIONS = {
  financial: ["ADMIN", "DIRECTOR", "CAJA"],
  grades: ["ADMIN", "DIRECTOR", "DOCENTE", "COORDINADOR"],
  attendance: ["ADMIN", "DIRECTOR", "DOCENTE", "COORDINADOR"],
  incidents: ["ADMIN", "DIRECTOR", "COORDINADOR"],
  disabilities: ["ADMIN", "DIRECTOR", "COORDINADOR"],
  enrollment: ["ADMIN", "DIRECTOR", "RECEPCION"],
  studentProfile: ["ADMIN", "DIRECTOR", "RECEPCION", "COORDINADOR"],
  receipt: ["ADMIN", "DIRECTOR", "CAJA"],
  communication: ["ADMIN", "DIRECTOR"],
} as const satisfies Record<string, readonly AppRole[]>;

export type ReportPermissionKey = keyof typeof REPORT_PERMISSIONS;

const PDF_REPORT_TYPE_MAP: Record<string, ReportPermissionKey> = {
  receipt: "receipt",
  grades: "grades",
  attendance: "attendance",
  "student-attendance": "attendance",
  incident: "incidents",
  "student-incidents": "incidents",
  "student-disabilities": "disabilities",
  "student-schedule": "attendance",
  enrollment: "enrollment",
  student: "studentProfile",
  communication: "communication",
};

export function getReportPermissionKey(type: string) {
  return PDF_REPORT_TYPE_MAP[type] ?? null;
}

export function getReportPermissions(type: string) {
  const key = getReportPermissionKey(type);
  return key ? REPORT_PERMISSIONS[key] : null;
}

export function canAccessReport(
  role: string | null | undefined,
  reportType: ReportPermissionKey,
) {
  return hasAllowedRole(role, REPORT_PERMISSIONS[reportType]);
}
