"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useTeacherForm } from "./hooks/useTeacherForm";
import { TeacherPhotoUpload } from "./_components/TeacherPhotoUpload";
import { TeacherFormFields } from "./_components/TeacherFormFields";
import type { TeacherInitialData } from "./hooks/useTeacherForm";

interface TeacherFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: TeacherInitialData | null;
  onSuccess?: () => void;
}

export function TeacherForm({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: TeacherFormProps) {
  const {
    form,
    loading,
    previewUrl,
    submitForm,
    handleFileChange,
    removePhoto,
    handleCancelClick,
  } = useTeacherForm({
    initialData: initialData ?? undefined,
    open,
    onOpenChange,
    onSuccess,
  });

  const handlers = { handleFileChange, removePhoto };

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
          onSubmit={form.handleSubmit(submitForm)}
          className="space-y-6 mt-4"
        >
          <TeacherPhotoUpload previewUrl={previewUrl} handlers={handlers} />
          
          <TeacherFormFields form={form} />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelClick}
              disabled={loading}
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
