export type RevenuePoint = {
  month?: string | number;
  label?: string;
  totalPaid?: number;
  paid?: number;
  revenue?: number;
};

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
