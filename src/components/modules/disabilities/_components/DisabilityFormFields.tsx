"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { DisabilitySchema } from "@/lib/validations/incident.schema";
import { Button } from "@/components/ui/button";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface DisabilityFormFieldsProps {
  form: UseFormReturn<z.infer<typeof DisabilitySchema>>;
  isSubmitting: boolean;
  activeEnrollment: { id: string } | null;
  router: AppRouterInstance;
}

export function DisabilityFormFields({
  form,
  isSubmitting,
  activeEnrollment,
  router,
}: DisabilityFormFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="reason"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Motivo Principal</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="DISCIPLINA">
                  Falta Disciplinaria / Conducta
                </SelectItem>
                <SelectItem value="BAJO_RENDIMIENTO">
                  Bajo Rendimiento Académico
                </SelectItem>
                <SelectItem value="EXCESO_FALTAS">
                  Exceso de Inasistencias Injustificadas
                </SelectItem>
                <SelectItem value="TRASLADO">
                  Cambio de colegio / Traslado
                </SelectItem>
                <SelectItem value="OTRO">Otro Motivo</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-xs text-red-600" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Descripción o Explicación del caso (Opcional)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ej. El alumno agredió a un compañero reiteradas veces..."
                className="resize-none min-h-[120px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage className="text-xs text-red-600" />
          </FormItem>
        )}
      />

      <div className="flex justify-end pt-4 gap-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/inhabilitaciones")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-red-600 hover:bg-red-700"
          disabled={!activeEnrollment || isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Confirmar Inhabilitación"}
        </Button>
      </div>
    </>
  );
}
