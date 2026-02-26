import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  criticality?: "low" | "medium" | "high";
}

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  criticality = "low",
}: KPICardProps) {
  // Colores del icono principal basados en criticidad
  const iconColors = {
    low: "bg-emerald-100 text-emerald-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${iconColors[criticality]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
          <span>{description}</span>
          {trend && (
            <span
              className={`font-medium flex items-center ${trend.isPositive ? "text-emerald-600" : "text-red-500"}`}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
