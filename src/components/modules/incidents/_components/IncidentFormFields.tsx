"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { IncidentSchema } from "@/lib/validations/incident.schema";
import { Button } from "@/components/ui/button";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface IncidentFormFieldsProps {
  form: UseFormReturn<z.infer<typeof IncidentSchema>>;
  isSubmitting: boolean;
  activeEnrollment: { id: string } | null;
  router: AppRouterInstance;
}

export function IncidentFormFields({
  form,
  isSubmitting,
  activeEnrollment,
  router,
}: IncidentFormFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha del Incidente</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={
                    field.value
                      ? (field.value as Date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel de Severidad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona severidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="LEVE">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      Leve
                    </span>
                  </SelectItem>
                  <SelectItem value="MODERADO">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      Moderado
                    </span>
                  </SelectItem>
                  <SelectItem value="GRAVE">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      Grave
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs text-red-600" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descripción de lo ocurrido</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Ej. El alumno interrumpió la clase constantemente..."
                className="resize-none min-h-[100px]"
                {...field}
                value={field.value || ""}
              />
            </FormControl>
            <FormMessage className="text-xs text-red-600" />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="action"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Acción Tomada (Opcional)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ej. Se llamó al apoderado, amonestación verbal..."
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
          onClick={() => router.push("/dashboard/incidencias")}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={!activeEnrollment || isSubmitting}
        >
          {isSubmitting ? "Registrando..." : "Guardar Incidencia"}
        </Button>
      </div>
    </>
  );
}
