"use client";

import { ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { useRegisterIncident } from "./hooks/useRegisterIncident";
import { IncidentStudentSearch } from "./_components/IncidentStudentSearch";
import { IncidentFormFields } from "./_components/IncidentFormFields";

export function RegisterIncidentClient() {
  const {
    form,
    searchHook,
    activeEnrollment,
    isSubmitting,
    handleSelectStudent,
    removeSelectedStudent,
    onSubmit,
    router,
  } = useRegisterIncident();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nueva Incidencia"
        description="Selecciona un alumno activo y documenta la incidencia ocurrida (Leve, Moderada o Grave)."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/incidencias">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Búsqueda */}
        <div className="lg:col-span-1 space-y-4">
          <IncidentStudentSearch
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

        {/* Columna Derecha: Formulario de Registro */}
        <div className="lg:col-span-2">
          <Card
            className={
              !activeEnrollment ? "opacity-50 pointer-events-none" : ""
            }
          >
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                2. Detalles de la Incidencia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <IncidentFormFields
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
