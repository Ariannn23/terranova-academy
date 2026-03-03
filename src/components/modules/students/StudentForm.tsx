"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useTransition, useEffect, useRef } from "react";
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
import { Loader2, Camera, X } from "lucide-react";
import { toast } from "sonner";

import { createStudent, updateStudent } from "@/lib/actions/student.actions";
import { uploadStudentPhoto } from "@/lib/actions/upload.actions";
import {
  CreateStudentSchema,
  CreateStudentSchemaType as StudentFormValues,
} from "@/lib/validations/student.schema";

export function StudentForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorProp, setErrorProp] = useState("");

  // Photo upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(CreateStudentSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dni: "",
      birthDate: "" as any,
      gender: "M",
      address: "",
      photoUrl: "",
      guardians: [
        {
          firstName: "",
          lastName: "",
          dni: "",
          relation: "",
          phone: "",
          email: "",
          isPrimary: true,
        },
      ],
    },
  });

  useEffect(() => {
    toast.dismiss();
    if (initialData) {
      const g = initialData.guardians && initialData.guardians[0];
      const birthDateString = initialData.birthDate
        ? new Date(initialData.birthDate).toISOString().split("T")[0]
        : "";

      setPreviewUrl(initialData.photoUrl || null);

      form.reset({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        dni: initialData.dni || "",
        birthDate: birthDateString as any,
        gender: initialData.gender || "M",
        address: initialData.address || "",
        photoUrl: initialData.photoUrl || "",
        guardians: [
          {
            firstName: g?.firstName || "",
            lastName: g?.lastName || "",
            dni: g?.dni || "",
            relation: g?.relation || "",
            phone: g?.phone || "",
            email: g?.email || "",
            isPrimary: true,
          },
        ],
      });
    }
  }, [initialData, form]);

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
    form.setValue("photoUrl", "");
  };

  const onSubmit = (data: StudentFormValues) => {
    setErrorProp("");

    const toastId = toast.loading(
      initialData ? "Actualizando estudiante..." : "Registrando estudiante...",
    );

    startTransition(async () => {
      try {
        const action = initialData
          ? await updateStudent(initialData.id, data)
          : await createStudent(data);

        if (action.success && action.data) {
          const studentId = action.data.id;

          // Si hay una foto seleccionada, subirla
          if (selectedFile) {
            toast.loading("Subiendo fotografía...", { id: toastId });
            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadRes = await uploadStudentPhoto(studentId, formData);
            if (!uploadRes.success) {
              toast.error(uploadRes.error || "Hubo un error con la foto", {
                id: toastId,
              });
            } else {
              toast.success(
                initialData
                  ? "Estudiante y foto actualizados exitosamente"
                  : "Estudiante registrado con éxito",
                { id: toastId },
              );
            }
          } else {
            toast.success(
              initialData
                ? "Estudiante actualizado exitosamente"
                : "Estudiante registrado exitosamente",
              { id: toastId },
            );
          }

          router.push("/dashboard/estudiantes");
          router.refresh();
        } else {
          toast.error(action.error || "Ocurrió un error al guardar", {
            id: toastId,
          });
          setErrorProp(action.error || "Ocurrió un error inesperado.");
        }
      } catch (error) {
        toast.error("Error de conexión o servidor", { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={initialData ? "Editar Estudiante" : "Crear Nuevo Estudiante"}
        description={
          initialData
            ? "Modifica los datos del alumno y de su apoderado principal."
            : "Registra un alumno y su respectivo apoderado."
        }
      />

      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        {/* Bloque: Alumno */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del Estudiante</CardTitle>
            <CardDescription>
              Información personal del nuevo alumno.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload de foto real */}
            <div className="col-span-full relative group border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 mb-4 transition-colors hover:bg-emerald-50 hover:border-emerald-200 overflow-hidden">
              <input
                type="file"
                ref={fileInputRef}
                id="student-photo-upload"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                title="Subir fotografía del estudiante"
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
                aria-label="Adjuntar fotografía del estudiante"
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
                      : "Adjuntar fotografía del estudiante"}
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
                  aria-label="Eliminar fotografía"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Nombres</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                placeholder="Ej. Juan"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Apellidos</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                placeholder="Ej. Pérez"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                {...form.register("dni")}
                placeholder="8 dígitos"
                maxLength={8}
              />
              {form.formState.errors.dni && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.dni.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                {...form.register("birthDate")}
              />
              {form.formState.errors.birthDate && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.birthDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Género</Label>
              <Select
                onValueChange={(val) => form.setValue("gender", val)}
                defaultValue={form.getValues("gender")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Dirección (Opcional)</Label>
              <Input
                {...form.register("address")}
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
                {...form.register("guardians.0.firstName")}
                placeholder="Ej. María"
              />
              {form.formState.errors.guardians?.[0]?.firstName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardians[0].firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Apellidos</Label>
              <Input
                {...form.register("guardians.0.lastName")}
                placeholder="Ej. Gomez"
              />
              {form.formState.errors.guardians?.[0]?.lastName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardians[0].lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>DNI</Label>
              <Input
                {...form.register("guardians.0.dni")}
                placeholder="8 dígitos"
                maxLength={8}
              />
              {form.formState.errors.guardians?.[0]?.dni && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardians[0].dni.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Parentesco</Label>
              <Input
                {...form.register("guardians.0.relation")}
                placeholder="Ej. Padre, Madre, Tío"
              />
              {form.formState.errors.guardians?.[0]?.relation && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardians[0].relation.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Teléfono Celular</Label>
              <Input
                {...form.register("guardians.0.phone")}
                placeholder="9..."
              />
              {form.formState.errors.guardians?.[0]?.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.guardians[0].phone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico (Opcional)</Label>
              <Input
                type="email"
                {...form.register("guardians.0.email")}
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
            {initialData ? "Actualizar Estudiante" : "Guardar Estudiante"}
          </Button>
        </div>
      </form>
    </div>
  );
}
