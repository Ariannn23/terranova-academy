import { useState } from "react";
import { toast } from "sonner";
import {
  exportGradesToExcel,
  exportAttendanceReport,
  exportFinancialReport,
} from "@/lib/actions/report.actions";
import { useStudentSearch } from "@/components/shared/hooks/useStudentSearch";
import { SearchStudentResult } from "@/lib/actions/payment.actions";

function downloadBase64(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function useReports() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("P1");
  const [financialMonth, setFinancialMonth] = useState(String(currentMonth));
  const [financialYear] = useState(currentYear);

  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  // Student Search
  const searchHook = useStudentSearch();

  const handleSelectStudent = (student: SearchStudentResult) => {
    searchHook.setSelectedStudent(student);
    searchHook.setSearchTerm(`${student.firstName} ${student.lastName}`);
    searchHook.searchResults.length = 0; // Clear results array visibly
  };

  const handleExportGrades = async () => {
    if (!selectedSectionId) {
      toast.error("Selecciona una sección.");
      return;
    }
    setLoadingGrades(true);
    toast.loading("Generando Excel de notas...", { id: "excel-grades" });
    const res = await exportGradesToExcel(selectedSectionId, selectedPeriod);
    if (res.success && res.data) {
      downloadBase64(res.data, res.filename ?? "notas.xlsx");
      toast.success("Excel descargado correctamente.", { id: "excel-grades" });
    } else {
      toast.error(res.error ?? "Error al generar Excel.", {
        id: "excel-grades",
      });
    }
    setLoadingGrades(false);
  };

  const handleExportAttendance = async () => {
    if (!selectedSectionId) {
      toast.error("Selecciona una sección.");
      return;
    }
    setLoadingAttendance(true);
    toast.loading("Generando Excel de asistencia...", { id: "excel-att" });
    const res = await exportAttendanceReport(
      selectedSectionId,
      parseInt(financialMonth),
      financialYear,
    );
    if (res.success && res.data) {
      downloadBase64(res.data, res.filename ?? "asistencia.xlsx");
      toast.success("Excel descargado.", { id: "excel-att" });
    } else {
      toast.error(res.error ?? "Error.", { id: "excel-att" });
    }
    setLoadingAttendance(false);
  };

  const handleExportFinancial = async () => {
    setLoadingFinancial(true);
    toast.loading("Generando Excel financiero...", { id: "excel-fin" });
    const res = await exportFinancialReport(financialYear);
    if (res.success && res.data) {
      downloadBase64(res.data, res.filename ?? "finanzas.xlsx");
      toast.success("Excel descargado.", { id: "excel-fin" });
    } else {
      toast.error(res.error ?? "Error.", { id: "excel-fin" });
    }
    setLoadingFinancial(false);
  };

  return {
    selectedSectionId,
    setSelectedSectionId,
    selectedPeriod,
    setSelectedPeriod,
    financialMonth,
    setFinancialMonth,
    financialYear,
    loadingGrades,
    loadingAttendance,
    loadingFinancial,
    searchHook,
    handleSelectStudent,
    handleExportGrades,
    handleExportAttendance,
    handleExportFinancial,
  };
}
