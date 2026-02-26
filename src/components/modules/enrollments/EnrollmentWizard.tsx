"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Check,
  ChevronRight,
  Search,
  User as UserIcon,
  Loader2,
  Users,
} from "lucide-react";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { useRouter } from "next/navigation";
import { createEnrollment } from "@/lib/actions/enrollments.actions";

export function EnrollmentWizard({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);
  const [errorProp, setErrorProp] = useState("");
  const [isPending, startTransition] = useTransition();

  const { students, sections, academicYears } = initialData;
  const currentYear = academicYears[0];

  const filteredStudents = students.filter(
    (s: any) =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dni.includes(searchTerm),
  );

  const handleNext = () => setStep((s) => Math.min(3, s + 1));
  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = () => {
    if (!selectedStudent || !selectedSection || !currentYear) return;
    setErrorProp("");
    startTransition(() => {
      createEnrollment(
        selectedStudent.id,
        selectedSection.id,
        currentYear.id,
      ).then((res) => {
        if (res.success) {
          router.push("/dashboard/matriculas");
          router.refresh();
        } else {
          setErrorProp(res.error || "Error inesperado");
        }
      });
    });
  };

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
        {/* Lines behind steppers would require absolute positioning, omitted for brevity, keeping simple flex */}
      </div>

      <Card className="min-h-[400px]">
        {/* Step 1: Seleccionar Estudiante */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Paso 1: Selecciona al Estudiante</CardTitle>
              <CardDescription>
                Busca un estudiante que no tenga matrícula activa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative max-w-md mb-4">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o DNI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="border rounded-md divide-y overflow-y-auto max-h-[250px]">
                {filteredStudents.length > 0 ? (
                  filteredStudents.slice(0, 10).map((s: any) => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStudent(s)}
                      className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors ${selectedStudent?.id === s.id ? "bg-emerald-50 border-l-4 border-emerald-600" : ""}`}
                    >
                      <div className="flex items-center space-x-3">
                        <StudentAvatar
                          name={`${s.firstName} ${s.lastName}`}
                          imageUrl={s.photoUrl}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-slate-900">
                            {s.firstName} {s.lastName}
                          </p>
                          <p className="text-xs text-slate-500">DNI: {s.dni}</p>
                        </div>
                      </div>
                      {selectedStudent?.id === s.id && (
                        <Check className="h-5 w-5 text-emerald-600" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No se encontraron estudiantes elegibles.
                  </div>
                )}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 2: Seleccionar Sección */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Paso 2: Asignación de Sección</CardTitle>
              <CardDescription>
                Selecciona el grado y sección para este año lectivo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {["INICIAL", "PRIMARIA", "SECUNDARIA"].map((levelGroup) => {
                const levelSections = sections.filter(
                  (s: any) => s.level === levelGroup,
                );

                if (levelSections.length === 0) return null;

                return (
                  <div key={levelGroup} className="space-y-4">
                    <h3 className="font-semibold text-slate-800 border-b border-slate-200 pb-2 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Nivel{" "}
                      {levelGroup.charAt(0) + levelGroup.slice(1).toLowerCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {levelSections.map((sec: any) => {
                        const isFull = sec.occupied >= sec.capacity;
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
                                  {sec.grade} "{sec.name}"
                                </p>
                                <p className="text-xs text-slate-500">
                                  {sec.level}
                                </p>
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
                                <span className="text-red-600 font-medium">
                                  Lleno
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-medium">
                                  Disponible
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
        )}

        {/* Step 3: Confirmación */}
        {step === 3 && selectedStudent && selectedSection && (
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
                        {selectedSection.grade} "{selectedSection.name}"
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
                <p className="text-red-500 text-sm mt-4 text-center">
                  {errorProp}
                </p>
              )}
            </CardContent>
          </>
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
