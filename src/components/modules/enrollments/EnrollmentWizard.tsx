"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { Check, ChevronRight, Loader2 } from "lucide-react";

import { useEnrollmentWizard } from "./hooks/useEnrollmentWizard";
import { WizardStudentStep } from "./_components/WizardStudentStep";
import { WizardSectionStep } from "./_components/WizardSectionStep";
import { WizardConfirmationStep } from "./_components/WizardConfirmationStep";

export function EnrollmentWizard({ initialData }: { initialData: any }) {
  const {
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
  } = useEnrollmentWizard(initialData);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Nueva Matrícula"
        description="Asistente paso a paso para matricular a un estudiante."
      />

      {/* Stepper UI */}
      <div className="flex items-center justify-between xl:px-12 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center relative z-10">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-colors ${
                step === s
                  ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                  : step > s
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {step > s ? <Check className="w-5 h-5" /> : s}
            </div>
            <span
              className={`text-xs font-medium ${step >= s ? "text-slate-900" : "text-slate-400"}`}
            >
              {s === 1 ? "Estudiante" : s === 2 ? "Sección" : "Confirmación"}
            </span>
          </div>
        ))}
      </div>

      <Card className="min-h-[400px]">
        {step === 1 && (
          <WizardStudentStep
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredStudents={filteredStudents}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
          />
        )}

        {step === 2 && (
          <WizardSectionStep
            sections={sections}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />
        )}

        {step === 3 && selectedStudent && selectedSection && (
          <WizardConfirmationStep
            selectedStudent={selectedStudent}
            selectedSection={selectedSection}
            currentYear={currentYear}
            errorProp={errorProp}
          />
        )}
      </Card>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center mt-6">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1 || isPending}
        >
          Regresar
        </Button>
        {step < 3 ? (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && !selectedStudent) ||
              (step === 2 && !selectedSection)
            }
          >
            Continuar <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={onSubmit}
            disabled={isPending}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirmar Matrícula
          </Button>
        )}
      </div>
    </div>
  );
}
