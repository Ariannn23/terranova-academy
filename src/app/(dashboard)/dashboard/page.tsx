import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Users, CalendarCheck, CreditCard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Panel de Control"
        description="Bienvenido al sistema de gestión de TerraNova Academy. Selecciona un módulo en el menú lateral para comenzar."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Inicio" },
        ]}
      />

      {/* Grid de tarjetas de Módulos (Acceso Rápido) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Estudiantes Activos
            </CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-500 mt-1">Este año lectivo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Asistencia Hoy
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">--%</div>
            <p className="text-xs text-slate-500 mt-1">Secciones registradas</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Promedio General
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-500 mt-1">Colegio completo</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pagos Pendientes
            </CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">--</div>
            <p className="text-xs text-slate-500 mt-1">Cuotas atrasadas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
