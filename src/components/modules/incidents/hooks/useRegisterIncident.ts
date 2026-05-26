import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createIncident } from "@/lib/actions/incident.actions";
import { IncidentSchema } from "@/lib/validations/incident.schema";
import { useStudentSearch } from "@/components/shared/hooks/useStudentSearch";
import { SearchStudentResult } from "@/lib/actions/payment.actions";

type ActiveEnrollment = NonNullable<SearchStudentResult["enrollments"]>[number];

export function useRegisterIncident() {
  const router = useRouter();
  const searchHook = useStudentSearch();
  const [activeEnrollment, setActiveEnrollment] =
    useState<ActiveEnrollment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof IncidentSchema>>({
    resolver: zodResolver(IncidentSchema),
    defaultValues: {
      enrollmentId: "",
      date: new Date(),
      severity: "LEVE",
      description: "",
      action: "",
    },
  });

  const handleSelectStudent = (student: SearchStudentResult) => {
    searchHook.setSelectedStudent(student);
    searchHook.setSearchTerm("");
    searchHook.searchResults.length = 0; // Trigger reset

    if (student.enrollments && student.enrollments.length > 0) {
      const enrollment = student.enrollments[0];
      setActiveEnrollment(enrollment);
      form.setValue("enrollmentId", enrollment.id);
    } else {
      setActiveEnrollment(null);
      form.setValue("enrollmentId", "");
      toast.error("El alumno seleccionado no tiene una matrícula activa.");
    }
  };

  const removeSelectedStudent = () => {
    searchHook.setSelectedStudent(null);
    setActiveEnrollment(null);
    form.reset({
      enrollmentId: "",
      date: new Date(),
      severity: "LEVE",
      description: "",
      action: "",
    });
  };

  const onSubmit = async (values: z.infer<typeof IncidentSchema>) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Registrando incidencia...");

    try {
      const res = await createIncident(values);

      if (res.success) {
        toast.success("Incidencia registrada correctamente.", { id: toastId });
        router.push("/dashboard/incidencias");
      } else {
        toast.error(res.error, { id: toastId });
      }
    } catch {
      toast.error("Error de conexión al servidor.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    searchHook,
    activeEnrollment,
    isSubmitting,
    handleSelectStudent,
    removeSelectedStudent,
    onSubmit,
    router,
  };
}
