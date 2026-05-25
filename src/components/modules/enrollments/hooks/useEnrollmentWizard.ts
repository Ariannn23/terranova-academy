import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createEnrollment } from "@/lib/actions/enrollment.actions";

export function useEnrollmentWizard(initialData: any) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [errorProp, setErrorProp] = useState("");

  useState(() => {
    toast.dismiss("nav-new-enrollment");
    return undefined;
  });

  const { students, sections, academicYears } = initialData;
  const currentYear = academicYears[0];

  const filteredStudents = students.filter(
    (s: any) =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dni.includes(searchTerm),
  );

  const handleNext = () => {
    if (step === 2 && selectedSection?.available <= 0) {
      const message = "La secciÃ³n seleccionada no tiene vacantes disponibles.";
      setErrorProp(message);
      toast.error(message);
      return;
    }

    setErrorProp("");
    setStep((s) => Math.min(3, s + 1));
  };
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = () => {
    if (!selectedStudent || !selectedSection || !currentYear) return;
    setErrorProp("");

    if (selectedSection.available <= 0) {
      const message = "La secciÃ³n seleccionada no tiene vacantes disponibles.";
      setErrorProp(message);
      toast.error(message);
      return;
    }

    const toastId = toast.loading("Registrando matrícula y generando cuotas...");

    startTransition(() => {
      createEnrollment({
        studentId: selectedStudent.id,
        sectionId: selectedSection.id,
        academicYearId: currentYear.id,
      })
        .then((res) => {
          if (res.success) {
            toast.success("Alumno matriculado con éxito", { id: toastId });
            router.push("/dashboard/matriculas");
            router.refresh();
          } else {
            const errorMsg =
              typeof res.error === "string"
                ? res.error
                : "Error de validación en los datos";
            toast.error(errorMsg, {
              id: toastId,
            });
            setErrorProp(errorMsg);
          }
        })
        .catch(() => {
          toast.error("Error de conexión o servidor", { id: toastId });
        });
    });
  };

  return {
    step,
    isPending,
    searchTerm,
    setSearchTerm,
    selectedStudent,
    setSelectedStudent,
    selectedSection,
    setSelectedSection,
    errorProp,
    sections,
    currentYear,
    filteredStudents,
    handleNext,
    handleBack,
    onSubmit,
  };
}
