"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { filterDirectory } from "@/services/directory-filter.service";

type DisabilityDirectoryItem = {
  id: string;
  active?: boolean;
  reason?: string;
  enrollment?: {
    student?: {
      firstName?: string;
      lastName?: string;
      dni?: string;
    };
  };
};

function getDisabilityStatus(record: DisabilityDirectoryItem): string {
  return record.active ? "ACTIVE" : "RESOLVED";
}

export function useDisabilitiesDirectory<T extends DisabilityDirectoryItem>(
  initialData: T[],
) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reasonFilter, setReasonFilter] = useState("ALL");

  useEffect(() => {
    toast.dismiss();
  }, []);

  const filteredDisabilities = useMemo(
    () =>
      filterDirectory(initialData, {
        searchTerm,
        searchKeys: [
          "enrollment.student.firstName",
          "enrollment.student.lastName",
        ],
        status: statusFilter,
        getStatus: getDisabilityStatus,
        reason: reasonFilter,
        getReason: (record) => record.reason,
      }),
    [initialData, reasonFilter, searchTerm, statusFilter],
  );

  const viewDisability = (disabilityId: string) => {
    toast.loading("Cargando detalles...", { id: "view-disability" });
    router.push(`/dashboard/inhabilitaciones/${disabilityId}`);
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    reasonFilter,
    setReasonFilter,
    filteredDisabilities,
    viewDisability,
  };
}
