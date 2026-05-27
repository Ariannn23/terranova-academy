"use client";

// src/components/modules/users/UsersClient.tsx
// Tabla de gestión de usuarios del sistema — solo ADMIN

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit2,
  KeyRound,
  ShieldCheck,
  Users,
  PowerOff,
  Power,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserFormModal } from "./UserFormModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { UserRoleBadge } from "./UserRoleBadge";
import { UserStatusBadge } from "./UserStatusBadge";
import { changeUserRole, toggleUserStatus } from "@/lib/actions/user.actions";
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

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

interface UsersClientProps {
  users: SafeUser[];
  defaultNewUserPassword: string;
}

export function UsersClient({
  users: initialUsers,
  defaultNewUserPassword,
}: UsersClientProps) {
  const [users, setUsers] = useState<SafeUser[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<SafeUser | null>(null);

  // ─── Filtrado ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && u.active) ||
        (statusFilter === "INACTIVE" && !u.active);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // ─── Handlers ────────────────────────────────────────────────────────────
  function openCreate() {
    setEditingUser(null);
    setIsFormOpen(true);
  }

  function openEdit(user: SafeUser) {
    setEditingUser(user);
    setIsFormOpen(true);
  }

  function openResetPassword(user: SafeUser) {
    setResetTarget(user);
    setIsResetOpen(true);
  }

  function handleSuccess() {
    window.location.reload();
  }

  async function handleRoleChange(user: SafeUser, newRole: UserRole) {
    if (newRole === user.role) return;

    const toastId = toast.loading(`Cambiando rol de ${user.name}...`);
    const result = await changeUserRole({ userId: user.id, role: newRole });

    if (result.success) {
      toast.success(
        `Rol de ${user.name} actualizado a ${ROLE_LABELS[newRole]}`,
        { id: toastId },
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)),
      );
    } else {
      const msg =
        typeof result.error === "string" ? result.error : "Error al cambiar rol";
      toast.error(msg, { id: toastId });
    }
  }

  async function handleToggleStatus(user: SafeUser) {
    const nextActive = !user.active;
    const action = nextActive ? "Activando" : "Desactivando";
    const toastId = toast.loading(`${action} a ${user.name}...`);

    const result = await toggleUserStatus({ userId: user.id, active: nextActive });

    if (result.success) {
      toast.success(result.message, { id: toastId });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, active: nextActive } : u,
        ),
      );
    } else {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Error al cambiar estado";
      toast.error(msg, { id: toastId });
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const byRole = ROLES.reduce(
      (acc, r) => ({ ...acc, [r]: users.filter((u) => u.role === r).length }),
      {} as Record<UserRole, number>,
    );
    const activeCount = users.filter((u) => u.active).length;
    const inactiveCount = users.filter((u) => !u.active).length;
    return { total: users.length, byRole, activeCount, inactiveCount };
  }, [users]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Gestión de Usuarios"
          description="Administración de accesos, roles y credenciales del sistema"
        />
        <Button
          onClick={openCreate}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          id="btn-nuevo-usuario"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo usuario
        </Button>
      </div>

      {/* KPI Cards — estados globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Total</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-emerald-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-emerald-700">
              {stats.activeCount}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Activos</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-rose-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-rose-600">
              {stats.inactiveCount}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Inactivos</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm border-indigo-100">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-black text-indigo-700">
              {stats.byRole["ADMIN"]}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Admins</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-600" />
                Usuarios del sistema
              </CardTitle>
              <CardDescription>
                {filtered.length} de {users.length} usuarios
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Búsqueda */}
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="search-usuarios"
                  placeholder="Nombre o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {/* Filtro por rol */}
              <Select
                value={roleFilter}
                onValueChange={(v) => setRoleFilter(v as UserRole | "ALL")}
              >
                <SelectTrigger className="w-[130px]" id="filter-role">
                  <SelectValue placeholder="Todos los roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos los roles</SelectItem>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Filtro por estado */}
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-[120px]" id="filter-status">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activos</SelectItem>
                  <SelectItem value="INACTIVE">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 font-semibold text-slate-600">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">
                    Cambiar rol
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden lg:table-cell">
                    Creado
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-slate-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-12 text-slate-400"
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/60 transition-colors ${!user.active ? "opacity-60" : ""}`}
                    >
                      {/* Usuario */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                              user.active
                                ? "bg-slate-200 text-slate-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-4 py-4">
                        <UserRoleBadge role={user.role as UserRole} />
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4">
                        <UserStatusBadge active={user.active} />
                      </td>

                      {/* Cambiar rol inline */}
                      <td className="px-4 py-4 hidden md:table-cell">
                        <Select
                          value={user.role}
                          onValueChange={(v) =>
                            handleRoleChange(user, v as UserRole)
                          }
                          disabled={!user.active}
                        >
                          <SelectTrigger
                            className="w-[140px] h-8 text-xs"
                            id={`role-select-${user.id}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem
                                key={r}
                                value={r}
                                className="text-xs"
                              >
                                {ROLE_LABELS[r]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Fecha creación */}
                      <td className="px-4 py-4 text-slate-500 text-xs hidden lg:table-cell">
                        {format(new Date(user.createdAt), "dd MMM yyyy", {
                          locale: es,
                        })}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Editar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Editar datos"
                            id={`btn-edit-${user.id}`}
                            onClick={() => openEdit(user)}
                            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>

                          {/* Resetear contraseña */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Resetear contraseña"
                            id={`btn-reset-${user.id}`}
                            onClick={() => openResetPassword(user)}
                            disabled={!user.active}
                            className="h-8 w-8 text-amber-500 hover:text-amber-700 hover:bg-amber-50 disabled:opacity-40"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Button>

                          {/* Activar / Desactivar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            id={`btn-toggle-${user.id}`}
                            title={user.active ? "Desactivar usuario" : "Activar usuario"}
                            onClick={() => handleToggleStatus(user)}
                            className={`h-8 w-8 ${
                              user.active
                                ? "text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                                : "text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            {user.active ? (
                              <PowerOff className="w-4 h-4" />
                            ) : (
                              <Power className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Indicador ADMIN */}
                          {user.role === "ADMIN" && (
                            <span title="Usuario con privilegios de administrador">
                              <ShieldCheck className="w-4 h-4 text-red-400 ml-1" />
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modales */}
      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleSuccess}
        editUser={editingUser}
        defaultNewUserPassword={defaultNewUserPassword}
      />

      <ResetPasswordModal
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        user={resetTarget}
      />
    </div>
  );
}
