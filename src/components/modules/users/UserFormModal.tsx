"use client";

// src/components/modules/users/UserFormModal.tsx
// Modal para crear o editar un usuario del sistema

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
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
  INSTITUTIONAL_EMAIL_DOMAIN,
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

function normalizeEmailLocalPart(rawValue: string) {
  const trimmed = rawValue.trim().toLowerCase();
  if (!trimmed) {
    return { localPart: "", error: null as string | null };
  }

  if (trimmed.includes("@")) {
    const [local, domain] = trimmed.split("@");
    if (!local) {
      return { localPart: "", error: "Ingresa la parte local del correo." };
    }
    if (domain && domain !== INSTITUTIONAL_EMAIL_DOMAIN.replace("@", "")) {
      return {
        localPart: local,
        error: `Solo se permiten correos ${INSTITUTIONAL_EMAIL_DOMAIN}`,
      };
    }
    return { localPart: local, error: null as string | null };
  }

  return { localPart: trimmed, error: null as string | null };
}

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
    setError,
    clearErrors,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { role: "DOCENTE", password: defaultNewUserPassword },
  });

  const selectedRole = watch("role");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const institutionalSuffix = useMemo(() => INSTITUTIONAL_EMAIL_DOMAIN, []);

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
        <input type="hidden" {...register("email")} />
        <div className="flex items-center gap-2">
          <Input
            id="create-email"
            type="text"
            placeholder="usuario"
            value={emailLocalPart}
            onChange={(e) => {
              const normalized = normalizeEmailLocalPart(e.target.value);
              setEmailLocalPart(normalized.localPart);
              if (normalized.error) {
                setError("email", { message: normalized.error });
                setValue("email", "", { shouldValidate: true });
                return;
              }
              clearErrors("email");
              setValue(
                "email",
                normalized.localPart
                  ? `${normalized.localPart}${institutionalSuffix}`
                  : "",
                { shouldValidate: true },
              );
            }}
          />
          <span className="text-sm text-slate-600 whitespace-nowrap">
            {institutionalSuffix}
          </span>
        </div>
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
        <div className="flex items-center gap-2">
          <Input
            id="create-password"
            type={showPassword ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            {...register("password")}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={
              showPassword
                ? "Ocultar contraseña inicial"
                : "Mostrar contraseña inicial"
            }
            onClick={() => setShowPassword((prev) => !prev)}
            className="h-9 w-9 shrink-0"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
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
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: { name: user.name, email: user.email },
  });
  const [emailLocalPart, setEmailLocalPart] = useState(
    user.email.replace(INSTITUTIONAL_EMAIL_DOMAIN, ""),
  );
  const institutionalSuffix = useMemo(() => INSTITUTIONAL_EMAIL_DOMAIN, []);

  useEffect(() => {
    const initialLocalPart = user.email.endsWith(institutionalSuffix)
      ? user.email.replace(institutionalSuffix, "")
      : user.email.split("@")[0];
    setEmailLocalPart(initialLocalPart);
    reset({ name: user.name, email: `${initialLocalPart}${institutionalSuffix}` });
  }, [user, reset, institutionalSuffix]);

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
        <input type="hidden" {...register("email")} />
        <div className="flex items-center gap-2">
          <Input
            id="edit-email"
            type="text"
            value={emailLocalPart}
            onChange={(e) => {
              const normalized = normalizeEmailLocalPart(e.target.value);
              setEmailLocalPart(normalized.localPart);
              if (normalized.error) {
                setError("email", { message: normalized.error });
                setValue("email", "", { shouldValidate: true });
                return;
              }
              clearErrors("email");
              setValue(
                "email",
                normalized.localPart
                  ? `${normalized.localPart}${institutionalSuffix}`
                  : "",
                { shouldValidate: true },
              );
            }}
          />
          <span className="text-sm text-slate-600 whitespace-nowrap">
            {institutionalSuffix}
          </span>
        </div>
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
