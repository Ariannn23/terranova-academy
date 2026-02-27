"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createTeacher, updateTeacher } from "@/lib/actions/teachers.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const teacherSchema = z.object({
  dni: z.string().min(8, "El DNI debe tener al menos 8 caracteres"),
  firstName: z.string().min(2, "El nombre es muy corto"),
  lastName: z.string().min(2, "Los apellidos son muy cortos"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  photoUrl: z.string().url("URL de foto inválida").optional().nullable(),
  active: z.boolean().default(true),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess?: () => void;
}

export function TeacherForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: TeacherFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData || {
      dni: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      specialty: "",
      photoUrl: "",
      active: true,
    },
  });

  // Load data when modal opens
  useState(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ active: true });
    }
  });

  const onSubmit = async (data: TeacherFormValues) => {
    setLoading(true);
    const result = initialData
      ? await updateTeacher(initialData.id, data)
      : await createTeacher(data);

    if (result.success) {
      toast.success(
        initialData ? "Docente actualizado" : "Docente registrado con éxito",
      );
      onSuccess?.();
      onOpenChange(false);
      reset();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const isActive = watch("active");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Docente" : "Registrar Nuevo Docente"}
          </DialogTitle>
          <DialogDescription>
            Ingresa la información personal y profesional del docente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input
                id="firstName"
                placeholder="Ej. Juan Carlos"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                placeholder="Ej. Pérez Gómez"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input id="dni" placeholder="12345678" {...register("dni")} />
              {errors.dni && (
                <p className="text-xs text-red-500">{errors.dni.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Institucional</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@terranova.edu.pe"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono (Opcional)</Label>
              <Input
                id="phone"
                placeholder="987654321"
                {...register("phone")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidad (Opcional)</Label>
              <Input
                id="specialty"
                placeholder="Matemáticas, Ciencias, etc."
                {...register("specialty")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoUrl">URL de Foto (Opcional)</Label>
            <Input
              id="photoUrl"
              placeholder="https://ejemplo.com/foto.jpg"
              {...register("photoUrl")}
            />
            {errors.photoUrl && (
              <p className="text-xs text-red-500">{errors.photoUrl.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-lg border">
            <Switch
              id="active"
              checked={isActive}
              onCheckedChange={(val) => setValue("active", val)}
            />
            <Label htmlFor="active" className="cursor-pointer">
              {isActive
                ? "El docente está activo y puede ser asignado a cursos"
                : "Docente inactivo (No aparecerá en asignaciones)"}
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Actualizar" : "Guardar Docente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
