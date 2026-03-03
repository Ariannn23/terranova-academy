"use client";

import { useState } from "react";
import {
  saveScheduleBlock,
  deleteScheduleBlock,
} from "@/lib/actions/schedule.actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export function ScheduleCell({
  sectionId,
  dayOfWeek,
  block,
  schedule,
  courses,
  teachers,
}: {
  sectionId: string;
  dayOfWeek: number;
  block: any;
  schedule?: any;
  courses: any[];
  teachers: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [courseId, setCourseId] = useState(schedule?.course?.id || "");
  const [teacherId, setTeacherId] = useState(schedule?.teacher?.id || "");

  const handleSave = async () => {
    if (!courseId || !teacherId) {
      toast.error("Debe seleccionar un curso y un docente.");
      return;
    }

    setLoading(true);
    const result = await saveScheduleBlock({
      id: schedule?.id,
      sectionId,
      courseId,
      teacherId,
      dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
    });

    if (result.success) {
      toast.success("Horario guardado correctamente.");
      setIsOpen(false);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!schedule?.id) return;
    setDeleting(true);
    const result = await deleteScheduleBlock(schedule.id, sectionId);
    if (result.success) {
      toast.success("Bloque liberado.");
      setCourseId("");
      setTeacherId("");
      setIsOpen(false);
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  };

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Asignar Bloque Horario</DialogTitle>
            <DialogDescription>
              {block.startTime} - {block.endTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Curso dictado</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un curso..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500 text-center">
                      No hay cursos creados para este grado.
                    </div>
                  ) : (
                    courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Docente asignado</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la plana docente..." />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500 text-center">
                      No hay docentes activos registrados.
                    </div>
                  ) : (
                    teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName} ({t.specialty || "General"})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                El sistema validará automáticamente si el docente tiene cruce de
                horarios antes de guardar.
              </p>
            </div>
          </div>

          <div className="flex justify-between border-t pt-4">
            {schedule?.id ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={deleting || loading}
                title="Liberar bloque"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading || deleting}
                className="bg-emerald-700 hover:bg-emerald-800"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
