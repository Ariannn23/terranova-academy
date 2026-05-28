import { z } from "zod";
import { MIN_PASSWORD_LENGTH, MIN_PASSWORD_MESSAGE } from "./user.schema";

export const LoginSchema = z.object({
  email: z.string().email("Correo electronico invalido"),
  password: z.string().min(MIN_PASSWORD_LENGTH, MIN_PASSWORD_MESSAGE),
  rememberDevice: z.coerce.boolean().optional(),
  captchaToken: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof LoginSchema>;

export const RequestPasswordResetSchema = z.object({
  email: z.string().email("Correo electronico invalido").toLowerCase(),
});

export const ConfirmPasswordResetSchema = z.object({
  token: z.string().min(32, "Token invalido"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, MIN_PASSWORD_MESSAGE)
    .max(100, "La contraseña es demasiado larga"),
});

export type RequestPasswordResetValues = z.infer<
  typeof RequestPasswordResetSchema
>;
export type ConfirmPasswordResetValues = z.infer<
  typeof ConfirmPasswordResetSchema
>;
