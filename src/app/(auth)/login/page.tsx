"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { loginAction } from "@/lib/actions/auth.actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, Lock } from "lucide-react";

// Esquema de validación del formulario
const LoginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function LoginPage() {
  const [errorProp, setErrorProp] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setErrorProp("");
    startTransition(() => {
      loginAction(values).then((res) => {
        if (res?.error) {
          setErrorProp(res.error);
        }
      });
    });
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
                            placeholder="••••••••"
                            type="password"
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
              </div>

              {errorProp && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-600 rounded-full" />
                  {errorProp}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-emerald-700 hover:bg-emerald-800 text-white font-medium transition-colors shadow-lg shadow-emerald-700/20"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-slate-500 mt-8">
            ¿Olvidaste tu contraseña?{" "}
            <a
              href="/login/recover"
              className="font-medium text-emerald-700 hover:underline"
            >
              Recupérala aquí
            </a>
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
