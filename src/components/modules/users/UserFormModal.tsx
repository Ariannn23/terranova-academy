"use client";

// src/components/modules/users/UserFormModal.tsx
// Modal para crear o editar un usuario del sistema

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "@/lib/validations/user.schema";
import { createUser, updateUser } from "@/lib/actions/user.actions";
import { ROLES } from "@/lib/rbac";
import type { SafeUser, UserRole } from "@/types/user";

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrador",
  DIRECTOR: "Director",
  COORDINADOR: "Coordinador",
  DOCENTE: "Docente",
  RECEPCION: "Recepción",
  CAJA: "Caja",
};

// ─── Create Form ──────────────────────────────────────────────────────────────
interface CreateFormProps {
  onSuccess: () => void;
  onClose: () => void;
  defaultNewUserPassword: string;
}

function CreateUserForm({
  onSuccess,
  onClose,
  defaultNewUserPassword,
}: CreateFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "DOCENTE", password: defaultNewUserPassword },
  });

  const selectedRole = watch("role");

  async function onSubmit(data: CreateUserInput) {
    const toastId = toast.loading("Creando usuario...");
    const result = await createUser(data);
    if (result.success) {
      toast.success(
        `Usuario creado correctamente (${result.data.email}). Contraseña temporal: ${result.temporaryPassword}`,
        { id: toastId },
      );
      onSuccess();
    } else {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Error de validación";
      toast.error(msg, { id: toastId });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="create-name">Nombre completo</Label>
        <Input
          id="create-name"
          placeholder="Ej: Ana García"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="create-email">Correo electrónico</Label>
        <Input
          id="create-email"
          type="email"
          placeholder="usuario@terranova.edu.pe"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="create-role">Rol</Label>
        <Select
          value={selectedRole}
          onValueChange={(v) => setValue("role", v as UserRole)}
        >
          <SelectTrigger id="create-role">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {ROLE_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-xs text-red-500">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="create-password">Contraseña inicial</Label>
        <Input
          id="create-password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
          Contraseña temporal inicial. El usuario debera cambiarla posteriormente.
        </p>
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isSubmitting ? "Creando..." : "Crear usuario"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Edit Form ────────────────────────────────────────────────────────────────
interface EditFormProps {
  user: SafeUser;
  onSuccess: () => void;
  onClose: () => void;
}

function EditUserForm({ user, onSuccess, onClose }: EditFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, email: user.email },
  });

  useEffect(() => {
    reset({ name: user.name, email: user.email });
  }, [user, reset]);

  async function onSubmit(data: UpdateUserInput) {
    const toastId = toast.loading("Actualizando usuario...");
    const result = await updateUser(user.id, data);
    if (result.success) {
      toast.success("Usuario actualizado", { id: toastId });
      onSuccess();
    } else {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Error de validación";
      toast.error(msg, { id: toastId });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="edit-name">Nombre completo</Label>
        <Input id="edit-name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="edit-email">Correo electrónico</Label>
        <Input id="edit-email" type="email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-slate-900 hover:bg-slate-800 text-white"
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editUser?: SafeUser | null;
  defaultNewUserPassword: string;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  editUser,
  defaultNewUserPassword,
}: UserFormModalProps) {
  const isEditing = !!editUser;

  function handleSuccess() {
    onSuccess();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
        </DialogHeader>

        {isEditing ? (
          <EditUserForm
            user={editUser}
            onSuccess={handleSuccess}
            onClose={onClose}
          />
        ) : (
          <CreateUserForm
            onSuccess={handleSuccess}
            onClose={onClose}
            defaultNewUserPassword={defaultNewUserPassword}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
