"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Camera } from "lucide-react";

import { createStudent } from "@/lib/actions/students.actions";

const studentSchema = z.object({
  student: z.object({
    firstName: z.string().min(2, "Mínimo 2 caracteres"),
    lastName: z.string().min(2, "Mínimo 2 caracteres"),
    dni: z.string().length(8, "DNI debe tener 8 dígitos"),
    birthDate: z.string().min(1, "Requerido"),
    gender: z.string().min(1, "Selecciona una opción"),
    address: z.string().optional(),
    photoUrl: z.string().optional(),
  }),
  guardian: z.object({
    firstName: z.string().min(2, "Mínimo 2 caracteres"),
    lastName: z.string().min(2, "Mínimo 2 caracteres"),
    dni: z.string().length(8, "DNI debe tener 8 dígitos"),
    relation: z.string().min(2, "Requerido (Ej. Padre, Madre)"),
    phone: z.string().min(6, "Teléfono inválido"),
    email: z.string().optional(),
  }),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export function StudentForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorProp, setErrorProp] = useState("");

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      student: {
        firstName: "",
        lastName: "",
        dni: "",
        birthDate: "",
        gender: "M",
        address: "",
        photoUrl: "",
      },
      guardian: {
        firstName: "",
        lastName: "",
        dni: "",
        relation: "",
        phone: "",
        email: "",
      },
    },
  });

  const onSubmit = (data: StudentFormValues) => {
    setErrorProp("");
    startTransition(() => {
      createStudent(data).then((res) => {
        if (res.success) {
          router.push("/dashboard/estudiantes");
          router.refresh();
        } else {
          setErrorProp(res.error || "Ocurrió un error inesperado.");
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Crear Nuevo Estudiante"
        description="Registra un alumno y su respectivo apoderado."
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Bloque: Alumno */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Estudiante</CardTitle>
            <CardDescription>
              Información personal del nuevo alumno.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload de foto simulado */}
            <div className="col-span-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 mb-4 transition-colors hover:bg-emerald-50 hover:border-emerald-200 cursor-pointer">
              <div className="h-20 w-20 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                <Camera className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Click para subir foto (Demo)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Nombres</Label>
              <Input
                {...form.register("student.firstName")}
                placeholder="Ej. Juan"
              />
              {form.formState.errors.student?.firstName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.student.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input
                {...form.register("student.lastName")}
                placeholder="Ej. Pérez"
              />
              {form.formState.errors.student?.lastName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.student.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>DNI</Label>
              <Input
                {...form.register("student.dni")}
                placeholder="8 dígitos"
                maxLength={8}
              />
              {form.formState.errors.student?.dni && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.student.dni.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Fecha de Nacimiento</Label>
              <Input type="date" {...form.register("student.birthDate")} />
              {form.formState.errors.student?.birthDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.student.birthDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Género</Label>
              <Select
                onValueChange={(val) => form.setValue("student.gender", val)}
                defaultValue={form.getValues("student.gender")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.student?.gender && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.student.gender.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Dirección (Opcional)</Label>
              <Input
                {...form.register("student.address")}
                placeholder="Av. Principal 123"
              />
            </div>
          </CardContent>
        </Card>

        {/* Bloque: Apoderado */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Apoderado (Principal)</CardTitle>
            <CardDescription>
              El contacto responsable del alumno.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nombres</Label>
              <Input
                {...form.register("guardian.firstName")}
                placeholder="Ej. María"
              />
              {form.formState.errors.guardian?.firstName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardian.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input
                {...form.register("guardian.lastName")}
                placeholder="Ej. Gomez"
              />
              {form.formState.errors.guardian?.lastName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardian.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>DNI</Label>
              <Input
                {...form.register("guardian.dni")}
                placeholder="8 dígitos"
                maxLength={8}
              />
              {form.formState.errors.guardian?.dni && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardian.dni.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Parentesco</Label>
              <Input
                {...form.register("guardian.relation")}
                placeholder="Ej. Padre, Madre, Tío"
              />
              {form.formState.errors.guardian?.relation && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardian.relation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Teléfono Celular</Label>
              <Input {...form.register("guardian.phone")} placeholder="9..." />
              {form.formState.errors.guardian?.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardian.phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico (Opcional)</Label>
              <Input
                type="email"
                {...form.register("guardian.email")}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </CardContent>
        </Card>

        {errorProp && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {errorProp}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-emerald-700 hover:bg-emerald-800"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Estudiante
          </Button>
        </div>
      </form>
    </div>
  );
}
