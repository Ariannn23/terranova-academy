import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createStudent, updateStudent } from "@/lib/actions/student.actions";
import { uploadStudentPhoto } from "@/lib/actions/upload.actions";
import {
  CreateStudentSchema,
  CreateStudentSchemaType as StudentFormValues,
} from "@/lib/validations/student.schema";

export function useStudentForm(initialData?: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorProp, setErrorProp] = useState("");

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

  return {
    form,
    isPending,
    errorProp,
    previewUrl,
    fileInputRef,
    handleFileChange,
    removePhoto,
    onSubmit,
    router,
  };
}
