import { format } from "date-fns";
import {
  calculateDaysOverdue,
  getOverdueSeverityClass,
} from "@/services/payment.service";
import { buildCsvContent, downloadCsv } from "@/services/export.service";
import type { OverduePaymentRow } from "@/types/payment";

export function useOverduePayments(initialData: OverduePaymentRow[]) {
  const getDaysOverdue = (payment: OverduePaymentRow) =>
    calculateDaysOverdue(payment);

  const getDelayBadgeClass = (payment: OverduePaymentRow) =>
    getOverdueSeverityClass(getDaysOverdue(payment));

  const exportCsv = () => {
    const headers = [
      "DNI",
      "Estudiante",
      "Nivel",
      "Grado",
      "Concepto",
      "Monto",
      "Fecha Vencimiento",
      "Dias Retraso",
    ];

    const rows = initialData.map((row) => [
      row.enrollment.student.dni,
      `${row.enrollment.student.firstName} ${row.enrollment.student.lastName}`,
      row.enrollment.section.gradeLevel.level,
      row.enrollment.section.gradeLevel.name,
      row.concept.name,
      row.amount.toFixed(2),
      format(new Date(row.dueDate), "yyyy-MM-dd"),
      String(getDaysOverdue(row)),
    ]);

    const csvContent = buildCsvContent([headers, ...rows]);
    downloadCsv(csvContent, `reporte-vencidos-${format(new Date(), "yyyy-MM-dd")}.csv`);
  };

  return {
    getDaysOverdue,
    getDelayBadgeClass,
    exportCsv,
  };
}
