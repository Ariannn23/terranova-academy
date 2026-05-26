"use client";

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
import { Loader2, Trash2 } from "lucide-react";
import { useScheduleCell } from "../hooks/useScheduleCell";

interface ScheduleCellModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  courses: any[];
  teachers: any[];
}

export function ScheduleCellModal({
  isOpen,
  onClose,
  data,
  courses,
  teachers,
}: ScheduleCellModalProps) {
  const {
    loading,
    deleting,
    courseId,
    setCourseId,
    teacherId,
    setTeacherId,
    handleSave,
    handleDelete,
  } = useScheduleCell({ data, onClose });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Asignar Bloque Horario</DialogTitle>
          <DialogDescription>
            {data?.block?.startTime} - {data?.block?.endTime}
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
          {data?.schedule?.id ? (
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
              onClick={onClose}
              disabled={loading || deleting}
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
  );
}
