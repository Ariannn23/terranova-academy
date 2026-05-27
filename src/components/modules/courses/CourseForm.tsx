"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

import { useCourseForm, type CourseInitialData } from "./hooks/useCourseForm";

type CourseGradeLevelOption = {
  id: string;
  name: string;
  level: string;
};

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CourseInitialData;
  gradeLevels: CourseGradeLevelOption[];
  onSuccess?: () => void;
}

export function CourseForm({
  open,
  onOpenChange,
  initialData,
  gradeLevels,
  onSuccess,
}: CourseFormProps) {
  const {
    form,
    loading,
    onSubmit,
    closeForm,
    isActive,
    gradeLevelValue,
  } = useCourseForm({ initialData, onOpenChange, onSuccess });
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Editar Curso" : "Registrar Nuevo Curso"}
          </DialogTitle>
          <DialogDescription>
            Define la currÃ­cula y carga horaria para un grado especÃ­fico.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 mt-4"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Curso</Label>
              <Input
                id="name"
                placeholder="Ej. ComunicaciÃ³n MatemÃ¡tica"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeLevelId">Grado y Nivel</Label>
              <Select
                value={gradeLevelValue}
                onValueChange={(val) => setValue("gradeLevelId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name} ({g.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gradeLevelId && (
                <p className="text-xs text-red-500">
                  {errors.gradeLevelId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursPerWeek">Horas por Semana</Label>
              <Input
                id="hoursPerWeek"
                type="number"
                min={1}
                max={40}
                {...register("hoursPerWeek")}
              />
              {errors.hoursPerWeek && (
                <p className="text-xs text-red-500">
                  {errors.hoursPerWeek.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active"
                checked={isActive}
                onCheckedChange={(val) => setValue("active", val)}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Curso Activo
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeForm}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Actualizar" : "Guardar Curso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
