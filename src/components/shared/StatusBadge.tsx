import { Badge } from "@/components/ui/badge";

type StatusType =
  | "ACTIVO"
  | "OBSERVADO"
  | "EN_RIESGO"
  | "INHABILITADO"
  | "RETIRADO"
  | string;

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let style = "bg-slate-100 text-slate-800 border-slate-200";
  let dotColor = "bg-slate-500";

  switch (status) {
    case "ACTIVO":
      style = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
      break;
    case "OBSERVADO":
      style = "bg-amber-50 text-amber-700 border-amber-200";
      dotColor = "bg-amber-500";
      break;
    case "EN_RIESGO":
      style = "bg-orange-50 text-orange-700 border-orange-200";
      dotColor = "bg-orange-500";
      break;
    case "INHABILITADO":
    case "RETIRADO":
      style = "bg-red-50 text-red-700 border-red-200";
      dotColor = "bg-red-500";
      break;
    // Agregamos colores para Payment Status también
    case "PAGADO":
      style = "bg-blue-50 text-blue-700 border-blue-200";
      dotColor = "bg-blue-500";
      break;
    case "PENDIENTE":
      style = "bg-slate-50 text-slate-700 border-slate-200";
      dotColor = "bg-slate-500";
      break;
    case "VENCIDO":
      style = "bg-rose-50 text-rose-700 border-rose-200";
      dotColor = "bg-rose-500";
      break;
  }

  return (
    <Badge
      variant="outline"
      className={`flex w-fit items-center gap-1.5 px-2.5 py-0.5 rounded-full font-medium ${style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </Badge>
  );
}
