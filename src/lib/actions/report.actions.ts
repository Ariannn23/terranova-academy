"use server";

import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getSectionGradeReport } from "@/lib/actions/grade.actions";
import { getSectionAttendanceReport } from "@/lib/actions/attendance.actions";
import { requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

// Devuelve un Buffer o string Base64 con el excel.
// Recomendable devolver base64 para que el FrontEnd arme el Blob con facilidad.

// ==========================================
// 1. EXPORTAR NOTAS DE SECCIÓN A EXCEL
// ==========================================
export async function exportGradesToExcel(sectionId: string, period: string) {
  try {
    await requireRole(ROLE_GROUPS.REPORTS);

    const gradesRes = await getSectionGradeReport(sectionId, period as any);
    if (!gradesRes.success || !gradesRes.data)
      throw new Error("No pudimos conseguir las notas de la sección");

    const sectionInfo = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { gradeLevel: true },
    });

    const rows = gradesRes.data.ranking.map((studentRow: any) => {
      const flatObj: Record<string, any> = {
        DNI: studentRow.studentId || "", // mapping changed from student.dni
        Estudiante: studentRow.name || "",
      };

      // Si el JSON viene con la lista total de sus scores en este periodo
      if (studentRow.grades && Array.isArray(studentRow.grades)) {
        studentRow.grades.forEach((g: any) => {
          flatObj[g.courseName] = g.score;
        });
      }

      flatObj["Promedio General"] = studentRow.average;
      flatObj["Cursos Jalados"] = studentRow.failingCount; // was failingCount
      flatObj["Estatus"] = studentRow.status || "N/A";

      return flatObj;
    });

    const ws = XLSX.utils.json_to_sheet([]);
    const titleRow = [
      [
        `REPORTE DE NOTAS - ${sectionInfo?.gradeLevel.name} ${sectionInfo?.name} - PERIODO ${period}`,
      ],
    ];
    XLSX.utils.sheet_add_aoa(ws, titleRow, { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A3" });

    const wb = XLSX.utils.book_new();
    const sheetName = `Notas - ${sectionInfo?.name} - ${period}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

    // Acomodar columnas un poco
    ws["!cols"] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const buffer = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    await createAuditLog({
      action: AuditAction.EXPORT_REPORT,
      entity: AuditEntity.REPORT,
      entityId: sectionId,
      newValue: {
        reportType: "grades_excel",
        sectionId,
        period,
        filename: `${sheetName}.xlsx`,
      },
      metadata: {
        module: "reports",
      },
    });
    return { success: true, data: buffer, filename: `${sheetName}.xlsx` };
  } catch (error: any) {
    console.error("Error in exportGradesToExcel:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 2. EXPORTAR REPORTE DE ASISTENCIA
// ==========================================
export async function exportAttendanceReport(
  sectionId: string,
  month: number,
  year: number,
) {
  try {
    await requireRole(ROLE_GROUPS.REPORTS);

    const attendanceRes = await getSectionAttendanceReport({
      sectionId,
      month,
      year,
    });
    if (!attendanceRes.success || !attendanceRes.data)
      throw new Error("No se pudo obtener el consolidado de asistencia");

    const sectionInfo = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { gradeLevel: true },
    });

    const rows = attendanceRes.data.planilla.map((st: any) => {
      const flatObj: Record<string, any> = {
        DNI: st.studentDni,
        Estudiante: st.studentName,
        "Total Clases Abiertas": st.summary.total,
        Asistencias: st.summary.presente,
        Tardanzas: st.summary.tardanza,
        "Faltas Injustificadas": st.summary.injustificada,
        "Faltas Justificadas": st.summary.justificada,
        "Efectividad (%)":
          ((st.summary.presente / (st.summary.total || 1)) * 100).toFixed(2) +
          "%",
      };
      return flatObj;
    });

    const ws = XLSX.utils.json_to_sheet([]);
    const titleRow = [
      [
        `REPORTE DE ASISTENCIA - ${sectionInfo?.gradeLevel.name} ${sectionInfo?.name} - MES ${month}/${year}`,
      ],
    ];
    XLSX.utils.sheet_add_aoa(ws, titleRow, { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, rows, { origin: "A3" });

    const wb = XLSX.utils.book_new();
    const sheetName = `Asistencia ${sectionInfo?.name} - ${month}-${year}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

    ws["!cols"] = [
      { wch: 12 },
      { wch: 35 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 22 },
      { wch: 22 },
      { wch: 15 },
    ];

    const buffer = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    await createAuditLog({
      action: AuditAction.EXPORT_REPORT,
      entity: AuditEntity.REPORT,
      entityId: sectionId,
      newValue: {
        reportType: "attendance_excel",
        sectionId,
        month,
        year,
        filename: `${sheetName}.xlsx`,
      },
      metadata: {
        module: "reports",
      },
    });
    return { success: true, data: buffer, filename: `${sheetName}.xlsx` };
  } catch (error: any) {
    console.error("Error in exportAttendanceReport:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================
// 3. EXPORTAR REPORTE FINANCIERO ANUAL
// ==========================================
export async function exportFinancialReport(year: number) {
  try {
    await requireRole(ROLE_GROUPS.REPORTS);

    // Conseguir todos los conceptos de ese año
    const [payments, transactions] = await Promise.all([
      prisma.payment.findMany({
        where: {
          dueDate: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31, 23, 59, 59),
          },
        },
        include: { concept: true },
      }),
      prisma.paymentTransaction.findMany({
        where: {
          paidAt: {
            gte: new Date(year, 0, 1),
            lte: new Date(year, 11, 31, 23, 59, 59),
          },
        },
        include: {
          payment: {
            include: {
              concept: true,
              enrollment: {
                include: {
                  student: { select: { firstName: true, lastName: true, dni: true } },
                },
              },
            },
          },
        },
        orderBy: { paidAt: "asc" },
      }),
    ]);

    // Agruparlos por Estado
    let pending = 0;
    let paid = 0;
    let overdue = 0;

    paid = transactions.reduce((acc, tx) => acc + tx.amount, 0);
    payments.forEach((p) => {
      if (p.status === "VENCIDO") overdue += p.balance;
      else if (p.status === "PENDIENTE") pending += p.balance;
    });

    const rawData = [
      { Indicador: "Ingresos Recaudados (PAGADOS)", "Monto (S/.)": paid },
      { Indicador: "Capital por Cobrar (PENDIENTES)", "Monto (S/.)": pending },
      { Indicador: "Deuda Morosa (VENCIDOS)", "Monto (S/.)": overdue },
      {
        Indicador: "PROYECCIÓN ANUAL TOTAL",
        "Monto (S/.)": paid + pending + overdue,
      },
    ];

    const ws = XLSX.utils.json_to_sheet([]);
    const titleRow = [[`REPORTE FINANCIERO ANUAL - ${year}`]];
    XLSX.utils.sheet_add_aoa(ws, titleRow, { origin: "A1" });
    XLSX.utils.sheet_add_json(ws, rawData, { origin: "A3" });
    XLSX.utils.sheet_add_json(
      ws,
      transactions.map((tx) => ({
        Fecha: tx.paidAt,
        Estudiante: `${tx.payment.enrollment.student.firstName} ${tx.payment.enrollment.student.lastName}`,
        DNI: tx.payment.enrollment.student.dni,
        Concepto: tx.payment.concept.name,
        Metodo: tx.method,
        "Abono (S/.)": tx.amount,
      })),
      { origin: "D3" },
    );

    const wb = XLSX.utils.book_new();
    const sheetName = `Finanzas Anuales - ${year}`;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));

    ws["!cols"] = [
      { wch: 40 },
      { wch: 20 },
      { wch: 4 },
      { wch: 18 },
      { wch: 35 },
      { wch: 12 },
      { wch: 25 },
      { wch: 16 },
      { wch: 14 },
    ];

    const buffer = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
    await createAuditLog({
      action: AuditAction.EXPORT_REPORT,
      entity: AuditEntity.REPORT,
      newValue: {
        reportType: "financial_excel",
        year,
        filename: `${sheetName}.xlsx`,
        transactionsCount: transactions.length,
      },
      metadata: {
        module: "reports",
      },
    });
    return { success: true, data: buffer, filename: `${sheetName}.xlsx` };
  } catch (error: any) {
    console.error("Error in exportFinancialReport:", error);
    return { success: false, error: error.message };
  }
}
