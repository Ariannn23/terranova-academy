import { Skeleton } from "@/components/ui/skeleton";

export default function NotasLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Selectors row: section, course, period */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 w-52 rounded-md" />
        <Skeleton className="h-10 w-52 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>

      {/* Grades table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {/* Header: Alumno + P1 + P2 + P3 + P4 + Final */}
        <div className="grid grid-cols-7 gap-3 p-4 border-b bg-slate-50">
          <Skeleton className="h-4 col-span-2 w-24" />
          {["P1", "P2", "P3", "P4", "Final"].map((p) => (
            <Skeleton key={p} className="h-4 w-8 mx-auto" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="grid grid-cols-7 gap-3 p-4 border-b last:border-0 items-center">
            <div className="col-span-2 flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-9 w-full rounded-md" />
            ))}
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>
    </div>
  );
}
