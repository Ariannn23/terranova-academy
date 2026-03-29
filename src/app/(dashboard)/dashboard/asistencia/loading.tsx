import { Skeleton } from "@/components/ui/skeleton";

export default function AsistenciaLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Date + Section selectors */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-44 rounded-md" />
        <Skeleton className="h-10 w-56 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["Presentes", "Tardanzas", "Justificadas", "Faltas"].map((label) => (
          <div key={label} className="rounded-lg border bg-white p-4 space-y-2 shadow-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Attendance table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-5 gap-4 p-4 border-b bg-slate-50">
          {["#", "Alumno", "Estado", "Observación", "Acciones"].map((col) => (
            <Skeleton key={col} className="h-4 w-full" />
          ))}
        </div>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 items-center">
            <Skeleton className="h-4 w-6" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
            {/* Status toggle buttons */}
            <div className="flex gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-7 w-7 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
  );
}
