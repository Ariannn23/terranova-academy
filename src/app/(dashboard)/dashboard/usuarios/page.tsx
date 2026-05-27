// src/app/(dashboard)/dashboard/usuarios/page.tsx
// Módulo administrativo de usuarios — solo accesible por ADMIN

import { getUsers } from "@/lib/actions/user.actions";
import { UsersClient } from "@/components/modules/users/UsersClient";

export const metadata = {
  title: "Gestión de Usuarios | TerraNova Academy",
  description: "Administración de usuarios y roles del sistema",
};

export default async function UsersPage() {
  const result = await getUsers();

  if (!result.success) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar los usuarios: {result.error as string}
      </div>
    );
  }

  return <UsersClient users={result.data} />;
}
