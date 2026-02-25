import { z } from "zod";

export const StudentStatusEnum = z.enum([
  "ACTIVO",
  "OBSERVADO",
  "EN_RIESGO",
  "INHABILITADO",
  "RETIRADO",
]);

export const GuardianSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().optional(),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  relation: z.string().min(2, "La relación es obligatoria"),
  phone: z.string().min(7, "Número de teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  isPrimary: z.boolean().default(false),
});

export const StudentSchema = z.object({
  id: z.string().optional(),
  dni: z.string().length(8, "El DNI debe tener 8 dígitos"),
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  birthDate: z.coerce.date({
    required_error: "La fecha de nacimiento es obligatoria",
    invalid_type_error: "Fecha de nacimiento inválida",
  }),
  gender: z.string().min(1, "El género es obligatorio"),
  address: z.string().optional(),
  photoUrl: z.string().url("URL de foto inválida").optional().or(z.literal("")),
  status: StudentStatusEnum.default("ACTIVO"),
});

// Schema combinado para creación masiva o wizard
export const CreateStudentSchema = StudentSchema.extend({
  guardians: z
    .array(GuardianSchema)
    .min(1, "Debe registrar al menos un apoderado"),
});

export type StudentSchemaType = z.infer<typeof StudentSchema>;
export type GuardianSchemaType = z.infer<typeof GuardianSchema>;
export type CreateStudentSchemaType = z.infer<typeof CreateStudentSchema>;
