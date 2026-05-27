"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserPlus,
  Receipt,
  CalendarCheck,
  ShieldAlert,
  FileSearch,
  Settings,
} from "lucide-react";
import { canAccessNavigationItem } from "@/lib/navigation";

export function QuickAccess({ userRole }: { userRole?: string }) {
  const actions = [
    {
      title: "Nueva Matrícula",
      icon: UserPlus,
      href: "/dashboard/matriculas/nueva",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      title: "Registrar Pago",
      icon: Receipt,
      href: "/dashboard/pagos",
      color: "text-blue-600 bg-blue-50",
    },
    {
      title: "Tomar Asistencia",
      icon: CalendarCheck,
      href: "/dashboard/asistencia",
      color: "text-amber-600 bg-amber-50",
    },
    {
      title: "Reportar Incidente",
      icon: ShieldAlert,
      href: "/dashboard/incidencias/nuevo",
      color: "text-red-600 bg-red-50",
    },
    {
      title: "Ver Informes",
      icon: FileSearch,
      href: "/dashboard/reportes",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      title: "Configuración",
      icon: Settings,
      href: "/dashboard/configuracion",
      color: "text-slate-600 bg-slate-100",
    },
  ];

  // NOTA DE SEGURIDAD: Este filtrado visual mejora la UX ocultando acciones rápidas no permitidas,
  // pero el control de accesos real se realiza a nivel de servidor.
  const visibleActions = actions.filter((action) =>
    canAccessNavigationItem(userRole, action)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Accesos Rápidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="flex flex-col items-center justify-center p-4 text-center rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
            >
              <div
                className={`p-3 rounded-full mb-3 group-hover:scale-110 transition-transform ${action.color}`}
              >
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-slate-700">
                {action.title}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
