"use client";

export function ScheduleCell({
  schedule,
  onClick,
}: {
  schedule?: any;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-2 border-r border-slate-100 flex flex-col justify-center items-center text-center cursor-pointer transition-colors relative min-h-[80px]
        ${schedule ? "bg-emerald-50 hover:bg-emerald-100/70 border-l border-emerald-400" : "hover:bg-slate-50"}
      `}
    >
      {schedule ? (
        <>
          <span
            className="text-sm font-bold text-slate-800 line-clamp-1"
            title={schedule.course.name}
          >
            {schedule.course.name}
          </span>
          <span className="text-xs text-slate-500 line-clamp-1 mt-1">
            Prof. {schedule.teacher.lastName}
          </span>
        </>
      ) : (
        <span className="text-xs text-slate-400 italic">Libre</span>
      )}
    </div>
  );
}
