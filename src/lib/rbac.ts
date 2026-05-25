export const ROLES = [
  "ADMIN",
  "DIRECTOR",
  "DOCENTE",
  "RECEPCION",
  "CAJA",
  "COORDINADOR",
] as const;

export type AppRole = (typeof ROLES)[number];

export const ALL_ROLES: AppRole[] = [...ROLES];

export const ROLE_GROUPS = {
  ADMINISTRATION: ["ADMIN", "DIRECTOR"] as AppRole[],
  ACADEMIC: ["ADMIN", "DIRECTOR", "COORDINADOR", "DOCENTE"] as AppRole[],
  ADMISSIONS: ["ADMIN", "DIRECTOR", "RECEPCION"] as AppRole[],
  FINANCE: ["ADMIN", "DIRECTOR", "CAJA"] as AppRole[],
  DISCIPLINE: ["ADMIN", "DIRECTOR", "COORDINADOR"] as AppRole[],
  REPORTS: ["ADMIN", "DIRECTOR", "COORDINADOR", "CAJA"] as AppRole[],
};

export const ROUTE_ROLE_RULES: { prefix: string; roles: AppRole[] }[] = [
  { prefix: "/dashboard/configuracion", roles: ROLE_GROUPS.ADMINISTRATION },
  { prefix: "/dashboard/docentes", roles: ROLE_GROUPS.ADMINISTRATION },
  { prefix: "/dashboard/cursos", roles: ROLE_GROUPS.ACADEMIC },
  { prefix: "/dashboard/horarios", roles: ROLE_GROUPS.ACADEMIC },
  { prefix: "/dashboard/notas", roles: ROLE_GROUPS.ACADEMIC },
  { prefix: "/dashboard/asistencia", roles: ROLE_GROUPS.ACADEMIC },
  { prefix: "/dashboard/matriculas", roles: ROLE_GROUPS.ADMISSIONS },
  { prefix: "/dashboard/estudiantes", roles: ROLE_GROUPS.ADMISSIONS },
  { prefix: "/dashboard/pagos", roles: ROLE_GROUPS.FINANCE },
  { prefix: "/dashboard/incidencias", roles: ROLE_GROUPS.DISCIPLINE },
  { prefix: "/dashboard/inhabilitaciones", roles: ROLE_GROUPS.DISCIPLINE },
  { prefix: "/dashboard/reportes", roles: ROLE_GROUPS.REPORTS },
  { prefix: "/dashboard/comunicados", roles: ROLE_GROUPS.ADMINISTRATION },
  { prefix: "/dashboard/calendar", roles: ROLE_GROUPS.ACADEMIC },
];

export function normalizeRole(role?: string | null): AppRole | null {
  if (!role) return null;
  const normalized = role.toUpperCase();
  return ROLES.includes(normalized as AppRole) ? (normalized as AppRole) : null;
}

export function hasAllowedRole(
  role: string | null | undefined,
  allowedRoles: readonly AppRole[],
) {
  const normalized = normalizeRole(role);
  return !!normalized && allowedRoles.includes(normalized);
}

export function getAllowedRolesForPath(pathname: string): AppRole[] {
  const rule = ROUTE_ROLE_RULES.find((item) => pathname.startsWith(item.prefix));
  return rule?.roles ?? ALL_ROLES;
}

export function getDefaultDashboardPath(role: string | null | undefined) {
  const normalized = normalizeRole(role);

  switch (normalized) {
    case "DOCENTE":
      return "/dashboard/notas";
    case "RECEPCION":
      return "/dashboard/matriculas";
    case "CAJA":
      return "/dashboard/pagos";
    case "COORDINADOR":
      return "/dashboard/reportes";
    default:
      return "/dashboard";
  }
}
