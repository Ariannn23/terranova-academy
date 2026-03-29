import { Skeleton } from "@/components/ui/skeleton";

export default function PagosLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-60" />
      </div>

      {/* 4 Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Cobrado", "Pendiente", "Vencido", "Esta semana"].map((label) => (
          <div key={label} className="rounded-xl border bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>

      {/* Two-column layout: register payment + recent payments */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Register payment panel */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Recent payments table */}
        <div className="lg:col-span-3 rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <Skeleton className="h-5 w-36" />
          </div>
          <div className="grid grid-cols-5 gap-3 p-4 border-b bg-slate-50">
            {["Alumno", "Concepto", "Monto", "Fecha", "Recibo"].map((h) => (
              <Skeleton key={h} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-3 p-4 border-b last:border-0 items-center">
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
