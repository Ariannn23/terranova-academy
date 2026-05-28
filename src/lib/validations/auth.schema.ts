import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z
    .string()
    .min(10, "La contraseña debe tener al menos 10 caracteres"),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;
