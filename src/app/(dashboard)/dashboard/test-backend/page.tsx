"use client";

import { useState } from "react";
import {
  createStudent,
  getStudents,
  searchStudents,
} from "@/lib/actions/student.actions";
import { getTeachers, createTeacher } from "@/lib/actions/teacher.actions";
import {
  getAcademicStructure,
  getScheduleBySection,
} from "@/lib/actions/academic.actions";
import {
  getEnrollments,
  createEnrollment,
} from "@/lib/actions/enrollment.actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TestBackendPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async (action: () => Promise<any>) => {
    setLoading(true);
    try {
      const res = await action();
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // --- Estudiantes ---
  const handleTestGetStudents = () =>
    handleTest(() => getStudents({ limit: 5 }));
  const handleTestCreateStudent = () => {
    const dummy = {
      dni: Math.floor(10000000 + Math.random() * 90000000).toString(),
      firstName: "Estudiante",
      lastName: "Prueba " + Math.floor(Math.random() * 100),
      birthDate: new Date("2015-05-20"),
      gender: "MASCULINO",
      address: "Calle Falsa 123",
      status: "ACTIVO",
      guardians: [
        {
          dni: "12345678",
          firstName: "Apoderado",
          lastName: "Prueba",
          relation: "PADRE",
          phone: "999888777",
          email: "apoderado@test.com",
          isPrimary: true,
        },
      ],
    };
    handleTest(() => createStudent(dummy));
  };

  // --- Docentes ---
  const handleTestGetTeachers = () =>
    handleTest(() => getTeachers({ active: true }));
  const handleTestCreateTeacher = () => {
    const dummy = {
      dni: Math.floor(10000000 + Math.random() * 90000000).toString(),
      firstName: "Docente",
      lastName: "Prueba " + Math.floor(Math.random() * 100),
      email: `teacher.${Math.floor(Math.random() * 1000)}@test.com`,
      specialty: "Matemáticas",
    };
    handleTest(() => createTeacher(dummy));
  };

  // --- Estructura Académica ---
  const handleTestGetStructure = () => handleTest(() => getAcademicStructure());

  // --- Matrículas ---
  const handleTestGetEnrollments = () =>
    handleTest(() => getEnrollments({ limit: 5 }));
  const handleTestCreateEnrollment = async () => {
    setLoading(true);
    try {
      // Intentamos obtener datos reales para que la matrícula no falle por FKs
      const [studentRes, structureRes] = await Promise.all([
        getStudents({ limit: 1 }),
        getAcademicStructure(),
      ]);

      if (
        !studentRes.success ||
        !studentRes.data?.students?.length ||
        !structureRes.success ||
        !structureRes.data
      ) {
        setResults({
          success: false,
          error: "Necesitas tener al menos un estudiante y seccion creada",
        });
        setLoading(false);
        return;
      }

      const studentId = studentRes.data.students[0].id;
      const academicYearId = structureRes.data.id;
      const sectionId = structureRes.data.levels[0].grades[0].sections[0].id;

      const res = await createEnrollment({
        studentId,
        academicYearId,
        sectionId,
        notes: "Matrícula de prueba autogenerada",
      });
      setResults(res);
    } catch (error) {
      setResults({
        success: false,
        error: "Error al preparar datos de prueba: " + String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold font-heading">
        Test Bench: Backend Completo
      </h1>
      <p className="text-muted-foreground">
        Usa estos botones para verificar que las Server Actions de cada módulo
        respondan correctamente.
      </p>

      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="teachers">Docentes</TabsTrigger>
          <TabsTrigger value="academic">Estructura Académica</TabsTrigger>
          <TabsTrigger value="enrollment">Matrículas</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestGetStudents} disabled={loading}>
              Ver Estudiantes (5)
            </Button>
            <Button
              onClick={handleTestCreateStudent}
              variant="secondary"
              disabled={loading}
            >
              Crear Estudiante Dummy
            </Button>
            <Button
              onClick={() => handleTest(() => searchStudents("Prueba"))}
              variant="outline"
              disabled={loading}
            >
              Buscar "Prueba"
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="teachers" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestGetTeachers} disabled={loading}>
              Ver Docentes Activos
            </Button>
            <Button
              onClick={handleTestCreateTeacher}
              variant="secondary"
              disabled={loading}
            >
              Crear Docente Dummy
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestGetStructure} disabled={loading}>
              Ver Árbol Académico (Estructura)
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="enrollment" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestGetEnrollments} disabled={loading}>
              Ver Matrículas (5)
            </Button>
            <Button
              onClick={handleTestCreateEnrollment}
              variant="secondary"
              disabled={loading}
            >
              Crear Matrícula Real (Estudiante exist.)
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Al crear una matrícula, se generarán automáticamente los pagos
            mensuales si existen conceptos activos.
          </p>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Resultado de la Acción</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
            {results
              ? JSON.stringify(results, null, 2)
              : "Sin resultados... selecciona un módulo y haz clic en un botón"}
          </pre>
        </CardContent>
      </Card>

      <div className="bg-amber-100 border-l-4 border-amber-500 p-4 text-amber-700">
        <p className="font-bold">⚠️ Conexión:</p>
        <p>
          Si las peticiones fallan por timeout, asegúrate de estar en una red
          sin bloqueos de puertos (Hotspot móvil recomendado).
        </p>
      </div>
    </div>
  );
}
