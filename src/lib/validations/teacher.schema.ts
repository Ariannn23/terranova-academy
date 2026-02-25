import { z } from "zod";

export const TeacherSchema = z.object({
  id: z.string().optional(),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(7, "Número de teléfono inválido")
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().url("URL de foto inválida").optional().or(z.literal("")),
  specialty: z
    .string()
    .min(2, "La especialidad es obligatoria")
    .optional()
    .or(z.literal("")),
  active: z.boolean().default(true),
});

export type TeacherSchemaType = z.infer<typeof TeacherSchema>;
