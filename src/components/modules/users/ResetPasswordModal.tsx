"use client";

// src/components/modules/users/ResetPasswordModal.tsx
// Modal para que el ADMIN resetee la contraseña de un usuario

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  resetUserPasswordSchema,
  type ResetUserPasswordInput,
} from "@/lib/validations/user.schema";
import { resetUserPassword } from "@/lib/actions/user.actions";
import type { SafeUser } from "@/types/user";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SafeUser | null;
}

export function ResetPasswordModal({
  isOpen,
  onClose,
  user,
}: ResetPasswordModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResetUserPasswordInput>({
    resolver: zodResolver(resetUserPasswordSchema),
    defaultValues: { userId: user?.id ?? "", password: "" },
  });

  async function onSubmit(data: ResetUserPasswordInput) {
    const toastId = toast.loading("Reseteando contraseña...");
    const result = await resetUserPassword({ ...data, userId: user?.id ?? "" });
    if (result.success) {
      toast.success("Contraseña reseteada exitosamente", { id: toastId });
      reset();
      onClose();
    } else {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Error de validación";
      toast.error(msg, { id: toastId });
    }
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
          {user && (
            <DialogDescription>
              Cambiar contraseña de{" "}
              <span className="font-semibold text-slate-900">{user.name}</span>{" "}
              ({user.email})
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("userId")} value={user?.id ?? ""} />

          <div className="space-y-1">
            <Label htmlFor="reset-password">Nueva contraseña</Label>
            <Input
              id="reset-password"
              type="password"
              placeholder="Mínimo 8 caracteres"
              {...register("password")}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <p className="text-xs text-slate-500">
            La nueva contraseña se aplica de inmediato. El usuario deberá
            usarla en su próximo inicio de sesión.
          </p>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isSubmitting ? "Reseteando..." : "Resetear contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
