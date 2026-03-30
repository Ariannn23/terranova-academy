"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CreateStudentSchemaType as StudentFormValues } from "@/lib/validations/student.schema";

interface StudentPersonalFieldsProps {
  form: UseFormReturn<StudentFormValues>;
}

export function StudentPersonalFields({ form }: StudentPersonalFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="firstName">Nombres</Label>
        <Input
          id="firstName"
          {...form.register("firstName")}
          placeholder="Ej. Juan"
        />
        {form.formState.errors.firstName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.firstName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Apellidos</Label>
        <Input
          id="lastName"
          {...form.register("lastName")}
          placeholder="Ej. Pérez"
        />
        {form.formState.errors.lastName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.lastName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dni">DNI</Label>
        <Input
          id="dni"
          {...form.register("dni")}
          placeholder="8 dígitos"
          maxLength={8}
        />
        {form.formState.errors.dni && (
          <p className="text-sm text-red-500">
            {form.formState.errors.dni.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
        <Input id="birthDate" type="date" {...form.register("birthDate")} />
        {form.formState.errors.birthDate && (
          <p className="text-sm text-red-500">
            {form.formState.errors.birthDate.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Género</Label>
        <Select
          onValueChange={(val) => form.setValue("gender", val as "M" | "F")}
          defaultValue={form.getValues("gender")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">Masculino</SelectItem>
            <SelectItem value="F">Femenino</SelectItem>
          </SelectContent>
        </Select>
        {form.formState.errors.gender && (
          <p className="text-sm text-red-500">
            {form.formState.errors.gender.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Dirección (Opcional)</Label>
        <Input {...form.register("address")} placeholder="Av. Principal 123" />
      </div>
    </>
  );
}
