"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCourse, updateCourse } from "@/lib/actions/course.actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const courseSchema = z.object({
  name: z.string().min(2, "El nombre del curso es obligatorio"),
  gradeLevelId: z.string().min(1, "Debe seleccionar un nivel/grado"),
  hoursPerWeek: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 hora")
    .max(40, "Máximo 40 horas"),
  active: z.boolean().default(true),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  gradeLevels: any[];
  onSuccess?: () => void;
}

export function CourseForm({
  open,
  onOpenChange,
  initialData,
  gradeLevels,
  onSuccess,
}: CourseFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialData || {
      name: "",
      gradeLevelId: "",
      hoursPerWeek: 2,
      active: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ hoursPerWeek: 2, active: true });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: CourseFormValues) => {
    setLoading(true);

    const toastId = toast.loading(
      initialData ? "Actualizando curso..." : "Registrando curso...",
    );

    try {
      const result = initialData
        ? await updateCourse(initialData.id, data)
        : await createCourse(data);

      if (result.success) {
        toast.success(
          initialData
            ? "Curso actualizado con éxito"
            : "Curso registrado con éxito",
          { id: toastId },
        );
        onSuccess?.();
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Error al guardar el curso", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Error de conexión o servidor", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const isActive = watch("active");
  const gradeLevelValue = watch("gradeLevelId");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Curso" : "Registrar Nuevo Curso"}
          </DialogTitle>
          <DialogDescription>
            Define la currícula y carga horaria para un grado específico.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 mt-4"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Curso</Label>
              <Input
                id="name"
                placeholder="Ej. Comunicación Matemática"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevelId">Grado y Nivel</Label>
              <Select
                value={gradeLevelValue}
                onValueChange={(val) => setValue("gradeLevelId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gradeLevelId && (
                <p className="text-xs text-red-500">
                  {errors.gradeLevelId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Horas por Semana</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                min={1}
                max={40}
                {...register("hoursPerWeek")}
              />
              {errors.hoursPerWeek && (
                <p className="text-xs text-red-500">
                  {errors.hoursPerWeek.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={(val) => setValue("active", val)}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Curso Activo
              </Label>
            </div>
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
              {initialData ? "Actualizar" : "Guardar Curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
