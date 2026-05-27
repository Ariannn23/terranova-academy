"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type HeaderUser = {
  name?: string | null;
  role?: string | null;
};

export default function Header({ user }: { user?: HeaderUser | null }) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between lg:justify-end w-full px-6 py-3 bg-white border-b border-slate-200 shadow-sm min-h-[64px]">
      {/* El espacio izquierdo se usa en móvil para dejarle lugar al botón hamburger. */}
      <div className="lg:hidden flex-1"></div>

      <div className="flex items-center space-x-4">
        {/* Información del usuario actual */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-800">
            {user?.name || "Usuario"}
          </span>
          <span className="text-xs text-slate-500">
            {user?.role || "ADMIN"}
          </span>
        </div>

        {/* Avatar simple de Tailwind (Luego lo reemplazaremos con Shared Component Avatar) */}
        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
          {initials}
        </div>

        {/* Botón Logout */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toast.info("Cerrando sesión...", {
              icon: <LogOut className="h-4 w-4" />,
            });
            signOut({ callbackUrl: "/login" });
          }}
          className="text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 ml-4 hidden sm:flex"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Salir
        </Button>

        {/* Logout solo icono (Mobile) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            toast.info("Cerrando sesión...", {
              icon: <LogOut className="h-4 w-4" />,
            });
            signOut({ callbackUrl: "/login" });
          }}
          className="text-slate-600 hover:text-red-600 sm:hidden ml-2"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
