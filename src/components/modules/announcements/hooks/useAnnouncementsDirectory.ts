"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteAnnouncement } from "@/lib/actions/announcement.actions";
import { filterDirectory } from "@/services/directory-filter.service";

type AnnouncementDirectoryItem = {
  id: string;
  title?: string;
  body?: string;
  targetLevel?: string | null;
};

export function useAnnouncementsDirectory<T extends AnnouncementDirectoryItem>(
  initialData: T[],
) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  useEffect(() => {
    toast.dismiss();
  }, []);

  const filteredAnnouncements = useMemo(
    () =>
      filterDirectory(initialData, {
        searchTerm,
        searchKeys: ["title", "body"],
        level: levelFilter,
        getLevel: (announcement) => announcement.targetLevel || "ALL",
      }),
    [initialData, levelFilter, searchTerm],
  );

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comunicado?"))
      return;

    toast.loading("Eliminando...", { id: "del-ann" });
    const res = await deleteAnnouncement(id);
    if (res.success) {
      toast.success("Comunicado eliminado.", { id: "del-ann" });
      router.refresh();
    } else {
      toast.error(res.error as string, { id: "del-ann" });
    }
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
  };

  return {
    isModalOpen,
    setIsModalOpen,
    searchTerm,
    setSearchTerm,
    levelFilter,
    setLevelFilter,
    filteredAnnouncements,
    handleDelete,
    openCreateModal,
    closeCreateModal,
  };
}
