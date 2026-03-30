"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import { CreateStudentSchemaType as StudentFormValues } from "@/lib/validations/student.schema";

interface StudentGuardianFieldsProps {
  form: UseFormReturn<StudentFormValues>;
}

export function StudentGuardianFields({ form }: StudentGuardianFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label>Nombres</Label>
        <Input
          {...form.register("guardians.0.firstName")}
          placeholder="Ej. María"
        />
        {form.formState.errors.guardians?.[0]?.firstName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.guardians[0].firstName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Apellidos</Label>
        <Input
          {...form.register("guardians.0.lastName")}
          placeholder="Ej. Gomez"
        />
        {form.formState.errors.guardians?.[0]?.lastName && (
          <p className="text-sm text-red-500">
            {form.formState.errors.guardians[0].lastName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>DNI</Label>
        <Input
          {...form.register("guardians.0.dni")}
          placeholder="8 dígitos"
          maxLength={8}
        />
        {form.formState.errors.guardians?.[0]?.dni && (
          <p className="text-sm text-red-500">
            {form.formState.errors.guardians[0].dni.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Parentesco</Label>
        <Input
          {...form.register("guardians.0.relation")}
          placeholder="Ej. Padre, Madre, Tío"
        />
        {form.formState.errors.guardians?.[0]?.relation && (
          <p className="text-sm text-red-500">
            {form.formState.errors.guardians[0].relation.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Teléfono Celular</Label>
        <Input {...form.register("guardians.0.phone")} placeholder="9..." />
        {form.formState.errors.guardians?.[0]?.phone && (
          <p className="text-sm text-red-500">
            {form.formState.errors.guardians[0].phone.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Correo Electrónico (Opcional)</Label>
        <Input
          type="email"
          {...form.register("guardians.0.email")}
          placeholder="correo@ejemplo.com"
        />
      </div>
    </>
  );
}
