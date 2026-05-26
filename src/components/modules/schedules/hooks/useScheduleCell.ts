"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  deleteScheduleBlock,
  saveScheduleBlock,
} from "@/lib/actions/schedule.actions";
import type { ScheduleCellData } from "@/types/schedule";

type UseScheduleCellOptions = {
  data: ScheduleCellData;
  onClose: () => void;
};

export function useScheduleCell({ data, onClose }: UseScheduleCellOptions) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [courseId, setCourseId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  useEffect(() => {
    if (data?.schedule) {
      setCourseId(data.schedule.course?.id || "");
      setTeacherId(data.schedule.teacher?.id || "");
    } else {
      setCourseId("");
      setTeacherId("");
    }
  }, [data]);

  const handleSave = async () => {
    if (!data) return;
    if (!courseId || !teacherId) {
      toast.error("Debe seleccionar un curso y un docente.");
      return;
    }

    setLoading(true);
    const result = await saveScheduleBlock({
      id: data.schedule?.id,
      sectionId: data.sectionId,
      courseId,
      teacherId,
      dayOfWeek: data.dayOfWeek,
      startTime: data.block.startTime,
      endTime: data.block.endTime,
    });

    if (result.success) {
      toast.success("Horario guardado correctamente.");
      onClose();
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!data?.schedule?.id) return;
    setDeleting(true);
    const result = await deleteScheduleBlock(data.schedule.id, data.sectionId);
    if (result.success) {
      toast.success("Bloque liberado.");
      setCourseId("");
      setTeacherId("");
      onClose();
    } else {
      toast.error(result.error);
    }
    setDeleting(false);
  };

  return {
    loading,
    deleting,
    courseId,
    setCourseId,
    teacherId,
    setTeacherId,
    handleSave,
    handleDelete,
  };
}
