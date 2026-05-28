"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ConfirmPasswordResetSchema,
  type ConfirmPasswordResetValues,
} from "@/lib/validations/auth.schema";
import { confirmPasswordResetAction } from "@/lib/actions/auth.actions";
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
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordShell />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [redirectSeconds, setRedirectSeconds] = useState(5);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ConfirmPasswordResetValues>({
    resolver: zodResolver(ConfirmPasswordResetSchema),
    defaultValues: { token, password: "" },
  });

  function onSubmit(values: ConfirmPasswordResetValues) {
    setResultMessage(null);
    setResultError(null);

    startTransition(() => {
      confirmPasswordResetAction({ ...values, token }).then((result) => {
        if (result.success) {
          setResultMessage(result.message);
          setRedirectSeconds(5);
          form.reset({ token, password: "" });
          return;
        }

        setResultError(result.error);
      });
    });
  }

  useEffect(() => {
    if (!resultMessage) return;

    const interval = window.setInterval(() => {
      setRedirectSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(interval);
          router.push("/login");
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [resultMessage, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        {resultMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-6 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="reset-success-title"
              className="w-full max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h2
                id="reset-success-title"
                className="mt-5 text-2xl font-bold text-slate-950"
              >
                Contraseña actualizada correctamente
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Ya puedes iniciar sesion con tu nueva contraseña. Te
                redirigiremos al login en{" "}
                <span className="font-semibold text-emerald-700">
                  {redirectSeconds} segundos
                </span>
                .
              </p>
              <Button
                type="button"
                className="mt-6 h-11 w-full bg-emerald-700 text-white hover:bg-emerald-800"
                onClick={() => router.push("/login")}
              >
                Ir al login ahora
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Crear nueva contraseña
          </h1>
          <p className="text-sm text-slate-500">
            Define una contraseña segura para recuperar el acceso a tu cuenta.
          </p>
        </div>

        {!token ? (
          <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            El enlace de recuperacion no contiene un token valido.
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-5"
            >
              <input type="hidden" {...form.register("token")} value={token} />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva contraseña</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimo 10 caracteres"
                          className="h-11 pl-10 pr-10"
                          disabled={isPending || !!resultMessage}
                          autoComplete="new-password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-9 w-9 text-slate-400 hover:text-slate-600"
                          aria-label={
                            showPassword
                              ? "Ocultar contraseña"
                              : "Mostrar contraseña"
                          }
                          disabled={isPending || !!resultMessage}
                          onClick={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {resultError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {resultError}
                </div>
              )}

              <Button
                type="submit"
                disabled={isPending || !!resultMessage}
                className="h-11 w-full bg-emerald-700 text-white hover:bg-emerald-800"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </Button>
            </form>
          </Form>
        )}

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

function ResetPasswordShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-center text-sm text-slate-500">
          Preparando recuperacion...
        </p>
      </div>
    </main>
  );
}
