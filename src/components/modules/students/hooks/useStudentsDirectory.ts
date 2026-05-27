"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { filterDirectory } from "@/services/directory-filter.service";

type StudentDirectoryItem = {
  id: string;
  firstName?: string;
  lastName?: string;
  dni?: string;
  status?: string;
  enrollments?: Array<{
    section?: {
      gradeLevel?: {
        level?: string;
      };
    };
  }>;
};

export function useStudentsDirectory<T extends StudentDirectoryItem>(
  initialData: T[],
) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredStudents = useMemo(
    () =>
      filterDirectory(initialData, {
        searchTerm,
        searchKeys: ["firstName", "lastName", "dni"],
        status: statusFilter,
        getStatus: (student) => student.status,
        level: levelFilter,
        getLevel: (student) =>
          student.enrollments?.[0]?.section?.gradeLevel?.level,
      }),
    [initialData, levelFilter, searchTerm, statusFilter],
  );

  const viewStudent = (studentId: string) => {
    toast.loading("Cargando perfil del estudiante...", {
      id: "view-student",
    });
    router.push(`/dashboard/estudiantes/${studentId}`);
  };

  const createStudent = () => {
    toast.loading("Iniciando registro de estudiante...", {
      id: "nav-new-student",
    });
    router.push("/dashboard/estudiantes/nuevo");
  };

  return {
    searchTerm,
    setSearchTerm,
    levelFilter,
    setLevelFilter,
    statusFilter,
    setStatusFilter,
    filteredStudents,
    viewStudent,
    createStudent,
  };
}
