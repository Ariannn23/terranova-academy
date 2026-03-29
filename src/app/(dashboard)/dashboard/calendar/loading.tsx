import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  // 6 weeks × 7 days = 42 cells typical calendar grid
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header + navigation */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>

      {/* Calendar grid */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b bg-slate-50">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="p-3 text-center border-r last:border-0">
              <Skeleton className="h-4 w-8 mx-auto" />
            </div>
          ))}
        </div>
        {/* Calendar days (6 rows) */}
        {Array.from({ length: 5 }).map((_, week) => (
          <div key={week} className="grid grid-cols-7 border-b last:border-0">
            {Array.from({ length: 7 }).map((_, day) => (
              <div
                key={day}
                className="min-h-[100px] p-2 border-r last:border-0 space-y-1.5"
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                {/* Occasional event badge */}
                {(week * 7 + day) % 5 === 0 && (
                  <Skeleton className="h-5 w-full rounded-md" />
                )}
                {(week * 7 + day) % 9 === 0 && (
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
