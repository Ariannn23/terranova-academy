"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentAvatar } from "@/components/shared/StudentAvatar";

import { useAttendanceCalendar } from "./hooks/useAttendanceCalendar";
import { CalendarStats } from "./_components/CalendarStats";
import { CalendarGrid } from "./_components/CalendarGrid";
import type { AttendanceRecord, AttendanceStats } from "./types";

interface StudentAttendanceCalendarProps {
  enrollment: {
    student: {
      firstName: string;
      lastName: string;
      photoUrl?: string | null;
      code?: string | null;
      dni: string;
    };
    section: {
      name: string;
      gradeLevel: {
        name: string;
      };
    };
  };
  stats?: AttendanceStats | null;
  history: AttendanceRecord[];
}

export function StudentAttendanceCalendar({
  enrollment,
  stats,
  history,
}: StudentAttendanceCalendarProps) {
  const router = useRouter();
  const { student, section } = enrollment;
  
  const {
    currentDate,
    daysInMonth,
    previousMonthDays,
    getDayStatus,
    handlers
  } = useAttendanceCalendar(history);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historial de Asistencia"
        description="Resumen y detalles de puntualidad del estudiante."
        action={
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Volver
          </Button>
        }
      />

      <Card className="border-slate-200">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
            <StudentAvatar
              name={`${student.firstName} ${student.lastName}`}
              imageUrl={student.photoUrl}
              size="lg"
            />
            <div className="flex-1 space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-600">
                {student.code && (
                  <>
                    <span>
                      <strong>Cód:</strong>{" "}
                      <span className="text-emerald-700 font-medium">
                        {student.code}
                      </span>
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  </>
                )}
                <span>
                  <strong>DNI:</strong> {student.dni}
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300 hidden md:block"></span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-medium">
                  {section.gradeLevel.name} &quot;{section.name}&quot;
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <CalendarStats stats={stats ?? null} />
        </div>

        <div className="lg:col-span-2">
          <CalendarGrid 
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            previousMonthDays={previousMonthDays}
            getDayStatus={getDayStatus}
            handlers={handlers}
          />
        </div>
      </div>
    </div>
  );
}
