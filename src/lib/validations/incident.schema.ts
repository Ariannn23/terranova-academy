import { z } from "zod";

// ==========================================
// ENUMS (Replicando los de Prisma)
// ==========================================

export const IncidentSeverityEnum = z.enum(["LEVE", "MODERADO", "GRAVE"]);

export const DisabilityReasonEnum = z.enum([
  "EXCESO_FALTAS",
  "BAJO_RENDIMIENTO",
  "DISCIPLINA",
  "OTRO",
]);

export const LevelEnum = z.enum(["INICIAL", "PRIMARIA", "SECUNDARIA"]);

export const EventTypeEnum = z.enum([
  "EXAMEN",
  "FERIADO",
  "EVENTO",
  "REUNION",
  "OTRO",
]);

// ==========================================
// 1. INCIDENCES (Incident)
// ==========================================

export const IncidentSchema = z.object({
  id: z.string().optional(),
  enrollmentId: z.string().min(1, "El ID de la matrícula es requerido"),
  date: z.coerce.date({
    required_error: "La fecha del incidente es requerida",
    invalid_type_error: "Fecha inválida",
  }),
  description: z.string().min(5, "La descripción debe ser clara y detallada"),
  action: z.string().optional().nullable(),
  severity: IncidentSeverityEnum.default("LEVE"),
});

export type IncidentSchemaType = z.infer<typeof IncidentSchema>;

// ==========================================
// 2. DISABILITIES (Inhabilitaciones / Suspensiones)
// ==========================================

export const DisabilitySchema = z.object({
  id: z.string().optional(),
  enrollmentId: z.string().min(1, "El ID de la matrícula es requerido"),
  reason: DisabilityReasonEnum,
  description: z.string().optional().nullable(),
  startDate: z.coerce.date().default(() => new Date()),
  // Resuelto no se pasa en la creación, es interno.
});

export type DisabilitySchemaType = z.infer<typeof DisabilitySchema>;

export const ResolveDisabilitySchema = z.object({
  id: z.string().min(1, "El ID de la inhabilitación es requerido"),
  resolvedNote: z.string().min(5, "Debes dejar una nota de resolución válida"),
});

// ==========================================
// 3. ANNOUNCEMENTS (Comunicados Globales)
// ==========================================

export const AnnouncementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  body: z
    .string()
    .min(10, "El cuerpo del comunicado debe tener al menos 10 caracteres"),
  targetLevel: LevelEnum.optional().nullable(), // Null = Toda la escuela
});

export type AnnouncementSchemaType = z.infer<typeof AnnouncementSchema>;

// ==========================================
// 4. CALENDAR EVENTS (Eventos Académicos)
// ==========================================

export const CalendarEventSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, "El título del evento es requerido"),
  description: z.string().optional().nullable(),
  date: z.coerce.date({
    required_error: "La fecha inicial es requerida",
    invalid_type_error: "Fecha inválida",
  }),
  endDate: z.coerce.date().optional().nullable(),
  type: EventTypeEnum,
  academicYearId: z.string().min(1, "El ID del año académico es requerido"),
  allDay: z.boolean().default(true),
});

export type CalendarEventSchemaType = z.infer<typeof CalendarEventSchema>;
