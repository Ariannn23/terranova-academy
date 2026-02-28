"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarEventSchema } from "@/lib/validations/incident.schema";
import {
  createCalendarEvent,
  updateCalendarEvent,
} from "@/lib/actions/calendar.actions";
import { useRouter } from "next/navigation";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventToEdit?: any;
  academicYearId: string;
}

export function CalendarModal({
  isOpen,
  onClose,
  eventToEdit,
  academicYearId,
}: CalendarModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extend schema to include academicYearId for internal use in the form if needed
  const form = useForm<z.infer<typeof CalendarEventSchema>>({
    resolver: zodResolver(CalendarEventSchema),
    defaultValues: {
      title: eventToEdit?.title || "",
      description: eventToEdit?.description || "",
      date: eventToEdit ? new Date(eventToEdit.date) : new Date(),
      endDate: eventToEdit?.endDate ? new Date(eventToEdit.endDate) : undefined,
      type: eventToEdit?.type || "ACTIVIDAD",
      academicYearId: academicYearId,
    },
  });

  const onSubmit = async (values: z.infer<typeof CalendarEventSchema>) => {
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
    } catch (error) {
      toast.error("Error al guardar el evento.", { id: "save-evt" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {eventToEdit ? "Editar Evento" : "Nuevo Evento"}
          </DialogTitle>
          <DialogDescription>
            Programa actividades, exámenes o días feriados en el calendario
            académico.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Evento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Examen Bimestral, Día del Maestro..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Evento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXAMEN">
                          Examen / Evaluación
                        </SelectItem>
                        <SelectItem value="ACTIVIDAD">
                          Actividad Escolar
                        </SelectItem>
                        <SelectItem value="FERIADO">Día Feriado</SelectItem>
                        <SelectItem value="REUNION">
                          Reunión Apoderados
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha (Inicio)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? (field.value as Date).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de Fin (Opcional - solo para rangos)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={
                        field.value
                          ? (field.value as Date).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detalles sobre este evento..."
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 gap-2 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Guardando..." : "Guardar Evento"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
