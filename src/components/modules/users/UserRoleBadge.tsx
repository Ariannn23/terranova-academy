"use client";

// src/components/modules/users/UserRoleBadge.tsx
// Badge visual con color por rol del sistema

import type { UserRole } from "@/types/user";

const ROLE_STYLES: Record<UserRole, { label: string; className: string }> = {
  ADMIN: {
    label: "Admin",
    className:
      "bg-red-100 text-red-800 border border-red-200 font-semibold",
  },
  DIRECTOR: {
    label: "Director",
    className:
      "bg-indigo-100 text-indigo-800 border border-indigo-200 font-semibold",
  },
  COORDINADOR: {
    label: "Coordinador",
    className:
      "bg-purple-100 text-purple-800 border border-purple-200 font-semibold",
  },
  DOCENTE: {
    label: "Docente",
    className:
      "bg-blue-100 text-blue-800 border border-blue-200 font-semibold",
  },
  RECEPCION: {
    label: "Recepción",
    className:
      "bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold",
  },
  CAJA: {
    label: "Caja",
    className:
      "bg-amber-100 text-amber-800 border border-amber-200 font-semibold",
  },
};

interface UserRoleBadgeProps {
  role: UserRole;
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const config = ROLE_STYLES[role] ?? {
    label: role,
    className: "bg-slate-100 text-slate-700 border border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${config.className}`}
    >
      {config.label}
    </span>
  );
}
