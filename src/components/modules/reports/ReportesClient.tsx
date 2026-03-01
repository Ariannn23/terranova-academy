"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  BookOpen,
  CreditCard,
  CalendarCheck,
  Download,
  FileSpreadsheet,
  Search,
  FileBarChart2,
  Printer,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportGradesToExcel,
  exportAttendanceReport,
  exportFinancialReport,
} from "@/lib/actions/report.actions";
import { searchStudentsForPayment } from "@/lib/actions/payments.actions";

// ─── Helper para descargar base64 ────────────────────────────────────────────
function downloadBase64(base64: string, filename: string) {
  const link = document.createElement("a");
  link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Section {
  id: string;
  name: string;
  tutor: string;
}
interface Grade {
  id: string;
  name: string;
  order: number;
  sections: Section[];
}
interface Level {
  name: string;
  grades: Grade[];
}
interface AcademicStructure {
  id: string;
  year: number;
  levels: Level[];
}

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const PERIODS = ["P1", "P2", "P3", "P4", "FINAL"] as const;

export default function ReportesClient({
  academicStructure,
}: {
  academicStructure: AcademicStructure | null;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Selectors state
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("P1");
  const [financialMonth, setFinancialMonth] = useState(String(currentMonth));
  const [financialYear] = useState(currentYear);

  // Student search state (for PDF libreta / constancia)
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Loaders
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [loadingFinancial, setLoadingFinancial] = useState(false);

  // Flatten all sections from levels → grades → sections
  const allSections =
    academicStructure?.levels.flatMap((l) =>
      l.grades.flatMap((g) =>
        g.sections.map((s) => ({ id: s.id, name: s.name, gradeName: g.name })),
      ),
    ) ?? [];

  // ── Búsqueda de alumno ────────────────────────────────────────────────────
  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const res = await searchStudentsForPayment(term);
    if (res.success) setSearchResults(res.data ?? []);
    setIsSearching(false);
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchTerm(student.firstName + " " + student.lastName);
    setSearchResults([]);
  };

  const enrollmentId = selectedStudent?.enrollments?.[0]?.id ?? "";

  // ── Handlers Excel ─────────────────────────────────────────────────────────
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

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <PageHeader
        title="Centro de Reportes"
        description="Genera PDFs oficiales o exporta datos a Excel desde un solo lugar."
      />

      {!academicStructure && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          No hay un año lectivo activo. Configúralo en{" "}
          <a href="/dashboard/configuracion" className="underline font-medium">
            Configuración
          </a>{" "}
          para usar los reportes completos.
        </div>
      )}

      {/* ── Sección 1: PDFs del Estudiante ─────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-700 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          Documentos del Estudiante
        </h2>
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-medium text-slate-600">
              Busca al alumno para generar su libreta de notas o constancia de
              matrícula
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {/* Búsqueda */}
            <div className="relative max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por DNI o apellido..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
              {isSearching && (
                <p className="text-xs text-slate-400 mt-1">Buscando...</p>
              )}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-52 overflow-y-auto">
                  {searchResults.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                      onClick={() => handleSelectStudent(s)}
                    >
                      <p className="font-medium text-sm">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {s.dni}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones PDF */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                disabled={!enrollmentId}
                onClick={() =>
                  window.open(
                    `/api/pdf?type=grades&id=${enrollmentId}`,
                    "_blank",
                  )
                }
                className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <BookOpen className="w-4 h-4" />
                Descargar Libreta de Notas
              </Button>
              <Button
                variant="outline"
                disabled={!enrollmentId}
                onClick={() =>
                  window.open(
                    `/api/pdf?type=enrollment&id=${enrollmentId}`,
                    "_blank",
                  )
                }
                className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Printer className="w-4 h-4" />
                Descargar Constancia de Matrícula
              </Button>
            </div>
            {!enrollmentId && searchTerm.length === 0 && (
              <p className="text-xs text-slate-400 italic">
                Busca un alumno para habilitar los botones.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Sección 2: PDF Asistencia + Excel ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notas Excel */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
              Exportar Notas a Excel
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Sección
              </label>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sección..." />
                </SelectTrigger>
                <SelectContent>
                  {allSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.gradeName} "{s.name}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Período
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIODS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExportGrades}
              disabled={loadingGrades || !selectedSectionId}
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
            >
              <Download className="w-4 h-4" />
              {loadingGrades ? "Generando..." : "Exportar a Excel"}
            </Button>
          </CardContent>
        </Card>

        {/* Asistencia PDF + Excel */}
        <Card>
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              Planilla de Asistencia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Sección
              </label>
              <Select
                value={selectedSectionId}
                onValueChange={setSelectedSectionId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sección..." />
                </SelectTrigger>
                <SelectContent>
                  {allSections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.gradeName} "{s.name}"
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                Mes
              </label>
              <Select value={financialMonth} onValueChange={setFinancialMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!selectedSectionId}
                onClick={() =>
                  window.open(
                    `/api/pdf?type=attendance&id=${selectedSectionId}&month=${financialMonth}&year=${financialYear}`,
                    "_blank",
                  )
                }
                className="flex-1 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="w-4 h-4" />
                PDF
              </Button>
              <Button
                onClick={handleExportAttendance}
                disabled={loadingAttendance || !selectedSectionId}
                className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                {loadingAttendance ? "..." : "Excel"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reporte Financiero */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b pb-3">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileBarChart2 className="w-4 h-4 text-purple-600" />
              Reporte Financiero Anual
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-sm text-slate-600">
                Año: <strong>{financialYear}</strong>
              </p>
              <Button
                onClick={handleExportFinancial}
                disabled={loadingFinancial}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <CreditCard className="w-4 h-4" />
                {loadingFinancial
                  ? "Generando..."
                  : "Exportar Reporte Financiero a Excel"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
