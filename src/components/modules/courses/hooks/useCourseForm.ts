"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { createCourse, updateCourse } from "@/lib/actions/course.actions";

export const courseSchema = z.object({
  name: z.string().min(2, "El nombre del curso es obligatorio"),
  gradeLevelId: z.string().min(1, "Debe seleccionar un nivel/grado"),
  hoursPerWeek: z.coerce
    .number()
    .min(1, "Debe tener al menos 1 hora")
    .max(40, "MÃ¡ximo 40 horas"),
  active: z.boolean().default(true),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

type CourseInitialData = CourseFormValues & {
  id: string;
};

type UseCourseFormOptions = {
  initialData?: CourseInitialData;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function useCourseForm({
  initialData,
  onOpenChange,
  onSuccess,
}: UseCourseFormOptions) {
  const [loading, setLoading] = useState(false);

  const form = useForm<CourseFormValues>({
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
      form.reset(initialData);
    } else {
      form.reset({ hoursPerWeek: 2, active: true });
    }
  }, [form, initialData]);

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
            ? "Curso actualizado con Ã©xito"
            : "Curso registrado con Ã©xito",
          { id: toastId },
        );
        onSuccess?.();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(result.error || "Error al guardar el curso", {
          id: toastId,
        });
      }
    } catch {
      toast.error("Error de conexiÃ³n o servidor", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const closeForm = () => {
    onOpenChange(false);
  };

  return {
    form,
    loading,
    onSubmit,
    closeForm,
    isActive: form.watch("active"),
    gradeLevelValue: form.watch("gradeLevelId"),
  };
}
