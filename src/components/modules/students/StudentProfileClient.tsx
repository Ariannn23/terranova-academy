"use client";

import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  AlertTriangle,
  ShieldAlert,
  Calendar,
  BookOpen,
  CheckSquare,
  CreditCard,
  User,
  FileDown,
  Receipt,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ReceiptModal } from "@/components/modules/payments/ReceiptModal";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// ─── helpers ────────────────────────────────────────────────────────────────

const PERIOD_LABELS: Record<string, string> = {
  P1: "Período 1",
  P2: "Período 2",
  P3: "Período 3",
  P4: "Período 4",
  FINAL: "Final",
};

const ATTENDANCE_LABELS: Record<string, { label: string; color: string }> = {
  PRESENTE: { label: "Presente", color: "bg-emerald-100 text-emerald-700" },
  TARDANZA: { label: "Tardanza", color: "bg-yellow-100 text-yellow-700" },
  FALTA_JUSTIFICADA: {
    label: "Justificada",
    color: "bg-blue-100 text-blue-700",
  },
  FALTA_INJUSTIFICADA: {
    label: "Injustificada",
    color: "bg-red-100 text-red-700",
  },
};

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  PAGADO: {
    label: "Pagado",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  VENCIDO: {
    label: "Vencido",
    color: "bg-red-100 text-red-700 border-red-200",
  },
  ANULADO: {
    label: "Anulado",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-slate-400 text-sm italic text-center py-6">{message}</p>
  );
}

// ─── componente principal ────────────────────────────────────────────────────

export function StudentProfileClient({ student }: { student: any }) {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    toast.dismiss();
  }, []);

  const currentEnrollment = student.enrollments?.[0];
  const gradeLevel = currentEnrollment?.section?.gradeLevel;

  // ── Notas: agrupar por curso ──────────────────────────────────────────────
  const gradesByCourse: Record<string, { courseName: string; grades: any[] }> =
    {};
  if (currentEnrollment?.gradeRecords) {
    for (const gr of currentEnrollment.gradeRecords) {
      if (!gradesByCourse[gr.courseId]) {
        gradesByCourse[gr.courseId] = {
          courseName: gr.course.name,
          grades: [],
        };
      }
      gradesByCourse[gr.courseId].grades.push(gr);
    }
  }

  // ── Asistencia: estadísticas rápidas ─────────────────────────────────────
  const attendances: any[] = currentEnrollment?.attendances ?? [];
  const attendanceStats = {
    total: attendances.length,
    presente: attendances.filter((a) => a.status === "PRESENTE").length,
    tardanza: attendances.filter((a) => a.status === "TARDANZA").length,
    justificada: attendances.filter((a) => a.status === "FALTA_JUSTIFICADA")
      .length,
    injustificada: attendances.filter((a) => a.status === "FALTA_INJUSTIFICADA")
      .length,
  };

  // ── Pagos ─────────────────────────────────────────────────────────────────
  const payments: any[] = currentEnrollment?.payments ?? [];

  return (
    <div className="space-y-6">
      {/* Header nav */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" asChild className="text-slate-500">
          <Link href="/dashboard/estudiantes">
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Directorio
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          {currentEnrollment && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs"
                onClick={() =>
                  window.open(
                    `/api/pdf?type=grades&id=${currentEnrollment.id}`,
                    "_blank",
                  )
                }
              >
                <FileDown className="h-3.5 w-3.5" />
                Libreta PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-blue-700 border-blue-200 hover:bg-blue-50 text-xs"
                onClick={() =>
                  window.open(
                    `/api/pdf?type=enrollment&id=${currentEnrollment.id}`,
                    "_blank",
                  )
                }
              >
                <FileDown className="h-3.5 w-3.5" />
                Constancia PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-orange-700 border-orange-200 hover:bg-orange-50 text-xs"
                onClick={() =>
                  window.open(
                    `/api/pdf?type=student-attendance&id=${currentEnrollment.id}`,
                    "_blank",
                  )
                }
              >
                <FileDown className="h-3.5 w-3.5" />
                Asistencia PDF
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-slate-700 border-slate-200 hover:bg-slate-50 text-xs"
            onClick={() =>
              window.open(`/api/pdf?type=student&id=${student.id}`, "_blank")
            }
          >
            <User className="h-3.5 w-3.5" />
            Ficha PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              toast.loading("Cargando formulario de edición...", {
                id: "edit-student",
              });
              router.push(`/dashboard/estudiantes/${student.id}/editar`);
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Editar Perfil
          </Button>
        </div>
      </div>

      {/* Hero card */}
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
                  <span>
                    <strong>Cód:</strong> {student.code}
                  </span>
                )}
                <span>
                  <strong>DNI:</strong> {student.dni}
                </span>
                {gradeLevel ? (
                  <span>
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

      {/* Tabs */}
      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="bg-slate-100/50 p-1 w-full justify-start overflow-x-auto">
          <TabsTrigger value="datos">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Datos Personales
          </TabsTrigger>
          <TabsTrigger value="apoderado">Apoderados</TabsTrigger>
          <TabsTrigger value="notas">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Notas
          </TabsTrigger>
          <TabsTrigger value="asistencia">
            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
            Asistencia
          </TabsTrigger>
          <TabsTrigger value="pagos">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="incidencias">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Incidencias
          </TabsTrigger>
        </TabsList>

        {/* ── Datos Personales ── */}
        <TabsContent value="datos" className="mt-2">
          <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Información del Estudiante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-slate-500 mb-1">Fecha de Nacimiento</p>
                <p className="font-medium text-slate-900">
                  {format(new Date(student.birthDate), "dd 'de' MMMM, yyyy", {
                    locale: es,
                  })}
                </p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Género</p>
                <p className="font-medium text-slate-900">
                  {student.gender === "M" ? "Masculino" : "Femenino"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-slate-500 mb-1">Dirección de Residencia</p>
                <p className="font-medium text-slate-900">
                  {student.address || "No registrada"}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Apoderados ── */}
        <TabsContent value="apoderado" className="mt-2">
          <div className="p-6 bg-white rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">
              Apoderados Registrados
            </h3>
            {student.guardians?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {student.guardians.map((g: any) => (
                  <div
                    key={g.id}
                    className="p-4 border rounded-lg border-slate-100 flex gap-4 items-start"
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
                        <p className="text-sm text-slate-600">
                          Email: {g.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No hay apoderados registrados." />
            )}
          </div>
        </TabsContent>

        {/* ── Notas ── */}
        <TabsContent value="notas" className="mt-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">
                Registro de Notas
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Año lectivo activo · Nota mínima de aprobación: 11
              </p>
            </div>
            {Object.keys(gradesByCourse).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 font-semibold text-slate-600">
                        Curso
                      </th>
                      {["P1", "P2", "P3", "P4", "FINAL"].map((p) => (
                        <th
                          key={p}
                          className="text-center px-3 py-3 font-semibold text-slate-600 w-20"
                        >
                          {PERIOD_LABELS[p]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(gradesByCourse).map(
                      ({ courseName, grades }) => {
                        const byPeriod: Record<string, any> = {};
                        grades.forEach((g) => {
                          byPeriod[g.period] = g;
                        });
                        const p1 = byPeriod["P1"]?.score;
                        const p2 = byPeriod["P2"]?.score;
                        const p3 = byPeriod["P3"]?.score;
                        const p4 = byPeriod["P4"]?.score;
                        const validScores = [p1, p2, p3, p4].filter(
                          (s) => s != null,
                        );
                        const avg = validScores.length
                          ? (
                              validScores.reduce((a, b) => a + b, 0) /
                              validScores.length
                            ).toFixed(1)
                          : null;

                        return (
                          <tr
                            key={courseName}
                            className="border-b border-slate-50 hover:bg-slate-50/50"
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {courseName}
                            </td>
                            {["P1", "P2", "P3", "P4"].map((p) => {
                              const score = byPeriod[p]?.score;
                              return (
                                <td key={p} className="px-3 py-3 text-center">
                                  {score != null ? (
                                    <span
                                      className={`font-bold ${score >= 11 ? "text-emerald-600" : "text-red-500"}`}
                                    >
                                      {score}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">—</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-3 py-3 text-center">
                              {avg != null ? (
                                <span
                                  className={`font-bold px-2 py-0.5 rounded text-xs ${Number(avg) >= 11 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                                >
                                  {avg}
                                </span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      },
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState message="No hay notas registradas para el año lectivo activo." />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Asistencia ── */}
        <TabsContent value="asistencia" className="mt-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Registro de Asistencia
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Últimos 60 registros del año lectivo activo
                </p>
              </div>
            </div>

            {attendances.length > 0 ? (
              <>
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
                  {[
                    {
                      label: "Presentes",
                      value: attendanceStats.presente,
                      color: "text-emerald-600",
                    },
                    {
                      label: "Tardanzas",
                      value: attendanceStats.tardanza,
                      color: "text-yellow-600",
                    },
                    {
                      label: "Justificadas",
                      value: attendanceStats.justificada,
                      color: "text-blue-600",
                    },
                    {
                      label: "Injustificadas",
                      value: attendanceStats.injustificada,
                      color: "text-red-600",
                    },
                  ].map((s) => (
                    <div key={s.label} className="bg-white p-4 text-center">
                      <p className={`text-2xl font-bold ${s.color}`}>
                        {s.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Lista */}
                <div className="divide-y divide-slate-50">
                  {attendances.map((a: any) => {
                    const info = ATTENDANCE_LABELS[a.status] ?? {
                      label: a.status,
                      color: "bg-slate-100 text-slate-600",
                    };
                    return (
                      <div
                        key={a.id}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/50"
                      >
                        <span className="text-sm text-slate-700">
                          {format(new Date(a.date), "EEEE dd 'de' MMMM", {
                            locale: es,
                          })}
                        </span>
                        <div className="flex items-center gap-3">
                          {a.justification && (
                            <span
                              className="text-xs text-slate-400 max-w-[160px] truncate"
                              title={a.justification}
                            >
                              {a.justification}
                            </span>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.color}`}
                          >
                            {info.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="p-6">
                <EmptyState message="No hay registros de asistencia para el año lectivo activo." />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Pagos ── */}
        <TabsContent value="pagos" className="mt-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-800">
                Historial de Pagos
              </h3>
            </div>
            {payments.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {payments.map((p: any) => {
                  const ps = PAYMENT_STATUS[p.status] ?? {
                    label: p.status,
                    color: "bg-slate-100 text-slate-500 border-slate-200",
                  };
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {p.concept?.name ?? "Concepto"}
                        </p>
                        <p className="text-xs text-slate-400">
                          Vence:{" "}
                          {format(new Date(p.dueDate), "dd MMM yyyy", {
                            locale: es,
                          })}
                          {p.paidAt &&
                            ` · Pagado: ${format(new Date(p.paidAt), "dd MMM yyyy", { locale: es })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-800">
                          S/ {p.amount.toFixed(2)}
                        </span>
                        <Badge className={`text-xs border ${ps.color}`}>
                          {ps.label}
                        </Badge>
                        {p.status === "PAGADO" && (
                          <button
                            title="Descargar recibo"
                            onClick={() => {
                              // Asegurarnos de tener enrollment adjunto para el render del recibo
                              const receiptData = {
                                ...p,
                                enrollment: currentEnrollment,
                              };
                              setSelectedReceipt(receiptData);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState message="No hay pagos registrados para el año lectivo activo." />
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Incidencias ── */}
        <TabsContent value="incidencias" className="mt-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h3 className="text-base font-semibold text-slate-800">
                Historial Disciplinario
              </h3>
            </div>

            <div className="p-4 space-y-6">
              {/* Inhabilitaciones */}
              <div>
                <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />{" "}
                  Inhabilitaciones
                </h4>
                {currentEnrollment?.disabilities?.length > 0 ? (
                  <div className="space-y-3">
                    {currentEnrollment.disabilities.map((d: any) => (
                      <div
                        key={d.id}
                        className={`p-4 rounded-lg border text-sm ${d.active ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold flex items-center gap-2">
                            {d.reason.replace("_", " ")}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full text-white ${d.active ? "bg-red-600" : "bg-emerald-600"}`}
                            >
                              {d.active ? "VIGENTE" : "RESUELTA"}
                            </span>
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(d.startDate), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600">{d.description}</p>
                        {!d.active && d.resolvedNote && (
                          <div className="mt-2 text-xs border border-emerald-100 bg-white rounded p-2 text-emerald-700">
                            <strong>Resolución:</strong> {d.resolvedNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No registra inhabilitaciones en el año actual." />
                )}
              </div>

              {/* Incidencias */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-semibold text-slate-700 text-sm mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />{" "}
                  Incidencias
                </h4>
                {currentEnrollment?.incidents?.length > 0 ? (
                  <div className="space-y-3">
                    {currentEnrollment.incidents.map((inc: any) => (
                      <div
                        key={inc.id}
                        className="p-4 rounded-lg border border-slate-200 bg-white text-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-xs ${
                              inc.severity === "GRAVE"
                                ? "bg-red-100 text-red-700"
                                : inc.severity === "MODERADO"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {inc.severity}
                          </span>
                          <span className="text-slate-500 text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(inc.date), "dd MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600">{inc.description}</p>
                        {inc.action && (
                          <p className="mt-1 text-xs text-slate-500">
                            <strong>Acción:</strong> {inc.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="No registra incidencias disciplinarias." />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
        successTitle="Comprobante de Pago"
      />
    </div>
  );
}
