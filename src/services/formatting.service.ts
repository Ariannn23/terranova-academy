export function formatCurrency(value: number, currency = "PEN"): string {
  const amount = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type StudentNameInput = {
  firstName?: string | null;
  lastName?: string | null;
  names?: string | null;
  surnames?: string | null;
};

export function formatStudentName(student: StudentNameInput): string {
  const firstName = student.firstName ?? student.names ?? "";
  const lastName = student.lastName ?? student.surnames ?? "";
  const fullName = `${firstName} ${lastName}`.trim().replace(/\s+/g, " ");

  return fullName || "Sin nombre";
}
