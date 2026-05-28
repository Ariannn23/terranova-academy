import { z } from "zod";

export const CourseSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, "El nombre del curso debe tener al menos 2 caracteres"),
  gradeLevelId: z.string().min(1, "El nivel de grado es obligatorio"),
  hoursPerWeek: z.number().min(1).default(2),
  active: z.boolean().default(true),
});

export const SectionSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre de la sección es obligatorio"),
  gradeLevelId: z.string().min(1, "El nivel de grado es obligatorio"),
  academicYearId: z.string().min(1, "El año académico es obligatorio"),
  teacherId: z.string().optional().nullable(),
  capacity: z.coerce
    .number()
    .int("La capacidad debe ser un número entero")
    .min(1, "La capacidad debe ser mayor a 0")
    .default(30),
});

export const ScheduleSchema = z
  .object({
    id: z.string().optional(),
    sectionId: z.string().min(1, "La sección es obligatoria"),
    courseId: z.string().min(1, "El curso es obligatorio"),
    teacherId: z.string().min(1, "El docente es obligatorio"),
    dayOfWeek: z.number().min(1).max(7, "Día de la semana inválido (1-7)"),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Formato de hora inicio inválido (HH:mm)",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Formato de hora fin inválido (HH:mm)",
      ),
  })
  .refine(
    (data) => {
      const [startClock, startMin] = data.startTime.split(":").map(Number);
      const [endClock, endMin] = data.endTime.split(":").map(Number);
      const startTotal = startClock * 60 + startMin;
      const endTotal = endClock * 60 + endMin;
      return endTotal > startTotal;
    },
    {
      message: "La hora de fin debe ser posterior a la hora de inicio",
      path: ["endTime"],
    },
  );

export type CourseSchemaType = z.infer<typeof CourseSchema>;
export type SectionSchemaType = z.infer<typeof SectionSchema>;
export type ScheduleSchemaType = z.infer<typeof ScheduleSchema>;
