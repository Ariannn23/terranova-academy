"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { filterDirectory } from "@/services/directory-filter.service";

type IncidentDirectoryItem = {
  id: string;
  severity?: string;
  enrollment?: {
    student?: {
      firstName?: string;
      lastName?: string;
      dni?: string;
    };
  };
};

export function useIncidentsDirectory<T extends IncidentDirectoryItem>(
  initialData: T[],
) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  useEffect(() => {
    toast.dismiss();
  }, []);

  const filteredIncidents = useMemo(
    () =>
      filterDirectory(initialData, {
        searchTerm,
        searchKeys: [
          "enrollment.student.firstName",
          "enrollment.student.lastName",
          "enrollment.student.dni",
        ],
        severity: severityFilter,
        getSeverity: (record) => record.severity,
      }),
    [initialData, searchTerm, severityFilter],
  );

  const viewIncident = (incidentId: string) => {
    toast.loading("Cargando perfil del alumno...", {
      id: "view-profile",
    });
    router.push(`/dashboard/incidencias/${incidentId}`);
  };

  return {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    filteredIncidents,
    viewIncident,
  };
}
