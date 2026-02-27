"use client";

import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";

export function StudentProfileClient({ student }: { student: any }) {
  const currentEnrollment = student.enrollments?.[0];
  const gradeLevel = currentEnrollment?.section?.gradeLevel;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="text-slate-500">
          <Link href="/dashboard/estudiantes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Directorio
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/estudiantes/${student.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" /> Editar Perfil
          </Link>
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-emerald-700 w-full" />
        <CardContent className="px-6 pb-6 relative pt-0">
          <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
            <div className="-mt-10">
              <StudentAvatar
                name={`${student.firstName} ${student.lastName}`}
                imageUrl={student.photoUrl}
                size="xl"
                className="border-4 border-white shadow-sm bg-white"
              />
            </div>
            <div className="flex-1 space-y-1.5 md:pt-4">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                {student.code && (
                  <span className="flex items-center gap-1">
                    <strong>Cód:</strong> {student.code}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <strong>DNI:</strong> {student.dni}
                </span>
                {gradeLevel ? (
                  <span className="flex items-center gap-1">
                    <strong>Grado:</strong> {gradeLevel.name} (
                    {gradeLevel.level})
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    Sin Matrícula Activa
                  </span>
                )}
              </div>
            </div>
            <div className="md:pt-5">
              <StatusBadge status={student.status} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="datos">Datos Personales</TabsTrigger>
          <TabsTrigger value="apoderado">Apoderados</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
          <TabsTrigger value="asistencia">Asistencia</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="incidencias">Incidencias</TabsTrigger>
        </TabsList>

        <TabsContent
          value="datos"
          className="p-4 bg-white rounded-lg border border-slate-200 mt-2 shadow-sm min-h-[300px]"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Información del Estudiante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Fecha de Nacimiento</p>
              <p className="font-medium text-slate-900">
                {new Date(student.birthDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-slate-500 mb-1">Género</p>
              <p className="font-medium text-slate-900">{student.gender}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-slate-500 mb-1">Dirección de Residencia</p>
              <p className="font-medium text-slate-900">
                {student.address || "No registrada"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="apoderado"
          className="p-4 bg-white rounded-lg border border-slate-200 mt-2 shadow-sm min-h-[300px]"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Apoderados Registrados
          </h3>
          {student.guardians?.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {student.guardians.map((g: any) => (
                <div
                  key={g.id}
                  className="p-4 border rounded-md border-slate-100 flex gap-4 items-start"
                >
                  <StudentAvatar
                    name={`${g.firstName} ${g.lastName}`}
                    size="md"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {g.firstName} {g.lastName}
                    </p>
                    <p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mb-2">
                      {g.relation} {g.isPrimary ? "(Principal)" : ""}
                    </p>
                    <p className="text-sm text-slate-600">DNI: {g.dni}</p>
                    <p className="text-sm text-slate-600">Telf: {g.phone}</p>
                    {g.email && (
                      <p className="text-sm text-slate-600">Email: {g.email}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              No hay apoderados registrados para este estudiante.
            </p>
          )}
        </TabsContent>

        <TabsContent
          value="notas"
          className="p-4 bg-white rounded-lg border border-slate-200 mt-2 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400"
        >
          Módulo de Notas en construcción
        </TabsContent>
        <TabsContent
          value="asistencia"
          className="p-4 bg-white rounded-lg border border-slate-200 mt-2 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400"
        >
          Módulo de Asistencia en construcción
        </TabsContent>
        <TabsContent
          value="pagos"
          className="p-4 bg-white rounded-lg border border-slate-200 mt-2 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400"
        >
          Módulo de Pagos en construcción
        </TabsContent>
        <TabsContent
          value="incidencias"
          className="p-4 bg-white rounded-lg border border-slate-200 mt-2 shadow-sm min-h-[300px] flex items-center justify-center text-slate-400"
        >
          Módulo de Incidencias en construcción
        </TabsContent>
      </Tabs>
    </div>
  );
}
