"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginAction(data: Record<string, string>) {
  try {
    await signIn("credentials", {
      ...data,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            error: "Correo electrónico o contraseña incorrectos.",
          };
        default:
          return {
            success: false,
            error: "Lo sentimos, ha ocurrido un error de autenticación.",
          };
      }
    }
    // Re-throw el error para permitir que Next.js maneje la redirección (NEXT_REDIRECT) tras un login exitoso
    throw error;
  }
}
