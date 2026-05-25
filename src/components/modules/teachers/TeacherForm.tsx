"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
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
  const { form, status, previewUrl, submitForm, handleFileChange, removePhoto, setStatus } = useTeacherForm(initialData);

  // Guardar toast reference para evitar duplicados si hay re-renders
  const toastIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (!open) return;

    if (status.state === "loading") {
      toastIdRef.current = toast.loading(
        initialData ? "Actualizando docente..." : "Registrando docente..."
      );
    } else if (status.state === "success") {
      if(toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.success(status.message);
      
      // Cleanup status para evitar re-gatillar success infinito
      setStatus(prev => ({ ...prev, state: "idle" }));
      
      onSuccess?.();
      onOpenChange(false);
    } else if (status.state === "error") {
      if(toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toast.error(status.message);
      } else {
        toast.error(status.message);
      }
      setStatus(prev => ({ ...prev, state: "idle" }));
    }
  }, [status, open, onSuccess, onOpenChange, initialData, setStatus]);

  const handlers = { handleFileChange, removePhoto };
  const loading = status.state === "loading";

  // Al cerrar explicitamente
  const handleCancelClick = () => {
     onOpenChange(false);
  }

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
