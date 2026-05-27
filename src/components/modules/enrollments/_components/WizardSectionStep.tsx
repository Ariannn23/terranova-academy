"use client";

import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Users } from "lucide-react";
import type { EnrollmentSectionOption } from "@/types/enrollment";

interface WizardSectionStepProps {
  sections: EnrollmentSectionOption[];
  selectedSection: EnrollmentSectionOption | null;
  setSelectedSection: (s: EnrollmentSectionOption) => void;
  errorMessage?: string;
}

export function WizardSectionStep({
  sections,
  selectedSection,
  setSelectedSection,
  errorMessage,
}: WizardSectionStepProps) {
  return (
    <>
      <CardHeader>
        <CardTitle>Paso 2: Asignación de Sección</CardTitle>
        <CardDescription>
          Selecciona el grado y sección para este año lectivo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {["INICIAL", "PRIMARIA", "SECUNDARIA"].map((levelGroup) => {
          const levelSections = sections.filter(
            (s) => s.level === levelGroup,
          );

          if (levelSections.length === 0) return null;

          return (
            <div key={levelGroup} className="space-y-4">
              <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                Nivel {levelGroup.charAt(0) + levelGroup.slice(1).toLowerCase()}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {levelSections.map((sec) => {
                  const available =
                    typeof sec.available === "number"
                      ? sec.available
                      : Math.max(sec.capacity - sec.occupied, 0);
                  const isFull = available <= 0;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => !isFull && setSelectedSection(sec)}
                      className={`p-4 border rounded-xl cursor-pointer transition-all ${
                        isFull
                          ? "opacity-50 bg-slate-50 cursor-not-allowed"
                          : selectedSection?.id === sec.id
                            ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-500"
                            : "hover:border-slate-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-slate-900">
                            {sec.grade} &quot;{sec.name}&quot;
                          </p>
                          <p className="text-xs text-slate-500">{sec.level}</p>
                        </div>
                        {selectedSection?.id === sec.id && (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-xs">
                        <span className="flex items-center text-slate-600">
                          <Users className="w-3 h-3 mr-1" />
                          {sec.occupied} / {sec.capacity}
                        </span>
                        {isFull ? (
                          <span className="text-red-600 font-medium">Lleno</span>
                        ) : (
                          <span className="text-emerald-600 font-medium">
                            {available} vacantes
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </>
  );
}
