// lib/validations/attendance.schema.ts — Validaciones para Asistencia

import { z } from "zod";
import { AttendanceStatus } from "@prisma/client";

/**
 * Schema para registro individual de asistencia
 */
export const AttendanceRecordSchema = z.object({
  enrollmentId: z.string().min(1, "ID de matrícula requerido"),
  date: z.coerce.date(),
  status: z.enum([
    "PRESENTE",
    "TARDANZA",
    "FALTA_JUSTIFICADA",
    "FALTA_INJUSTIFICADA",
  ] as const),
  justification: z.string().optional(),
});

export type AttendanceRecord = z.infer<typeof AttendanceRecordSchema>;

/**
 * Schema para guardar múltiples registros de asistencia (batch)
 */
export const SaveAttendanceBatchSchema = z.object({
  records: z
    .array(AttendanceRecordSchema)
    .min(1, "Debe incluir al menos un registro"),
});

export type SaveAttendanceBatch = z.infer<typeof SaveAttendanceBatchSchema>;

/**
 * Schema para justificar una falta
 */
export const JustifyAbsenceSchema = z.object({
  attendanceId: z.string().min(1, "ID de asistencia requerido"),
  justification: z
    .string()
    .min(10, "La justificación debe tener al menos 10 caracteres")
    .max(500, "La justificación no puede exceder 500 caracteres"),
  justifiedBy: z
    .string()
    .min(1, "Quien justifica es requerido")
    .max(100, "Nombre muy largo"),
});

export type JustifyAbsence = z.infer<typeof JustifyAbsenceSchema>;

/**
 * Schema para filtrar asistencia por mes/año (opcional)
 */
export const AttendanceFilterSchema = z.object({
  enrollmentId: z.string().min(1, "ID de matrícula requerido"),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional(),
});

export type AttendanceFilter = z.infer<typeof AttendanceFilterSchema>;

/**
 * Schema para obtener asistencia crítica (filtro opcional por sección)
 */
export const CriticalAttendanceFilterSchema = z.object({
  sectionId: z.string().min(1, "ID de sección requerido").optional(),
});

export type CriticalAttendanceFilter = z.infer<
  typeof CriticalAttendanceFilterSchema
>;

/**
 * Schema para reporte de asistencia de sección
 */
export const SectionAttendanceReportSchema = z.object({
  sectionId: z.string().min(1, "ID de sección requerido"),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
});

export type SectionAttendanceReport = z.infer<
  typeof SectionAttendanceReportSchema
>;

export interface StudentAttendanceInput {
  enrollmentId: string;
  studentName: string;
  studentDni: string;
  status: AttendanceStatus | null;
  justification?: string;
}
