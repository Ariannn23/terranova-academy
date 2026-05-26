"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { resolveDisability } from "@/lib/actions/disability.actions";
import { ResolveDisabilitySchema } from "@/lib/validations/incident.schema";

type DisabilityDetailRecord = {
  id: string;
  reason: string;
  description?: string | null;
  active: boolean;
  startDate: Date | string;
  resolvedNote?: string | null;
  resolvedAt?: Date | string | null;
  enrollment: {
    student: {
      firstName: string;
      lastName: string;
      dni: string;
    };
    section: {
      name: string;
      gradeLevel: {
        name: string;
      };
    };
  };
};

export function DisabilityDetailClient({
  record,
}: {
  record: DisabilityDetailRecord;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    toast.dismiss("view-disability");
  }, []);

  const form = useForm<z.infer<typeof ResolveDisabilitySchema>>({
    resolver: zodResolver(ResolveDisabilitySchema),
    defaultValues: {
      id: record.id,
      resolvedNote: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof ResolveDisabilitySchema>) => {
    setIsSubmitting(true);
    toast.loading("Levantando inhabilitación...", { id: "resolve-disab" });

    try {
      const res = await resolveDisability(values);
      if (res.success) {
        toast.success("Inhabilitación levantada correctamente.", {
          id: "resolve-disab",
        });
        router.push("/dashboard/inhabilitaciones");
        router.refresh(); // Refrescar el layout para asegurar recarga de datos
      } else {
        toast.error(String(res.error), { id: "resolve-disab" });
      }
    } catch {
      toast.error("Error al procesar la solicitud.", { id: "resolve-disab" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case "BAJO_RENDIMIENTO":
        return (
          <Badge variant="destructive" className="bg-red-500">
            Bajo Rendimiento
          </Badge>
        );
      case "EXCESO_FALTAS":
        return (
          <Badge
            variant="default"
            className="bg-orange-500 hover:bg-orange-600"
          >
            Exceso Faltas
          </Badge>
        );
      case "DISCIPLINA":
        return (
          <Badge
            variant="secondary"
            className="bg-purple-500 text-white hover:bg-purple-600"
          >
            Disciplina
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            Otro
          </Badge>
        );
    }
  };

  const isResolved = !record.active;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Detalles de Inhabilitación"
        description="Información detallada sobre la medida disciplinaria o académica tomada."
        breadcrumbs={[
          { label: "Inhabilitaciones", href: "/dashboard/inhabilitaciones" },
          { label: record.id.split("-")[0] },
        ]}
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/inhabilitaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-500" />
                Datos del Alumno
              </span>
              {getReasonBadge(record.reason)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-lg flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 flex flex-col items-center justify-center text-slate-700 font-bold shrink-0">
                {record.enrollment.student.firstName[0]}
                {record.enrollment.student.lastName[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  {record.enrollment.student.firstName}{" "}
                  {record.enrollment.student.lastName}
                </h3>
                <p className="text-sm text-slate-500 font-mono">
                  DNI: {record.enrollment.student.dni}
                </p>
                <div className="mt-2 text-sm text-slate-600">
                  <span className="font-medium mr-1">Sección:</span>
                  {record.enrollment.section.gradeLevel.name} &quot;
                  {record.enrollment.section.name}&quot;
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="font-semibold text-slate-700 text-sm mb-1">
                Descripción:
              </h4>
              <p className="text-slate-600 text-sm bg-white border rounded-md p-3 min-h-[60px]">
                {record.description ||
                  "No se especificaron detalles adicionales."}
              </p>
            </div>

            <div className="flex justify-between items-center text-sm pt-2 border-t mt-4 text-slate-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <strong>Registrado:</strong>&nbsp;
                {format(
                  new Date(record.startDate),
                  "dd 'de' MMMM, yyyy - HH:mm",
                  {
                    locale: es,
                  },
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {isResolved ? (
                <span className="text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Resolución
                </span>
              ) : (
                <span className="text-orange-700 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Levantar Inhabilitación
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isResolved ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-800 text-sm mb-2">
                    Inhabilitación Resuelta
                  </h4>
                  <p className="text-emerald-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {record.resolvedNote ||
                      "El caso fue resuelto sin dejar observaciones."}
                  </p>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Fecha de resolución:{" "}
                  {format(new Date(record.resolvedAt!), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="resolvedNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nota de Resolución Exigida</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Debe detallar los acuerdos a los que se llegó para reincorporar al alumno..."
                            className="resize-none min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Verificando condiciones..."
                        : "Resolver y Levantar Inhabilitación"}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
