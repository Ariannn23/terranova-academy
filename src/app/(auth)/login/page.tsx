"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";
import { loginAction } from "@/lib/actions/auth.actions";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [errorProp, setErrorProp] = useState<string | undefined>("");
  const [showPassword, setShowPassword] = useState(false);
  const [lockedUntilMs, setLockedUntilMs] = useState<number | null>(null);
  const [lockedEmail, setLockedEmail] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberDevice: false,
    },
  });

  const currentEmail = form.watch("email").trim().toLowerCase();
  const lockoutAppliesToCurrentEmail = lockedEmail === currentEmail;

  const lockoutSecondsRemaining = useMemo(() => {
    if (!lockedUntilMs) return 0;
    return Math.max(0, Math.ceil((lockedUntilMs - nowMs) / 1000));
  }, [lockedUntilMs, nowMs]);

  const isLocked = lockoutAppliesToCurrentEmail && lockoutSecondsRemaining > 0;
  const lockoutCountdown = formatCountdown(lockoutSecondsRemaining);

  useEffect(() => {
    if (!lockedUntilMs) return;

    const interval = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [lockedUntilMs]);

  useEffect(() => {
    if (lockedUntilMs && lockoutSecondsRemaining <= 0) {
      setLockedUntilMs(null);
      setLockedEmail(null);
      setErrorProp("");
    }
  }, [lockedUntilMs, lockoutSecondsRemaining]);

  useEffect(() => {
    if (!lockoutAppliesToCurrentEmail && errorProp?.includes("bloqueada")) {
      setErrorProp("");
    }
  }, [errorProp, lockoutAppliesToCurrentEmail]);

  const onSubmit = (values: LoginFormValues) => {
    if (isLocked) return;

    setErrorProp("");
    const toastId = toast.loading("Verificando credenciales...");
    startTransition(() => {
      loginAction(values).then((res) => {
        if (res && "success" in res && res.success === false) {
          if (res.lockedUntil) {
            setLockedUntilMs(new Date(res.lockedUntil).getTime());
            setLockedEmail(values.email.trim().toLowerCase());
            setNowMs(Date.now());
          } else {
            setLockedUntilMs(null);
            setLockedEmail(null);
          }

          const description =
            res.remainingAttempts !== undefined && res.remainingAttempts > 0
              ? `Te quedan ${res.remainingAttempts} intentos antes del bloqueo temporal.`
              : res.lockedUntil
                ? "Tu cuenta está bloqueada temporalmente por seguridad."
                : undefined;

          toast.error(res.error, {
            id: toastId,
            description,
            duration: res.lockedUntil ? 10_000 : 6_000,
          });
          setErrorProp(res.error);
        } else {
          setLockedUntilMs(null);
          setLockedEmail(null);
          toast.success("¡Bienvenido al sistema!", { id: toastId });
        }
      });
    });
  };

  const useAnotherAccount = () => {
    form.setValue("email", "");
    form.setValue("password", "");
    setErrorProp("");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Lado Izquierdo: Formulario */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-12 lg:p-24 bg-white relative z-10 shadow-2xl">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center md:text-left space-y-2">
            <div className="flex justify-center md:justify-start items-center space-x-3 mb-6">
              <div className="flex items-center justify-center bg-white p-2 rounded-xl shadow-lg shadow-emerald-700/20">
                <Image
                  src="/terranova-icono.png"
                  alt="TerraNova Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                TerraNova <span className="text-emerald-700">Academy</span>
              </h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Bienvenido de nuevo
            </h2>
            <p className="text-slate-500 text-sm">
              Ingresa tus credenciales para acceder al panel de control.
            </p>
          </div>

          <Form {...form}>
            <form
              noValidate
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                          <Input
                            placeholder="director@terranova.edu.pe"
                            type="email"
                            className="pl-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-emerald-700"
                            disabled={isPending}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                          <Input
                            placeholder="Mínimo 10 caracteres"
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus-visible:ring-emerald-700"
                            disabled={isPending}
                            autoComplete="current-password"
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
                            disabled={isPending}
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
              </div>

              <FormField
                control={form.control}
                name="rememberDevice"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                      <FormControl>
                        <input
                          id="remember-device"
                          type="checkbox"
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                          checked={Boolean(field.value)}
                          disabled={isPending}
                          onChange={(event) =>
                            field.onChange(event.target.checked)
                          }
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <Label
                          htmlFor="remember-device"
                          className="cursor-pointer text-sm font-medium text-slate-700"
                        >
                          Recordar este equipo
                        </Label>
                        <p className="text-xs leading-5 text-slate-500">
                          Usalo solo en dispositivos personales. Guardaremos una
                          cookie segura por 30 dias.
                        </p>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {errorProp && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 shrink-0 rounded-full bg-red-600" />
                    <span>{errorProp}</span>
                  </div>
                  {isLocked && (
                    <button
                      type="button"
                      className="mt-3 text-sm font-semibold text-red-700 underline-offset-4 hover:underline"
                      onClick={useAnotherAccount}
                    >
                      Ingresar con otra cuenta
                    </button>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors shadow-lg shadow-emerald-700/20 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                disabled={isPending || isLocked}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : isLocked ? (
                  `Reintentar en ${lockoutCountdown}`
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-transparent mt-8">
            <Link
              href="/forgot-password"
              className="font-medium text-emerald-700 transition hover:text-emerald-800 hover:underline"
            >
              Recuperar Contraseña
            </Link>
            <span className="sr-only"> </span>
            ¿Olvidaste tu contraseña?{" "}
            <span title="Próximamente" className="hidden">
              Recupérala aquí
            </span>
          </p>
        </div>
      </div>

      {/* Lado Derecho: Imagen y Decoración */}
      <div className="hidden md:flex flex-1 relative bg-slate-900 overflow-hidden">
        {/* Usamos una imagen genérica premium de un campus con overlay para el panel derecho */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 to-slate-900/90 mix-blend-multiply z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')",
          }}
        />

        {/* Contenido en el lado derecho */}
        <div className="relative z-20 flex flex-col justify-end p-12 lg:p-24 w-full h-full text-white">
          <div className="space-y-6 max-w-lg">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 backdrop-blur-md">
              <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                Sistema de Gestión Escolar
              </p>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Excelencia educativa al alcance de un clic.
            </h2>
            <p className="text-emerald-50/80 text-lg">
              Administra matrículas, monitorea el rendimiento y gestiona los
              pagos de forma centralizada con la plataforma líder en innovación
              educativa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
