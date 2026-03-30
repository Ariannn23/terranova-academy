"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileSpreadsheet,
  CalendarCheck,
  FileBarChart2,
  Download,
  FileText,
  CreditCard,
} from "lucide-react";

interface BatchExportGridProps {
  allSections: any[];
  selectedSectionId: string;
  setSelectedSectionId: (val: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (val: string) => void;
  financialMonth: string;
  setFinancialMonth: (val: string) => void;
  financialYear: number;
  loadingGrades: boolean;
  loadingAttendance: boolean;
  loadingFinancial: boolean;
  handleExportGrades: () => void;
  handleExportAttendance: () => void;
  handleExportFinancial: () => void;
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
const PERIODS = ["P1", "P2", "P3", "P4", "FINAL"];

export function BatchExportGrid({
  allSections,
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
  handleExportGrades,
  handleExportAttendance,
  handleExportFinancial,
}: BatchExportGridProps) {
  return (
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
  );
}
