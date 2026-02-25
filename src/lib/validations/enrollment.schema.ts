import { z } from "zod";

export const EnrollmentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, "El estudiante es obligatorio"),
  sectionId: z.string().min(1, "La sección es obligatoria"),
  academicYearId: z.string().min(1, "El año académico es obligatorio"),
  notes: z.string().optional(),
  active: z.boolean().default(true),
});

export const SectionTransferSchema = z.object({
  enrollmentId: z.string().min(1, "El ID de matrícula es obligatorio"),
  newSectionId: z.string().min(1, "La nueva sección es obligatoria"),
  reason: z.string().min(5, "El motivo debe tener al menos 5 caracteres"),
});

export type EnrollmentSchemaType = z.infer<typeof EnrollmentSchema>;
export type SectionTransferSchemaType = z.infer<typeof SectionTransferSchema>;
