import { PageHeader } from "@/components/shared/PageHeader";
import {
  getFinancialSummary,
  getStudentsAtRisk,
  getCriticalAttendance,
  getPriorityAlerts,
  getUpcomingPayments,
} from "@/lib/actions/dashboard.actions";

import { KPICard } from "@/components/modules/dashboard/KPICard";
import { AlertList } from "@/components/modules/dashboard/AlertList";
import { QuickAccess } from "@/components/modules/dashboard/QuickAccess";
import { RevenueChart } from "@/components/modules/dashboard/RevenueChart";
import { AttendanceChart } from "@/components/modules/dashboard/AttendanceChart";

import { GraduationCap, Users, CalendarCheck, CreditCard } from "lucide-react";

export default async function DashboardPage() {
  // 1. Data Fetching en paralelo (< 10 segundos)
  const [financialRes, riskRes, attendanceRes, alertsRes, upcomingRes] =
    await Promise.all([
      getFinancialSummary(),
      getStudentsAtRisk(),
      getCriticalAttendance(),
      getPriorityAlerts(),
      getUpcomingPayments(),
    ]);

  // 2. Extraer los datos brutos del response.
  const financials =
    financialRes.success && financialRes.data
      ? financialRes.data
      : { totalCollected: 0, totalPending: 0, totalOverdue: 0 };
  const studentsAtRisk =
    riskRes.success && riskRes.data !== undefined
      ? (riskRes.data as number)
      : 0;
  const attendance =
    attendanceRes.success && attendanceRes.data
      ? attendanceRes.data
      : { absencesLastWeek: 0, averageToday: 0 };
  const priorityAlertsData =
    alertsRes.success && alertsRes.data
      ? alertsRes.data
      : { incidents: [], disabledStudents: [] };
  const upcomingPayments =
    upcomingRes.success && upcomingRes.data ? upcomingRes.data : [];

  // Transformar de crudo a estructura de la UI de forma limpia:

  // A) Formatear las Alertas Prioritarias (Mixeando Inhabilitados, Incidentes y Pagos urgentes)
  const mappedAlerts: any[] = [];
  priorityAlertsData.incidents?.forEach((inc: any) => {
    mappedAlerts.push({
      id: `inc-${inc.id}`,
      type: "INCIDENT",
      title: "Incidente Severo Reportado",
      subtitle: `${inc.enrollment?.student?.firstName || ""} ${inc.enrollment?.student?.lastName || ""}`,
      date: inc.date,
      urgency: "HIGH",
    });
  });
  priorityAlertsData.disabledStudents?.forEach((stu: any) => {
    mappedAlerts.push({
      id: `stu-${stu.id}`,
      type: "DISABLED",
      title: "Alumno Inhabilitado",
      subtitle: `${stu.firstName} ${stu.lastName}`,
      date: stu.updatedAt,
      urgency: "HIGH",
    });
  });
  // Asegurar solo top 5
  const topAlerts = mappedAlerts.slice(0, 5);

  // B) Datos simulados/calculados para gráficas por falta de data histórica profunda en seed
  const mockRevenueData = [
    {
      month: "Ene",
      ingresos: financials.totalCollected * 0.2,
      pendientes: financials.totalPending * 0.1,
    },
    {
      month: "Feb",
      ingresos: financials.totalCollected * 0.8,
      pendientes: financials.totalOverdue,
    },
    {
      month: "Mar",
      ingresos: financials.totalCollected,
      pendientes: financials.totalPending,
    },
  ];

  const mockAttendanceData = [
    { date: "Lun", porcentaje: 98 },
    { date: "Mar", porcentaje: 95 },
    { date: "Mié", porcentaje: 99 },
    { date: "Jue", porcentaje: 94 },
    { date: "Vie", porcentaje: attendance.averageToday || 96 },
  ];

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <PageHeader
        title="Panel de Control"
        description="Vista global y financiera de TerraNova Academy."
      />

      {/* 3. Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Cobros de este mes"
          value={`S/ ${financials.totalCollected.toLocaleString()}`}
          description="vs S/ 0 meta mes"
          icon={CreditCard}
          trend={{
            value: `${financials.totalPending.toLocaleString()} por cobrar`,
            isPositive: true,
          }}
          criticality="low"
        />
        <KPICard
          title="Pagos Vencidos"
          value={`S/ ${financials.totalOverdue.toLocaleString()}`}
          description="En estado crítico"
          icon={CreditCard}
          trend={{ value: "Prioridad alta", isPositive: false }}
          criticality={financials.totalOverdue > 0 ? "high" : "low"}
        />
        <KPICard
          title="Alumnos en Riesgo"
          value={studentsAtRisk}
          description="Académico / Conducta"
          icon={Users}
          trend={{ value: "Revisar listas", isPositive: studentsAtRisk === 0 }}
          criticality={studentsAtRisk > 5 ? "medium" : "low"}
        />
        <KPICard
          title="Asistencia Crítica"
          value={`${attendance.absencesLastWeek}`}
          description="Inasistencias recientes"
          icon={CalendarCheck}
          trend={{
            value: `${attendance.averageToday}% presentes hoy`,
            isPositive: attendance.averageToday >= 90,
          }}
          criticality={attendance.absencesLastWeek > 10 ? "medium" : "low"}
        />
      </div>

      {/* 4. Gráficas Centrales y Accesos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica de Ingresos (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[350px]">
            <RevenueChart data={mockRevenueData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[320px] h-auto">
            <AttendanceChart data={mockAttendanceData} />
            <QuickAccess />
          </div>
        </div>

        {/* Panel de Alertas Derecha (Ocupa 1 columna) */}
        <div className="lg:col-span-1 h-[674px]">
          <AlertList alerts={topAlerts} />
        </div>
      </div>
    </div>
  );
}
