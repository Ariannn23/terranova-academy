"use client";

import { useMemo, useState } from "react";

import { filterDirectory } from "@/services/directory-filter.service";

type TeacherDirectoryItem = {
  firstName?: string;
  lastName?: string;
  dni?: string;
  specialty?: string | null;
};

export function useTeachersDirectory<T extends TeacherDirectoryItem>(
  initialData: T[],
) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<T | null>(null);

  const filteredTeachers = useMemo(
    () =>
      filterDirectory(initialData, {
        searchTerm,
        searchKeys: ["firstName", "lastName", "dni", "specialty"],
      }),
    [initialData, searchTerm],
  );

  const handleEdit = (teacher: T) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  return {
    searchTerm,
    setSearchTerm,
    filteredTeachers,
    isFormOpen,
    setIsFormOpen,
    selectedTeacher,
    handleEdit,
    handleCreate,
  };
}
