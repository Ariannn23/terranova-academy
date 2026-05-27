"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AnnouncementSchema,
  AnnouncementSchemaType,
} from "@/lib/validations/incident.schema";
import { createAnnouncement } from "@/lib/actions/announcement.actions";
import { toast } from "sonner";

type UseAnnouncementFormOptions = {
  onClose: () => void;
};

export function useAnnouncementForm({ onClose }: UseAnnouncementFormOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnnouncementSchemaType>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: "",
      body: "",
      targetLevel: null,
    },
  });

  const onSubmit = async (values: AnnouncementSchemaType) => {
    setIsSubmitting(true);
    toast.loading("Publicando comunicado...", { id: "create-ann" });

    try {
      const processedValues = {
        ...values,
        targetLevel:
          (values.targetLevel as string) === "ALL" || !values.targetLevel
            ? null
            : values.targetLevel,
      };

      const res = await createAnnouncement(processedValues);

      if (res.success) {
        toast.success("Comunicado publicado exitosamente.", {
          id: "create-ann",
        });
        form.reset();
        onClose();
        router.refresh();
      } else {
        toast.error(res.error as string, { id: "create-ann" });
      }
    } catch {
      toast.error("Error al publicar el comunicado.", { id: "create-ann" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    onSubmit,
  };
}
