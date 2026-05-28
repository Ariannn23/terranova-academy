import { PageHeader } from "@/components/shared/PageHeader";
import {
  getFinancialSummary,
  getStudentsAtRisk,
  getCriticalAttendance,
  getPriorityAlerts,
  getUpcomingPayments,
} from "@/lib/actions/dashboard.actions";
import { getFinancialReport } from "@/lib/actions/payment.actions";
import { REPORT_PERMISSIONS } from "@/lib/report-permissions";
import { hasAllowedRole } from "@/lib/rbac";

import { auth } from "@/lib/auth";
import { KPICard } from "@/components/modules/dashboard/KPICard";
import { AlertList } from "@/components/modules/dashboard/AlertList";
import { QuickAccess } from "@/components/modules/dashboard/QuickAccess";
import { RevenueChart } from "@/components/modules/dashboard/RevenueChart";
import { AttendanceChart } from "@/components/modules/dashboard/AttendanceChart";
import {
  buildWeeklyAttendanceData,
  mapDashboardPriorityAlerts,
  normalizeMonthlyRevenue,
} from "@/services/dashboard.service";

import { Users, CalendarCheck, CreditCard } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role;
  const currentYear = new Date().getFullYear();
  const canViewFinancialReport = hasAllowedRole(
    userRole,
    REPORT_PERMISSIONS.financial,
  );

  const [
    financialRes,
    riskRes,
    attendanceRes,
    alertsRes,
    upcomingRes,
    reportRes,
  ] = await Promise.all([
    getFinancialSummary(),
    getStudentsAtRisk(),
    getCriticalAttendance(),
    getPriorityAlerts(),
    getUpcomingPayments(),
    canViewFinancialReport
      ? getFinancialReport(currentYear)
      : Promise.resolve({ success: true as const, data: [] }),
  ]);

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
  void upcomingPayments;

  const topAlerts = mapDashboardPriorityAlerts(priorityAlertsData);
  const reportData = reportRes.success && reportRes.data ? reportRes.data : [];
  const currentMonth = new Date().getMonth() + 1;
  const revenueData = normalizeMonthlyRevenue(reportData, currentMonth);
  const attendanceData = buildWeeklyAttendanceData(attendance.averageToday);

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <PageHeader
        title="Panel de Control"
        description="Vista global y financiera de TerraNova Academy."
      />

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-[350px]">
            <RevenueChart data={revenueData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[320px] h-auto">
            <AttendanceChart data={attendanceData} />
            <QuickAccess userRole={userRole} />
          </div>
        </div>

        <div className="lg:col-span-1 h-[674px]">
          <AlertList alerts={topAlerts} />
        </div>
      </div>
    </div>
  );
}
