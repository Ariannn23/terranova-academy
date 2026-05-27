"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import type {
  EnrollmentAcademicYearOption,
  EnrollmentSectionOption,
  EnrollmentStudentOption,
} from "@/types/enrollment";

interface WizardConfirmationStepProps {
  selectedStudent: EnrollmentStudentOption;
  selectedSection: EnrollmentSectionOption;
  currentYear?: EnrollmentAcademicYearOption;
  errorProp: string;
}

export function WizardConfirmationStep({
  selectedStudent,
  selectedSection,
  currentYear,
  errorProp,
}: WizardConfirmationStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Paso 3: Confirmación</CardTitle>
        <CardDescription>
          Revisa los datos antes de emitir la matrícula oficial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <StudentAvatar
            name={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
            size="xl"
          />
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <p className="text-slate-500">DNI: {selectedStudent.dni}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Nivel
                </p>
                <p className="font-medium text-slate-900">
                  {selectedSection.level}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Grado y Sección
                </p>
                <p className="font-medium text-slate-900">
                  {selectedSection.grade} &quot;{selectedSection.name}&quot;
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Año Lectivo
                </p>
                <p className="font-medium text-slate-900">
                  {currentYear?.year}
                </p>
              </div>
            </div>
          </div>
        </div>
        {errorProp && (
          <p className="text-red-500 text-sm mt-4 text-center">{errorProp}</p>
        )}
      </CardContent>
    </>
  );
}
