"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RequestPasswordResetSchema,
  type RequestPasswordResetValues,
} from "@/lib/validations/auth.schema";
import { requestPasswordResetAction } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RequestPasswordResetValues>({
    resolver: zodResolver(RequestPasswordResetSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: RequestPasswordResetValues) {
    setMessage(null);
    setDevResetUrl(null);

    startTransition(() => {
      requestPasswordResetAction(values).then((result) => {
        setMessage(result.message);
        setDevResetUrl(result.devResetUrl ?? null);
      });
    });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Recuperar contraseña
          </h1>
          <p className="text-sm text-slate-500">
            Ingresa tu correo institucional. Si la cuenta tiene correo de apoyo
            configurado, enviaremos un enlace temporal.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo institucional</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="usuario@terranova.edu.pe"
                        className="h-11 pl-10"
                        disabled={isPending}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {message && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                {message}
              </div>
            )}

            {devResetUrl && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                Modo desarrollo:{" "}
                <Link className="font-semibold underline" href={devResetUrl}>
                  abrir enlace de recuperacion
                </Link>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="h-11 w-full bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar enlace de recuperacion"
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </main>
  );
}
