"use client";

import { useState, useEffect } from "react";
import { ScheduleCell } from "./ScheduleCell";
import { ScheduleCellModal } from "./_components/ScheduleCellModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const DAYS_OF_WEEK = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
];

export const TIME_BLOCKS = [
  { startTime: "08:00", endTime: "08:45", label: "1er Bloque" },
  { startTime: "08:45", endTime: "09:30", label: "2do Bloque" },
  { startTime: "09:30", endTime: "10:00", label: "Recreo", isBreak: true },
  { startTime: "10:00", endTime: "10:45", label: "3er Bloque" },
  { startTime: "10:45", endTime: "11:30", label: "4to Bloque" },
  { startTime: "11:30", endTime: "12:15", label: "5to Bloque" },
  { startTime: "12:15", endTime: "13:00", label: "6to Bloque" },
  { startTime: "13:00", endTime: "13:45", label: "7mo Bloque" },
];

export function ScheduleGrid({
  section,
  schedules,
  courses,
  teachers,
}: {
  section: any;
  schedules: any[];
  courses: any[];
  teachers: any[];
}) {
  const [selectedCell, setSelectedCell] = useState<any | null>(null);

  useEffect(() => {
    toast.dismiss();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Horario Escolar - ${section.gradeLevel.name} "${section.name}"`}
        description={`Asigna los cursos y plana docente para la sección ${section.name} del nivel ${section.gradeLevel.level}.`}
        breadcrumbs={[
          { label: "Horarios", href: "/dashboard/horarios" },
          { label: `Editar #${section.id.split("-")[0]}` },
        ]}
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/horarios">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Link>
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 border-b border-slate-200 bg-slate-50">
            <div className="p-4 font-bold text-center text-slate-500 border-r border-slate-200">
              Horas
            </div>
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.id}
                className="p-4 font-bold text-center text-slate-700 uppercase tracking-wide text-xs"
              >
                {day.label}
              </div>
            ))}
          </div>

          {/* Time Blocks */}
          {TIME_BLOCKS.map((block, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-6 border-b border-slate-100 ${block.isBreak ? "bg-amber-50/50" : "bg-white hover:bg-slate-50/50 transition-colors"}`}
            >
              {/* Timing Column */}
              <div className="p-3 border-r border-slate-100 flex flex-col justify-center items-center text-center">
                <span className="text-xs font-semibold text-slate-400">
                  {block.label}
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {block.startTime} - {block.endTime}
                </span>
              </div>

              {/* Day Columns */}
              {block.isBreak ? (
                <div className="col-span-5 p-3 flex items-center justify-center text-amber-600 font-medium tracking-[0.2em] uppercase text-xs">
                  RECREO Y DESCANSO|
                </div>
              ) : (
                DAYS_OF_WEEK.map((day) => {
                  const currentSchedule = schedules.find(
                    (s) =>
                      s.dayOfWeek === day.id && s.startTime === block.startTime,
                  );

                  return (
                    <ScheduleCell
                      key={`${day.id}-${block.startTime}`}
                      schedule={currentSchedule}
                      onClick={() =>
                        setSelectedCell({
                          sectionId: section.id,
                          dayOfWeek: day.id,
                          block,
                          schedule: currentSchedule,
                        })
                      }
                    />
                  );
                })
              )}
            </div>
          ))}
        </div>
      </div>

      <ScheduleCellModal
        isOpen={!!selectedCell}
        onClose={() => setSelectedCell(null)}
        data={selectedCell}
        courses={courses}
        teachers={teachers}
      />
    </div>
  );
}
