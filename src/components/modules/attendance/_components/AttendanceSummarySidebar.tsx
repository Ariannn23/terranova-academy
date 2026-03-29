import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeInfo, Save, Loader2 } from "lucide-react";

interface AttendanceSummarySidebarProps {
  stats: {
    totalStudents: number;
    presentCount: number;
    lateCount: number;
    absentCount: number;
    unmarkedCount: number;
  };
  isLoadingGrid: boolean;
  isSaving: boolean;
  handleSave: () => void;
}

export function AttendanceSummarySidebar({
  stats,
  isLoadingGrid,
  isSaving,
  handleSave
}: AttendanceSummarySidebarProps) {
  return (
    <Card className="sticky top-6">
      <CardHeader className="bg-slate-50/50 border-b">
        <CardTitle className="text-lg">Resumen Diario</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Estadísticas de sección</p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <span className="block text-2xl font-bold text-slate-800">
              {stats.totalStudents}
            </span>
            <span className="block text-xs font-semibold text-slate-500 uppercase mt-1">
              Total M.
            </span>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-center">
            <span className="block text-2xl font-bold text-emerald-700">
              {stats.presentCount}
            </span>
            <span className="block text-xs font-semibold text-emerald-600 uppercase mt-1">
              Presentes
            </span>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-center">
            <span className="block text-2xl font-bold text-amber-700">
              {stats.lateCount}
            </span>
            <span className="block text-xs font-semibold text-amber-600 uppercase mt-1">
              Tardanzas
            </span>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
            <span className="block text-2xl font-bold text-red-700">
              {stats.absentCount}
            </span>
            <span className="block text-xs font-semibold text-red-600 uppercase mt-1">
              Faltas
            </span>
          </div>
        </div>

        {stats.unmarkedCount > 0 && (
          <div className="flex items-start gap-3 p-3 text-sm text-blue-800 bg-blue-50 border border-blue-200 rounded-lg">
            <BadgeInfo className="h-5 w-5 shrink-0 mt-0.5" />
            <p>
              Falta marcar la asistencia a <strong>{stats.unmarkedCount}</strong> alumno(s).
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-6 px-6">
        <Button
          onClick={handleSave}
          disabled={isSaving || stats.totalStudents === 0 || isLoadingGrid}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-md"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Save className="mr-1 h-5 w-5" />
              Guardar Asistencia Diaria
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
