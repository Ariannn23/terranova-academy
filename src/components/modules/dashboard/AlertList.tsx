import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Ban } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type AlertItem = {
  id: string;
  type: "INCIDENT" | "PAYMENT" | "DISABLED";
  title: string;
  subtitle: string;
  date: Date;
  urgency: "HIGH" | "MEDIUM";
};

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  if (!alerts || alerts.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">Alertas Recientes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center text-slate-500">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium">Todo está en orden</p>
          <p className="text-xs">No hay alertas críticas en este momento.</p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "INCIDENT":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "PAYMENT":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "DISABLED":
        return <Ban className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-slate-600" />;
    }
  };

  const getBg = (type: string) => {
    switch (type) {
      case "INCIDENT":
        return "bg-orange-100";
      case "PAYMENT":
        return "bg-amber-100";
      case "DISABLED":
        return "bg-red-100";
      default:
        return "bg-slate-100";
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          Alertas Prioritarias
          <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {alerts.length}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors"
            >
              <div
                className={`p-2 rounded-full mt-0.5 shrink-0 ${getBg(alert.type)}`}
              >
                {getIcon(alert.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {alert.title}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-4 mt-1">
                  <p className="text-xs text-slate-500 truncate">
                    {alert.subtitle}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium shrink-0 mt-1 sm:mt-0">
                    {format(new Date(alert.date), "d MMM, hh:mm a", {
                      locale: es,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
