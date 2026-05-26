"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  CalendarEventSchema,
  CalendarEventSchemaType,
} from "@/lib/validations/incident.schema";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "@/lib/actions/calendar.actions";

type CalendarEventInitialData = Partial<CalendarEventSchemaType> & {
  id: string;
  title?: string | null;
  description?: string | null;
  date?: Date | string;
  endDate?: Date | string | null;
};

type UseCalendarFormOptions = {
  eventToEdit?: CalendarEventInitialData;
  academicYearId: string;
  onClose: () => void;
};

export function useCalendarForm({
  eventToEdit,
  academicYearId,
  onClose,
}: UseCalendarFormOptions) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<
    CalendarEventSchemaType,
    unknown,
    CalendarEventSchemaType
  >({
    resolver: zodResolver(CalendarEventSchema),
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      date: eventToEdit?.date ? new Date(eventToEdit.date) : new Date(),
      endDate: eventToEdit?.endDate ? new Date(eventToEdit.endDate) : undefined,
      type: (eventToEdit?.type || "ACTIVIDAD") as CalendarEventSchemaType["type"],
      academicYearId,
    },
  });

  const onSubmit = async (values: CalendarEventSchemaType) => {
    setIsSubmitting(true);
    toast.loading(
      eventToEdit ? "Actualizando evento..." : "Registrando evento...",
      { id: "save-evt" },
    );

    try {
      const res = eventToEdit
        ? await updateCalendarEvent(eventToEdit.id, values)
        : await createCalendarEvent(values);

      if (res.success) {
        toast.success(
          eventToEdit ? "Evento actualizado." : "Evento registrado.",
          { id: "save-evt" },
        );
        form.reset();
        onClose();
        router.refresh();
      } else {
        toast.error(res.error as string, { id: "save-evt" });
      }
    } catch {
      toast.error("Error al guardar el evento.", { id: "save-evt" });
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
