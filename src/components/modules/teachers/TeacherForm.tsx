"use client";

import { useState, useEffect, useRef } from "react";
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
import { createTeacher, updateTeacher } from "@/lib/actions/teacher.actions";
import { uploadTeacherPhoto } from "@/lib/actions/upload.actions";
import { toast } from "sonner";
import { Loader2, Camera, X } from "lucide-react";
import {
  TeacherSchema,
  TeacherSchemaType as TeacherFormValues,
} from "@/lib/validations/teacher.schema";

// Schema removed, using @/lib/validations/teacher.schema

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(TeacherSchema),
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

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setPreviewUrl(initialData.photoUrl || null);
    } else {
      reset({ active: true });
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [initialData, reset, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen excede el límite de 10 MB");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setValue("photoUrl", "");
  };

  const onSubmit = async (data: TeacherFormValues) => {
    setLoading(true);

    const toastId = toast.loading(
      initialData ? "Actualizando docente..." : "Registrando docente...",
    );

    try {
      const result = initialData
        ? await updateTeacher(initialData.id, data)
        : await createTeacher(data);

      if (result.success && result.data) {
        const teacherId = result.data.id;

        if (selectedFile) {
          toast.loading("Subiendo fotografía...", { id: toastId });
          const formData = new FormData();
          formData.append("file", selectedFile);

          const uploadRes = await uploadTeacherPhoto(teacherId, formData);
          if (!uploadRes.success) {
            toast.error(uploadRes.error || "Hubo un error con la foto", {
              id: toastId,
            });
          } else {
            toast.success(
              initialData
                ? "Docente y foto actualizados con éxito"
                : "Docente registrado con éxito",
              { id: toastId },
            );
          }
        } else {
          toast.success(
            initialData
              ? "Docente actualizado con éxito"
              : "Docente registrado con éxito",
            { id: toastId },
          );
        }

        onSuccess?.();
        onOpenChange(false);
        reset();
      } else {
        toast.error(result.error || "Error al guardar", { id: toastId });
      }
    } catch (error) {
      toast.error("Error de conexión o servidor", { id: toastId });
    } finally {
      setLoading(false);
    }
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

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 mt-4"
        >
          <div className="col-span-full relative group border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 mb-4 transition-colors hover:bg-emerald-50 hover:border-emerald-200 overflow-hidden">
            <input
              type="file"
              ref={fileInputRef}
              id="teacher-photo-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              title="Subir fotografía del docente"
              aria-label="Adjuntar fotografía del docente"
            />
            <div
              className="flex flex-col items-center justify-center p-6 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              aria-label="Adjuntar fotografía del docente"
            >
              {previewUrl ? (
                <div className="relative w-32 h-32 mb-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-sm"
                  />
                </div>
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center mb-3">
                  <Camera className="h-10 w-10 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              )}

              <div className="text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {previewUrl
                    ? "Clic para cambiar fotografía"
                    : "Adjuntar fotografía del docente"}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG (Max. 10MB)</p>
              </div>
            </div>

            {previewUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(e);
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors z-20"
                aria-label="Eliminar foto"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

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
