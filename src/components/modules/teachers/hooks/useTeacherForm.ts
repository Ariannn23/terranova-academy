import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { TeacherSchema, TeacherSchemaType } from "@/lib/validations/teacher.schema";
import { createTeacher, updateTeacher } from "@/lib/actions/teacher.actions";
import { uploadTeacherPhoto } from "@/lib/actions/upload.actions";
import { TeacherFormStatus } from "../types";

type TeacherInitialData = TeacherSchemaType & {
  id: string;
};

type UseTeacherFormOptions = {
  initialData?: TeacherInitialData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function useTeacherForm({
  initialData,
  open,
  onOpenChange,
  onSuccess,
}: UseTeacherFormOptions) {
  const [status, setStatus] = useState<TeacherFormStatus>({ state: "idle", isUpdate: !!initialData });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const toastIdRef = useRef<string | number | undefined>(undefined);

  const form = useForm<TeacherSchemaType>({
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
      form.reset(initialData);
      setPreviewUrl(initialData.photoUrl || null);
      setStatus({ state: "idle", isUpdate: true });
    } else {
      form.reset({ active: true });
      setPreviewUrl(null);
      setSelectedFile(null);
      setStatus({ state: "idle", isUpdate: false });
    }
  }, [initialData, form]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ state: "error", message: "La imagen excede el límite de 10 MB", isUpdate: !!initialData });
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus({ state: "idle", isUpdate: !!initialData });
    }
  }, [initialData]);

  const removePhoto = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreviewUrl(null);
    form.setValue("photoUrl", "");
  }, [form]);

  const submitForm = useCallback(async (data: TeacherSchemaType) => {
    setStatus({ state: "loading", isUpdate: !!initialData });

    try {
      const result = initialData
        ? await updateTeacher(initialData.id, data)
        : await createTeacher(data);

      if (result.success && result.data) {
        const teacherId = result.data.id;

        if (selectedFile) {
          const formData = new FormData();
          formData.append("file", selectedFile);
          
          const uploadRes = await uploadTeacherPhoto(teacherId, formData);
          
          if (!uploadRes.success) {
            setStatus({ state: "error", message: uploadRes.error || "Docente guardado pero hubo un error subiendo la foto", isUpdate: !!initialData });
          } else {
            setStatus({ state: "success", message: initialData ? "Docente y foto actualizados con éxito" : "Docente registrado con éxito", isUpdate: !!initialData });
          }
        } else {
          setStatus({ state: "success", message: initialData ? "Docente actualizado con éxito" : "Docente registrado con éxito", isUpdate: !!initialData });
        }
      } else {
        setStatus({ state: "error", message: result.error || "Error al guardar", isUpdate: !!initialData });
      }
    } catch {
      setStatus({ state: "error", message: "Error de conexión o servidor", isUpdate: !!initialData });
    }
  }, [initialData, selectedFile]);

  useEffect(() => {
    if (!open) return;

    if (status.state === "loading") {
      toastIdRef.current = toast.loading(
        initialData ? "Actualizando docente..." : "Registrando docente...",
      );
    } else if (status.state === "success") {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toast.success(status.message);
      setStatus((prev) => ({ ...prev, state: "idle" }));
      onSuccess?.();
      onOpenChange(false);
    } else if (status.state === "error") {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toast.error(status.message);
      } else {
        toast.error(status.message);
      }
      setStatus((prev) => ({ ...prev, state: "idle" }));
    }
  }, [initialData, onOpenChange, onSuccess, open, status]);

  const handleCancelClick = () => {
    onOpenChange(false);
  };

  return {
    form,
    loading: status.state === "loading",
    previewUrl,
    submitForm,
    handleFileChange,
    removePhoto,
    handleCancelClick,
  };
}
