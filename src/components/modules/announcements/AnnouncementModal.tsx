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
import { AnnouncementSchema } from "@/lib/validations/incident.schema";
import { createAnnouncement } from "@/lib/actions/announcement.actions";
import { useRouter } from "next/navigation";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof AnnouncementSchema>>({
    resolver: zodResolver(AnnouncementSchema),
    defaultValues: {
      title: "",
      body: "",
      targetLevel: null,
    },
  });

  const onSubmit = async (values: z.infer<typeof AnnouncementSchema>) => {
    setIsSubmitting(true);
    toast.loading("Publicando comunicado...", { id: "create-ann" });

    try {
      // If targetLevel is "ALL" or empty string, convert to null
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
    } catch (error) {
      toast.error("Error al publicar el comunicado.", { id: "create-ann" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nuevo Comunicado</DialogTitle>
          <DialogDescription>
            Crea un anuncio que será visible para el personal y los apoderados.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Comunicado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej. Suspensión de clases por feriado..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel Destino</FormLabel>
                  <Select
                    onValueChange={(val) =>
                      field.onChange(val === "ALL" ? null : val)
                    }
                    defaultValue={field.value || "ALL"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona a quién va dirigido" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ALL">
                        Toda la Escuela (General)
                      </SelectItem>
                      <SelectItem value="INICIAL">Solo Inicial</SelectItem>
                      <SelectItem value="PRIMARIA">Solo Primaria</SelectItem>
                      <SelectItem value="SECUNDARIA">
                        Solo Secundaria
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido del Mensaje</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escribe aquí el cuerpo del comunicado..."
                      className="min-h-[200px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4 gap-2">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publicando..." : "Publicar Comunicado"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
