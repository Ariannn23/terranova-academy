import { UseFormReturn } from "react-hook-form";
import { TeacherSchemaType } from "@/lib/validations/teacher.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface TeacherFormFieldsProps {
  form: UseFormReturn<TeacherSchemaType>;
}

export function TeacherFormFields({ form }: TeacherFormFieldsProps) {
  const { register, watch, setValue, formState: { errors } } = form;
  const isActive = watch("active");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nombres</Label>
          <Input id="firstName" placeholder="Ej. Juan Carlos" {...register("firstName")} />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Apellidos</Label>
          <Input id="lastName" placeholder="Ej. Pérez Gómez" {...register("lastName")} />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dni">DNI</Label>
          <Input id="dni" placeholder="12345678" {...register("dni")} />
          {errors.dni && <p className="text-xs text-red-500">{errors.dni.message}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Correo Institucional</Label>
          <Input id="email" type="email" placeholder="juan@terranova.edu.pe" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono (Opcional)</Label>
          <Input id="phone" placeholder="987654321" {...register("phone")} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="specialty">Especialidad (Opcional)</Label>
          <Input id="specialty" placeholder="Matemáticas, Ciencias, etc." {...register("specialty")} />
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-lg border">
        <Switch
          id="active"
          checked={isActive}
          onCheckedChange={(val) => setValue("active", val)}
        />
        <Label htmlFor="active" className="cursor-pointer">
          {isActive
            ? "El docente está activo y puede ser asignado a cursos"
            : "Docente inactivo (No aparecerá en asignaciones)"}
        </Label>
      </div>
    </>
  );
}
