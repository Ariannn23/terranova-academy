"use client";

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
import { useAnnouncementForm } from "./hooks/useAnnouncementForm";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnnouncementModal({ isOpen, onClose }: AnnouncementModalProps) {
  const { form, isSubmitting, onSubmit } = useAnnouncementForm({ onClose });

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
