"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { updateCourse } from "@/lib/actions/course.actions";
import { filterDirectory } from "@/services/directory-filter.service";

type CourseDirectoryItem = {
  id: string;
  name?: string;
  active?: boolean;
  gradeLevel?: {
    name?: string;
    level?: string;
  };
};

export function useCoursesDirectory<T extends CourseDirectoryItem>(
  initialData: T[],
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<T | null>(null);
  const [courseToToggle, setCourseToToggle] = useState<T | null>(null);

  const filteredCourses = useMemo(
    () =>
      filterDirectory(initialData, {
        searchTerm,
        searchKeys: ["name", "gradeLevel.name", "gradeLevel.level"],
      }),
    [initialData, searchTerm],
  );

  const handleEdit = (course: T) => {
    setSelectedCourse(course);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedCourse(null);
    setIsFormOpen(true);
  };

  const handleToggleClick = (course: T) => {
    setCourseToToggle(course);
  };

  const handleConfirmToggle = async () => {
    if (!courseToToggle) return;

    const newStatus = !courseToToggle.active;
    const loadingToast = toast.loading(
      newStatus ? "Activando curso..." : "Desactivando curso...",
    );

    const result = await updateCourse(courseToToggle.id, {
      active: newStatus,
    });

    toast.dismiss(loadingToast);
    if (result.success) {
      toast.success(
        `Curso ${newStatus ? "activado" : "inhabilitado"} correctamente`,
      );
    } else {
      toast.error(result.error || "Error al cambiar estado del curso");
    }

    setCourseToToggle(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredCourses,
    isFormOpen,
    setIsFormOpen,
    selectedCourse,
    courseToToggle,
    setCourseToToggle,
    handleEdit,
    handleCreate,
    handleToggleClick,
    handleConfirmToggle,
  };
}
