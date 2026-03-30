"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useRegisterDisability } from "./hooks/useRegisterDisability";
import { DisabilityStudentSearch } from "./_components/DisabilityStudentSearch";
import { DisabilityFormFields } from "./_components/DisabilityFormFields";

export function RegisterDisabilityClient() {
  const {
    form,
    searchHook,
    activeEnrollment,
    isSubmitting,
    handleSelectStudent,
    removeSelectedStudent,
    onSubmit,
    router,
  } = useRegisterDisability();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nueva Inhabilitación"
        description="Selecciona un alumno activo y documenta la razón de la inhabilitación académica o disciplinaria."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/inhabilitaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Búsqueda */}
        <div className="lg:col-span-1 space-y-4">
          <DisabilityStudentSearch
            searchTerm={searchHook.searchTerm}
            setSearchTerm={searchHook.setSearchTerm}
            searchResults={searchHook.searchResults}
            isSearching={searchHook.isSearching}
            selectedStudent={searchHook.selectedStudent}
            activeEnrollment={activeEnrollment}
            handleSelectStudent={handleSelectStudent}
            removeSelectedStudent={removeSelectedStudent}
          />
        </div>

        {/* Columna Derecha: Formulario de Motivos */}
        <div className="lg:col-span-2">
          <Card
            className={
              !activeEnrollment ? "opacity-50 pointer-events-none" : ""
            }
          >
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                2. Detalles de Sanción / Inhabilitación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <DisabilityFormFields
                    form={form}
                    isSubmitting={isSubmitting}
                    activeEnrollment={activeEnrollment}
                    router={router}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
