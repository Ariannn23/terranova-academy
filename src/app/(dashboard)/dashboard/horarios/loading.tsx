import { Skeleton } from "@/components/ui/skeleton";

export default function HorariosLoading() {
  const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const HOURS = 8; // ~8 slots from 7am to 3pm

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Section selector + action button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Skeleton className="h-10 w-72 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Schedule grid */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b">
          <div className="p-3 border-r bg-slate-50" />
          {DAYS.map((day) => (
            <div key={day} className="p-3 border-r last:border-0 bg-slate-50 flex justify-center">
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
        {/* Time slots */}
        {Array.from({ length: HOURS }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 border-b last:border-0">
            {/* Hour label */}
            <div className="p-3 border-r bg-slate-50 flex items-center justify-end">
              <Skeleton className="h-3 w-10" />
            </div>
            {/* Day cells */}
            {DAYS.map((day) => (
              <div key={day} className="p-2 border-r last:border-0 min-h-[64px]">
                {/* Randomly populate some cells with course blocks */}
                {(row + DAYS.indexOf(day)) % 3 === 0 && (
                  <Skeleton className="h-full w-full rounded-md min-h-[48px]" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
