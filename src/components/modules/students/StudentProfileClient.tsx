"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, User, Calendar, BookOpen, CheckSquare, CreditCard, ShieldAlert } from "lucide-react";

import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiptModal } from "@/components/modules/payments/ReceiptModal";
import { ReceiptData } from "@/lib/actions/payment.actions";

import { StudentProfileResult } from "@/lib/actions/student.actions";
import { useStudentProfile } from "./hooks/useStudentProfile";
import { ProfilePersonalTab } from "./_components/ProfilePersonalTab";
import { ProfileGuardiansTab } from "./_components/ProfileGuardiansTab";
import { ProfileGradesTab } from "./_components/ProfileGradesTab";
import { ProfileAttendanceTab } from "./_components/ProfileAttendanceTab";
import { ProfilePaymentsTab } from "./_components/ProfilePaymentsTab";
import { ProfileIncidentsTab } from "./_components/ProfileIncidentsTab";

export function StudentProfileClient({ student }: { student: StudentProfileResult }) {
  const router = useRouter();
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  useEffect(() => {
    toast.dismiss();
  }, []);

  const {
    currentEnrollment,
    gradeLevel,
    gradesByCourse,
    attendanceStats,
    sortedPayments,
  } = useStudentProfile(student);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-slate-500 hover:text-slate-900">
            <Link href="/dashboard/estudiantes">
               <ArrowLeft className="h-4 w-4 mr-2" />
               Volver al directorio
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-slate-900">Perfil del Estudiante</h1>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" onClick={() => toast.info("Edición en construcción")}>
             Editar Perfil
           </Button>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <CardContent className="pt-0 relative px-6 sm:px-10">
          <div className="flex flex-col sm:flex-row gap-6 mt-[-40px] items-center sm:items-end">
            <div className="rounded-full border-4 border-white bg-white shadow-md">
              <StudentAvatar
                name={`${student.firstName} ${student.lastName}`}
                className="w-24 h-24 sm:w-32 sm:h-32 text-2xl"
              />
            </div>
            <div className="flex-1 text-center sm:text-left pb-4">
               <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                 <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                   {student.firstName} {student.lastName}
                 </h2>
                 <StatusBadge status={student.status} />
               </div>
               <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-slate-600 font-medium">
                 {student.code && <Badge variant="secondary" className="font-mono bg-slate-100 text-slate-700">Cód: {student.code}</Badge>}
                 <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">
                    {gradeLevel ? `${gradeLevel.name} - Sec. ${currentEnrollment?.section?.name}` : "Sin Matrícula Activa"}
                 </Badge>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABS */}
      <Tabs defaultValue="datos" className="w-full">
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-6 overflow-x-auto">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-1 min-w-max">
            <TabsTrigger value="datos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 px-4 xl:px-6">
               <User className="h-4 w-4 mr-2" />
               Identidad
            </TabsTrigger>
            <TabsTrigger value="apoderados" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 px-4 xl:px-6">
               <Calendar className="h-4 w-4 mr-2" />
               Apoderados
            </TabsTrigger>
            <TabsTrigger value="notas" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 px-4 xl:px-6">
               <BookOpen className="h-4 w-4 mr-2" />
               Notas
            </TabsTrigger>
            <TabsTrigger value="asistencia" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 px-4 xl:px-6">
               <CheckSquare className="h-4 w-4 mr-2" />
               Asistencia
            </TabsTrigger>
            <TabsTrigger value="pagos" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 py-3 px-4 xl:px-6">
               <CreditCard className="h-4 w-4 mr-2" />
               Pagos
            </TabsTrigger>
            <TabsTrigger value="incidencias" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 py-3 px-4 xl:px-6">
               <ShieldAlert className="h-4 w-4 mr-2 text-red-500" />
               <span className="text-red-600">Incidencias</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="datos" className="mt-0">
          <ProfilePersonalTab student={student} />
        </TabsContent>

        <TabsContent value="apoderados" className="mt-0">
          <ProfileGuardiansTab student={student} />
        </TabsContent>

        <TabsContent value="notas" className="mt-0">
          <ProfileGradesTab gradesByCourse={gradesByCourse} />
        </TabsContent>

        <TabsContent value="asistencia" className="mt-0">
          <ProfileAttendanceTab attendances={currentEnrollment?.attendances || []} attendanceStats={attendanceStats} />
        </TabsContent>

        <TabsContent value="pagos" className="mt-0">
          <ProfilePaymentsTab sortedPayments={sortedPayments} onReceiptClick={setSelectedReceipt} />
        </TabsContent>

        <TabsContent value="incidencias" className="mt-0">
          <ProfileIncidentsTab disqualifications={currentEnrollment?.disabilities || []} incidents={currentEnrollment?.incidents || []} />
        </TabsContent>
      </Tabs>

      <ReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </div>
  );
}
