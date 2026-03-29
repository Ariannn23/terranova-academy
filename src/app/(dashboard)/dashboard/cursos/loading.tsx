import { Skeleton } from "@/components/ui/skeleton";

export default function CursosLoading() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header + Button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Level filter tabs */}
      <div className="flex gap-2">
        {["Todos", "Inicial", "Primaria", "Secundaria"].map((tab) => (
          <Skeleton key={tab} className="h-9 w-24 rounded-md" />
        ))}
      </div>

      {/* Courses grouped by grade level */}
      {Array.from({ length: 3 }).map((_, groupIdx) => (
        <div key={groupIdx} className="rounded-xl border bg-white shadow-sm overflow-hidden">
          {/* Group header */}
          <div className="flex items-center justify-between p-4 border-b bg-slate-50">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Courses rows */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-36" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
