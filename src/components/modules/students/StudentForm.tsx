"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";

import { useStudentForm } from "./hooks/useStudentForm";
import { StudentPhotoUpload } from "./_components/StudentPhotoUpload";
import { StudentPersonalFields } from "./_components/StudentPersonalFields";
import { StudentGuardianFields } from "./_components/StudentGuardianFields";
import type { StudentFormInitialData } from "@/types/student";

export function StudentForm({
  initialData,
}: {
  initialData?: StudentFormInitialData;
}) {
  const {
    form,
    isPending,
    errorProp,
    previewUrl,
    fileInputRef,
    handleFileChange,
    removePhoto,
    onSubmit,
    router,
  } = useStudentForm(initialData);

  return (
    <div className="space-y-6">
      <div className="flex items-center text-sm text-slate-500 hover:text-slate-900 transition-colors w-fit -ml-2 mb-2">
        <ArrowLeft className="mr-2 h-4 w-4" />
        <Link href={initialData ? `/dashboard/estudiantes/${initialData.id}` : "/dashboard/estudiantes"}>
          {initialData ? "Volver al Perfil del Estudiante" : "Volver a Estudiantes"}
        </Link>
      </div>

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
            <StudentPhotoUpload
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              previewUrl={previewUrl}
              removePhoto={removePhoto}
            />
            <StudentPersonalFields form={form} />
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
            <StudentGuardianFields form={form} />
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
