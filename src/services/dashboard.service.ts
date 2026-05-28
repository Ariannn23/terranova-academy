export type RevenuePoint = {
  month?: string | number;
  label?: string;
  totalPaid?: number;
  paid?: number;
  revenue?: number;
};

const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

export function mapRevenueData(data: RevenuePoint[]) {
  return data.map((item) => ({
    name: String(item.label ?? item.month ?? ""),
    value: item.totalPaid ?? item.paid ?? item.revenue ?? 0,
  }));
}

export type PriorityAlertInput = {
  id: string;
  title: string;
  severity?: "high" | "medium" | "low";
  createdAt?: Date | string;
};

export function mapPriorityAlerts(data: PriorityAlertInput[]) {
  const severityOrder = { high: 0, medium: 1, low: 2 };

  return [...data].sort((a, b) => {
    const aSeverity = severityOrder[a.severity ?? "low"];
    const bSeverity = severityOrder[b.severity ?? "low"];
    if (aSeverity !== bSeverity) return aSeverity - bSeverity;

    const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bDate - aDate;
  });
}

export type AttendanceSummary = {
  label: string;
  presente?: number;
  tardanza?: number;
  justificada?: number;
  injustificada?: number;
};

export function buildAttendanceChartData(data: AttendanceSummary[]) {
  return data.map((item) => ({
    name: item.label,
    presentes: item.presente ?? 0,
    tardanzas: item.tardanza ?? 0,
    faltas: (item.justificada ?? 0) + (item.injustificada ?? 0),
  }));
}

export type MonthlyFinancialReportItem = {
  month: number;
  totalPaid?: number;
  totalPending?: number;
  totalOverdue?: number;
  totalBilled?: number;
};

export type RevenueChartPoint = {
  month: string;
  ingresos: number;
  pendientes: number;
};

export function normalizeMonthlyRevenue(
  data: MonthlyFinancialReportItem[] = [],
  currentMonth = new Date().getMonth() + 1,
): RevenueChartPoint[] {
  return data
    .filter((item) => item.month <= currentMonth)
    .map((item) => ({
      month: MONTH_NAMES[item.month - 1] ?? String(item.month),
      ingresos: item.totalPaid ?? 0,
      pendientes: (item.totalPending ?? 0) + (item.totalOverdue ?? 0),
    }));
}

export type DashboardPriorityAlertsInput = {
  incidents?: Array<{
    id: string;
    date: Date | string;
    enrollment?: {
      student?: {
        firstName?: string | null;
        lastName?: string | null;
      } | null;
    } | null;
  }>;
  disabledStudents?: Array<{
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    updatedAt: Date | string;
  }>;
};

export type DashboardAlert = {
  id: string;
  type: "INCIDENT" | "DISABLED";
  title: string;
  subtitle: string;
  date: Date;
  urgency: "HIGH";
};

function joinName(firstName?: string | null, lastName?: string | null): string {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim();
}

export function mapDashboardPriorityAlerts(
  data: DashboardPriorityAlertsInput = {},
  limit = 5,
): DashboardAlert[] {
  const incidentAlerts =
    data.incidents?.map((incident) => ({
      id: `inc-${incident.id}`,
      type: "INCIDENT" as const,
      title: "Incidente Severo Reportado",
      subtitle: joinName(
        incident.enrollment?.student?.firstName,
        incident.enrollment?.student?.lastName,
      ),
      date: new Date(incident.date),
      urgency: "HIGH" as const,
    })) ?? [];

  const disabledAlerts =
    data.disabledStudents?.map((student) => ({
      id: `stu-${student.id}`,
      type: "DISABLED" as const,
      title: "Alumno Inhabilitado",
      subtitle: joinName(student.firstName, student.lastName),
      date: new Date(student.updatedAt),
      urgency: "HIGH" as const,
    })) ?? [];

  return [...incidentAlerts, ...disabledAlerts].slice(0, limit);
}

export type WeeklyAttendancePoint = {
  date: string;
  porcentaje: number;
};

export function buildWeeklyAttendanceData(
  averageToday: number | null | undefined,
): WeeklyAttendancePoint[] {
  const average = averageToday || 96;
  return [
    { date: "Lun", porcentaje: average },
    { date: "Mar", porcentaje: average },
    { date: "Mié", porcentaje: average },
    { date: "Jue", porcentaje: average },
    { date: "Vie", porcentaje: average },
  ];
}
