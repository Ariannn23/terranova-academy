"use client";

import { useState } from "react";
import {
  getStudents,
  searchStudents,
  createStudent,
} from "@/lib/actions/student.actions";
import { getTeachers, createTeacher } from "@/lib/actions/teacher.actions";
import {
  getAcademicStructure,
  getScheduleBySection,
  getCoursesByGradeLevel,
  createAcademicYear,
  deleteAcademicYear2026,
  createCourse,
} from "@/lib/actions/academic.actions";
import {
  getEnrollments,
  createEnrollment,
} from "@/lib/actions/enrollment.actions";
import {
  getGradesBySection,
  saveGrades,
  getStudentGrades,
  getSectionGradeReport,
} from "@/lib/actions/grade.actions";
import {
  getAttendanceBySection,
  getAttendanceByStudent,
  saveAttendance,
  getAttendanceStats,
  getCriticalAttendance,
  getSectionAttendanceReport,
} from "@/lib/actions/attendance.actions";
import {
  getPaymentsByEnrollment,
  registerPayment,
  generateMonthlyPayments,
  getFinancialSummary,
} from "@/lib/actions/payment.actions";
import { createIncident, getIncidents } from "@/lib/actions/incident.actions";
import {
  createDisability,
  getActiveDisabilities,
  resolveDisability,
} from "@/lib/actions/disability.actions";
import {
  createAnnouncement,
  getAnnouncements,
} from "@/lib/actions/announcement.actions";
import {
  createCalendarEvent,
  getEventsByMonth,
  getHolidayDates,
} from "@/lib/actions/calendar.actions";

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

  const handleTestCreateAcademicYear2026 = () => {
    const startDate = new Date("2026-03-01");
    const endDate = new Date("2026-12-20");
    handleTest(() => createAcademicYear(2026, startDate, endDate, true));
  };

  const handleTestDebugAcademicYear = () =>
    handleTest(async () => {
      const res = await getAcademicStructure();
      if (res.success && res.data) {
        return {
          success: true,
          year: res.data.year,
          levelsCount: res.data.levels.length,
          levels: res.data.levels.map((l) => ({
            name: l.name,
            gradesCount: l.grades.length,
            grades: l.grades.map((g) => ({
              name: g.name,
              sectionsCount: g.sections.length,
            })),
          })),
        };
      }
      return res;
    });

  const handleTestCleanAndCreate2026 = async () => {
    setLoading(true);
    try {
      // Primero limpiar el 2026 si existe
      const deleteRes = await deleteAcademicYear2026();
      console.log("Delete 2026:", deleteRes);

      // Luego crear uno nuevo correctamente
      const startDate = new Date("2026-01-01");
      const endDate = new Date("2026-12-31");
      const createRes = await createAcademicYear(
        2026,
        startDate,
        endDate,
        true,
      );
      setResults(createRes);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // --- Matrículas ---
  const handleTestGetEnrollments = () =>
    handleTest(() => getEnrollments({ limit: 5 }));
  const handleTestCreateEnrollment = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data) {
        throw new Error("No hay estructura académica");
      }

      const academicYearId = structureRes.data.id;
      const sectionId = structureRes.data.levels[0].grades[0].sections[0].id;

      // Generar un estudiante falso para garantizar que no esté matriculado
      const randomId = Math.floor(Math.random() * 99999999);
      const randomDni = String(randomId).padStart(8, "0");
      const guardianDni = String(randomId + 1).padStart(8, "0");

      const studentRes = await createStudent({
        firstName: "Test",
        lastName: `Alumno ${randomId}`,
        dni: randomDni, // 8 digitos garantizados
        birthDate: new Date("2010-01-01"),
        gender: "MASCULINO",
        address: "Calle Falsa 123",
        guardians: [
          {
            dni: guardianDni,
            firstName: "Apoderado",
            lastName: "Test",
            relation: "PADRE",
            phone: "999888777",
            isPrimary: true,
          },
        ],
      });

      if (!studentRes.success || !studentRes.data) {
        throw new Error(
          "No se pudo crear el estudiante de prueba. Error: " +
            JSON.stringify(studentRes.error, null, 2),
        );
      }

      const studentId = studentRes.data.id;

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

  // --- Notas ---
  const handleTestGetGradesBySection = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const firstGrade = structureRes.data.levels[0].grades[0];
      const sectionId = firstGrade.sections[0].id;

      let coursesRes = await getCoursesByGradeLevel(firstGrade.id);
      if (!coursesRes.success || !coursesRes.data?.length) {
        // Crear un curso de prueba automáticamente si no hay
        await createCourse({
          name: "Curso de Prueba " + Math.floor(Math.random() * 100),
          gradeLevelId: firstGrade.id,
          hoursPerWeek: 4,
          active: true,
        });
        coursesRes = await getCoursesByGradeLevel(firstGrade.id);
      }
      if (!coursesRes.success || !coursesRes.data?.length) {
        throw new Error(
          "No hay cursos en el primer grado ni se pudo crear uno",
        );
      }

      const courseId = coursesRes.data[0].id;
      const res = await getGradesBySection(sectionId, courseId, "P1");
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSaveBatchGrades = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const firstGrade = structureRes.data.levels[0].grades[0];
      const sectionId = firstGrade.sections[0].id;

      let coursesRes = await getCoursesByGradeLevel(firstGrade.id);
      if (!coursesRes.success || !coursesRes.data?.length) {
        // Crear un curso de prueba automáticamente si no hay
        await createCourse({
          name: "Curso de Prueba " + Math.floor(Math.random() * 100),
          gradeLevelId: firstGrade.id,
          hoursPerWeek: 4,
          active: true,
        });
        coursesRes = await getCoursesByGradeLevel(firstGrade.id);
      }
      if (!coursesRes.success || !coursesRes.data?.length) {
        throw new Error(
          "No hay cursos en el primer grado ni se pudo crear uno",
        );
      }

      const courseId = coursesRes.data[0].id;

      const studentsRes = await getGradesBySection(sectionId, courseId, "P1");
      if (!studentsRes.success || !studentsRes.data?.length)
        throw new Error("No hay alumnos matriculados en esta sección");

      const res = await saveGrades({
        sectionId,
        courseId,
        period: "P1",
        grades: (studentsRes.data ?? []).map((s: any) => ({
          enrollmentId: s.enrollmentId,
          score: Math.floor(Math.random() * 21), // Nota aleatoria 0-20
        })),
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // --- Asistencia ---
  const handleTestGetAttendanceBySection = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const sectionId = structureRes.data.levels[0].grades[0].sections[0].id;
      // Usamos fecha de prueba dentro del año 2026
      const testDate = new Date("2026-04-01T12:00:00");

      const res = await getAttendanceBySection(sectionId, testDate);
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSaveAttendance = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const sectionId = structureRes.data.levels[0].grades[0].sections[0].id;

      // Usamos una fecha que sabemos que cae dentro del año escolar creado en pruebas (ej. 1 de abril de 2026)
      const testDate = new Date("2026-04-01T12:00:00");

      const attendanceRes = await getAttendanceBySection(sectionId, testDate);
      if (!attendanceRes.success || !attendanceRes.data?.length)
        throw new Error("No hay alumnos en la sección");

      const records = (attendanceRes.data ?? [])
        .slice(0, 5)
        .map((student: any) => ({
          enrollmentId: student.enrollmentId,
          date: testDate,
          status: [
            "PRESENTE",
            "TARDANZA",
            "FALTA_JUSTIFICADA",
            "FALTA_INJUSTIFICADA",
          ][Math.floor(Math.random() * 4)] as any,
        }));

      const res = await saveAttendance({ records });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestGetAttendanceStats = async () => {
    setLoading(true);
    try {
      const enrollmentsRes = await getEnrollments({ limit: 1 });
      if (!enrollmentsRes.success || !enrollmentsRes.data?.length)
        throw new Error("No hay matrículas");

      const enrollmentId = (enrollmentsRes.data as any[])[0].id;
      const res = await getAttendanceStats(enrollmentId);
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestGetCriticalAttendance = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const sectionId = structureRes.data.levels[0].grades[0].sections[0].id;
      const res = await getCriticalAttendance({ sectionId });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestGetSectionAttendanceReport = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const sectionId = structureRes.data.levels[0].grades[0].sections[0].id;
      // Usamos fecha de prueba dentro del año 2026
      const testDate = new Date("2026-04-01T12:00:00");

      const res = await getSectionAttendanceReport({
        sectionId,
        month: testDate.getMonth() + 1,
        year: testDate.getFullYear(),
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // --- Pagos ---
  const handleTestGenerateMonthlyPayments = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica");

      const academicYearId = structureRes.data.id;
      // Generar pagos para este mes
      const res = await generateMonthlyPayments(academicYearId, new Date());
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestVerPagos = async () => {
    setLoading(true);
    try {
      const enrollmentsRes = await getEnrollments({ limit: 1 });
      if (!enrollmentsRes.success || !enrollmentsRes.data?.length)
        throw new Error("No hay matrículas");

      const enrollmentId = (enrollmentsRes.data as any[])[0].id;
      const res = await getPaymentsByEnrollment(enrollmentId);
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestPagar = async () => {
    setLoading(true);
    try {
      const enrollmentsRes = await getEnrollments({ limit: 1 });
      if (!enrollmentsRes.success || !enrollmentsRes.data?.length)
        throw new Error("No hay matrículas apuntadas");

      const enrollmentId = (enrollmentsRes.data as any[])[0].id;

      // Buscar si tiene pagos pendientes
      const paymentsRes = await getPaymentsByEnrollment(enrollmentId);
      if (!paymentsRes.success || !paymentsRes.data?.length)
        throw new Error(
          "No hay cobros generados para el primer estudiante. Intenta generar mensualidades primero.",
        );

      const pendingPayment = paymentsRes.data.find(
        (p) => p.status === "PENDIENTE",
      );
      if (!pendingPayment)
        throw new Error("El estudiante no tiene pagos pendientes por abonar.");

      const res = await registerPayment({
        paymentId: pendingPayment.id,
        method: "EFECTIVO",
        notes: "Pago de prueba abonado por taquilla principal",
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // --- Disciplina E Incidencias ---
  const handleTestCreateIncident = async () => {
    setLoading(true);
    try {
      const enrollmentsRes = await getEnrollments({ limit: 1 });
      if (!enrollmentsRes.success || !enrollmentsRes.data?.length)
        throw new Error("No hay matrículas");

      const enrollmentId = (enrollmentsRes.data as any[])[0].id;
      const res = await createIncident({
        enrollmentId,
        date: new Date(),
        description:
          "El estudiante llegó 30 minutos tarde e interrumpió la clase.",
        severity: "LEVE",
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestInhabilitarEstudiante = async () => {
    setLoading(true);
    try {
      const enrollmentsRes = await getEnrollments({ limit: 1 });
      if (!enrollmentsRes.success || !enrollmentsRes.data?.length)
        throw new Error("No hay matrículas");

      const enrollmentId = (enrollmentsRes.data as any[])[0].id;
      const res = await createDisability({
        enrollmentId,
        reason: "DISCIPLINA",
        description:
          "Inhabilitado por indisciplina recurrente, pendiente reunión con padres.",
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestResolverInhabilitacion = async () => {
    setLoading(true);
    try {
      const activeRes = await getActiveDisabilities();
      if (!activeRes.success || !activeRes.data?.length)
        throw new Error("No hay estudiantes inhabilitados actualmente");

      const disabilityId = activeRes.data[0].id;
      const res = await resolveDisability({
        id: disabilityId,
        resolvedNote: "Compromiso disciplinario firmado por los padres.",
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // --- Global (Calendario y Anuncios) ---
  const handleTestCrearFeriado = async () => {
    setLoading(true);
    try {
      const structureRes = await getAcademicStructure();
      if (!structureRes.success || !structureRes.data)
        throw new Error("No hay estructura académica (año creado)");

      const academicYearId = structureRes.data.id;
      const res = await createCalendarEvent({
        title: "Día del Trabajador",
        date: new Date("2026-05-01T00:00:00"),
        type: "FERIADO",
        academicYearId,
        allDay: true,
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestCrearAnuncio = async () => {
    setLoading(true);
    try {
      const res = await createAnnouncement({
        title: "Día del Logro",
        body: "Estimados padres de familia, están cordialmente invitados a nuestro Día del Logro este fin de mes. La asistencia es obligatoria.",
        targetLevel: null, // Global
      });
      setResults(res);
    } catch (error) {
      setResults({ success: false, error: String(error) });
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
          <TabsTrigger value="grades">Notas</TabsTrigger>
          <TabsTrigger value="attendance">Asistencia</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="disciplina">Disciplina</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>

        <TabsContent value="grades" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestGetGradesBySection} disabled={loading}>
              Ver Notas (Secc/Curso/P1)
            </Button>
            <Button
              onClick={handleTestSaveBatchGrades}
              variant="secondary"
              disabled={loading}
            >
              Simular Carga Batch (Notas Aleatorias)
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                try {
                  const structureRes = await getAcademicStructure();
                  if (!structureRes.success || !structureRes.data)
                    throw new Error("No hay estructura académica");

                  const firstGrade = structureRes.data.levels[0].grades[0];
                  const sectionId = firstGrade.sections[0].id;

                  const res = await getSectionGradeReport(sectionId, "P1");
                  setResults(res);
                } catch (error) {
                  setResults({ success: false, error: String(error) });
                } finally {
                  setLoading(false);
                }
              }}
              variant="outline"
              disabled={loading}
            >
              Reporte de Sección
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Al cargar notas, se recalculan automáticamente las notas finales y
            el estado (semáforo) del estudiante.
          </p>
        </TabsContent>

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
            <Button
              onClick={handleTestCleanAndCreate2026}
              disabled={loading}
              variant="secondary"
            >
              Limpiar y Crear Año 2026
            </Button>
            <Button
              onClick={handleTestDebugAcademicYear}
              disabled={loading}
              variant="outline"
            >
              Debug: Estado del Año Activo
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

        <TabsContent value="attendance" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button
              onClick={handleTestGetAttendanceBySection}
              disabled={loading}
            >
              Ver Asistencia (Hoy/Sección)
            </Button>
            <Button
              onClick={handleTestSaveAttendance}
              variant="secondary"
              disabled={loading}
            >
              Simular Carga Batch (Asistencias)
            </Button>
            <Button
              onClick={handleTestGetAttendanceStats}
              variant="outline"
              disabled={loading}
            >
              Estadísticas Alumno
            </Button>
            <Button
              onClick={handleTestGetCriticalAttendance}
              variant="outline"
              disabled={loading}
            >
              Asistencia Crítica
            </Button>
            <Button
              onClick={handleTestGetSectionAttendanceReport}
              variant="outline"
              disabled={loading}
            >
              Reporte Mensual
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Al guardar asistencia, se recalcula automáticamente el estado
            (semáforo) del estudiante. Los días festivos se excluyen del
            cálculo.
          </p>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button
              onClick={handleTestGenerateMonthlyPayments}
              disabled={loading}
            >
              Autogenerar Mes Actual
            </Button>
            <Button
              onClick={handleTestVerPagos}
              variant="secondary"
              disabled={loading}
            >
              Revisar Cuenta del Estudiante
            </Button>
            <Button
              onClick={handleTestPagar}
              variant="outline"
              disabled={loading}
            >
              Registrar Cobro (PAGADO)
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                const td = new Date();
                const res = await getFinancialSummary(
                  td.getMonth() + 1,
                  td.getFullYear(),
                );
                setResults(res);
                setLoading(false);
              }}
              variant="outline"
              disabled={loading}
            >
              Resumen Financiero del Mes
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * 'Registrar Cobro' toma el primer concepto pendiente de la tarjeta
            de cuenta y le asigna número de factura correlativo temporal.
          </p>
        </TabsContent>

        <TabsContent value="disciplina" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestCreateIncident} disabled={loading}>
              Crear Incidente Disciplinario
            </Button>
            <Button
              onClick={handleTestInhabilitarEstudiante}
              variant="destructive"
              disabled={loading}
            >
              Inhabilitar Estudiante
            </Button>
            <Button
              onClick={handleTestResolverInhabilitacion}
              variant="secondary"
              disabled={loading}
            >
              Resolver Inhabilitación
            </Button>
          </div>
          <p className="text-xs text-muted-foreground italic">
            * Inhabilitar a un alumno cambia automáticamente su estado a
            INHABILITADO limitando accesos y reportes. Resolverlo lo recalcula
            en base a sus notas y faltas.
          </p>
        </TabsContent>

        <TabsContent value="global" className="space-y-4 py-4">
          <div className="flex gap-4">
            <Button onClick={handleTestCrearAnuncio} disabled={loading}>
              Publicar Comunicado General
            </Button>
            <Button
              onClick={handleTestCrearFeriado}
              variant="secondary"
              disabled={loading}
            >
              Crear Feriado Global
            </Button>
            <Button
              onClick={() => handleTest(() => getAnnouncements())}
              variant="outline"
              disabled={loading}
            >
              Listar Comunicados
            </Button>
            <Button
              onClick={async () => {
                setLoading(true);
                const s = await getAcademicStructure();
                if (!s.success || !s.data) {
                  setResults({ error: "Primero crea el año académico 2026." });
                  setLoading(false);
                  return;
                }
                const res = await getHolidayDates(s.data.id);
                setResults(res);
                setLoading(false);
              }}
              variant="outline"
              disabled={loading}
            >
              Extraer Fechas de Feriados
            </Button>
          </div>
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
