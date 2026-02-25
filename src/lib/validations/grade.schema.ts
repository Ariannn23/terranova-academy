import { z } from "zod";
import { GradePeriod } from "@prisma/client";

export const GradeRecordSchema = z.object({
  id: z.string().optional(),
  enrollmentId: z.string().min(1, "La matrícula es obligatoria"),
  courseId: z.string().min(1, "El curso es obligatorio"),
  period: z.nativeEnum(GradePeriod),
  score: z
    .number()
    .min(0, "La nota mínima es 0")
    .max(20, "La nota máxima es 20")
    .nullable()
    .optional(),
  status: z.string().optional(),
});

export const BatchGradeSchema = z.object({
  sectionId: z.string().min(1, "La sección es obligatoria"),
  courseId: z.string().min(1, "El curso es obligatorio"),
  period: z.nativeEnum(GradePeriod),
  grades: z.array(
    z.object({
      enrollmentId: z.string().min(1),
      score: z.number().min(0).max(20).nullable().optional(),
    }),
  ),
});

export type GradeRecordSchemaType = z.infer<typeof GradeRecordSchema>;
export type BatchGradeSchemaType = z.infer<typeof BatchGradeSchema>;
