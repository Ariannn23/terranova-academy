import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  CalendarDays,
  FileText,
  Briefcase,
  BookOpen,
  Clock,
  ShieldAlert,
  Megaphone,
  Settings,
} from "lucide-react";
import { getAllowedRolesForPath, hasAllowedRole, type AppRole } from "@/lib/rbac";

export type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: AppRole[];
};

export const navItems: NavigationItem[] = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Matrículas", href: "/dashboard/matriculas", icon: FileText },
  { name: "Estudiantes", href: "/dashboard/estudiantes", icon: Users },
  { name: "Docentes", href: "/dashboard/docentes", icon: Briefcase },
  { name: "Cursos", href: "/dashboard/cursos", icon: BookOpen },
  { name: "Horarios", href: "/dashboard/horarios", icon: Clock },
  { name: "Calificaciones", href: "/dashboard/notas", icon: GraduationCap },
  { name: "Asistencia", href: "/dashboard/asistencia", icon: CalendarCheck },
  { name: "Finanzas", href: "/dashboard/pagos", icon: CreditCard },
  { name: "Calendario", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Comunicados", href: "/dashboard/comunicados", icon: Megaphone },
  { name: "Inhabilitaciones", href: "/dashboard/inhabilitaciones", icon: ShieldAlert },
  { name: "Incidencias", href: "/dashboard/incidencias", icon: AlertTriangle },
  { name: "Reportes", href: "/dashboard/reportes", icon: FileText },
  { name: "Configuración", href: "/dashboard/configuracion", icon: Settings },
];

/**
 * Determina si un rol de usuario específico tiene acceso visual a un ítem de navegación
 * basándose en las reglas centralizadas de RBAC.
 */
export function canAccessNavigationItem(
  userRole: string | null | undefined,
  item: { href: string; allowedRoles?: AppRole[] }
): boolean {
  if (!userRole) return false;
  
  // Usar los roles permitidos específicos si existen, de lo contrario consultar el RBAC centralizado
  const allowed = item.allowedRoles ?? getAllowedRolesForPath(item.href);
  
  return hasAllowedRole(userRole, allowed);
}

/**
 * Filtra un arreglo de ítems de navegación basándose en el rol del usuario.
 */
export function filterNavigationByRole<T extends { href: string; allowedRoles?: AppRole[] }>(
  items: T[],
  userRole: string | null | undefined
): T[] {
  return items.filter((item) => canAccessNavigationItem(userRole, item));
}
