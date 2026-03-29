export const PERIOD_LABELS: Record<string, string> = {
  P1: "Período 1",
  P2: "Período 2",
  P3: "Período 3",
  P4: "Período 4",
  FINAL: "Final",
};

export const ATTENDANCE_LABELS: Record<string, { label: string; color: string }> = {
  PRESENTE: { label: "Presente", color: "bg-emerald-100 text-emerald-700" },
  TARDANZA: { label: "Tardanza", color: "bg-amber-100 text-amber-700" },
  FALTA_JUSTIFICADA: {
    label: "Justificada",
    color: "bg-blue-100 text-blue-700",
  },
  FALTA_INJUSTIFICADA: {
    label: "Injustificada",
    color: "bg-red-100 text-red-700",
  },
};

export const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  VENCIDO: {
    label: "Vencido",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  ANULADO: {
    label: "Anulado",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
};
