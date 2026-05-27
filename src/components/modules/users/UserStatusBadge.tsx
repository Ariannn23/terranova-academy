"use client";

// src/components/modules/users/UserStatusBadge.tsx
// Badge visual de estado activo/inactivo de un usuario del sistema

interface UserStatusBadgeProps {
  active: boolean;
}

export function UserStatusBadge({ active }: UserStatusBadgeProps) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
        Activo
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
      Inactivo
    </span>
  );
}
