import { Skeleton } from "@/components/ui/skeleton";

export default function ReportesLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2 flex-wrap">
        {["Calificaciones", "Asistencia", "Pagos", "Alumnos"].map((tab) => (
          <Skeleton key={tab} className="h-9 w-36 rounded-md" />
        ))}
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-40 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md ml-auto" />
      </div>

      {/* Chart area */}
      <div className="rounded-xl border bg-white p-6 shadow-sm h-[300px] space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-full w-full rounded-lg" />
      </div>

      {/* Summary table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-slate-50">
          {["Grado", "Sección", "Aprobados", "Desaprobados", "Promedio"].map((h) => (
            <Skeleton key={h} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
