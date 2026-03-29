import { AttendanceStatus } from "@prisma/client";
import { StudentAttendanceInput } from "@/lib/validations/attendance.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceStudentRowProps {
  student: StudentAttendanceInput;
  index: number;
  handleStatusChange: (id: string, status: AttendanceStatus) => void;
  setStudents: React.Dispatch<React.SetStateAction<StudentAttendanceInput[]>>;
}

export function AttendanceStudentRow({
  student,
  index,
  handleStatusChange,
  setStudents
}: AttendanceStudentRowProps) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4 text-slate-400 font-mono">
        {(index + 1).toString().padStart(2, "0")}
      </td>
      <td className="px-6 py-4 font-medium text-slate-700">
        <span className="block">{student.studentName}</span>
        <span className="text-xs text-slate-400 font-normal">
          DNI: {student.studentDni}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center justify-center gap-2">
          {/* Botón Presente */}
          <Button
            variant={student.status === AttendanceStatus.PRESENTE ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange(student.enrollmentId, AttendanceStatus.PRESENTE)}
            className={cn(
              "w-32",
              student.status === AttendanceStatus.PRESENTE
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "text-slate-500 hover:border-emerald-300 hover:text-emerald-700 bg-white"
            )}
          >
            <Check className="h-4 w-4 mr-2" /> Presente
          </Button>

          {/* Botón Tardanza */}
          <Button
            variant={student.status === AttendanceStatus.TARDANZA ? "default" : "outline"}
            size="sm"
            onClick={() => handleStatusChange(student.enrollmentId, AttendanceStatus.TARDANZA)}
            className={cn(
              "w-32",
              student.status === AttendanceStatus.TARDANZA
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "text-slate-500 hover:border-amber-300 hover:text-amber-600 bg-white"
            )}
          >
            <Clock className="h-4 w-4 mr-2" /> Tardanza
          </Button>

          {/* Botón Falta */}
          <Button
            variant={
              student.status === AttendanceStatus.FALTA_INJUSTIFICADA ||
              student.status === AttendanceStatus.FALTA_JUSTIFICADA
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() =>
              handleStatusChange(student.enrollmentId, AttendanceStatus.FALTA_INJUSTIFICADA)
            }
            className={cn(
              "w-32",
              student.status === AttendanceStatus.FALTA_INJUSTIFICADA ||
              student.status === AttendanceStatus.FALTA_JUSTIFICADA
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "text-slate-500 hover:border-red-300 hover:text-red-600 bg-white"
            )}
          >
            <X className="h-4 w-4 mr-2" /> Falta
          </Button>
        </div>
        
        {(student.status === AttendanceStatus.FALTA_INJUSTIFICADA ||
          student.status === AttendanceStatus.FALTA_JUSTIFICADA) && (
          <div className="mt-2 flex items-center gap-2 animate-in slide-in-from-top-1">
            <Input
              placeholder={
                student.status === AttendanceStatus.FALTA_INJUSTIFICADA
                  ? "Falta sin justificación"
                  : "Nota de falta (ej. Salud, Motivo personal...)"
              }
              value={student.justification || ""}
              disabled={student.status === AttendanceStatus.FALTA_INJUSTIFICADA}
              onChange={(e) => {
                const val = e.target.value;
                setStudents((prev) =>
                  prev.map((s) =>
                    s.enrollmentId === student.enrollmentId
                      ? { ...s, justification: val }
                      : s
                  )
                );
              }}
              className={cn(
                "text-xs h-8 border-red-100 focus-visible:ring-red-200",
                student.status === AttendanceStatus.FALTA_INJUSTIFICADA
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-white"
              )}
            />
            <Badge
              variant="outline"
              className={cn(
                "cursor-pointer whitespace-nowrap text-[10px]",
                student.status === AttendanceStatus.FALTA_JUSTIFICADA
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-50 text-slate-500 border-slate-200"
              )}
              onClick={() => {
                const nextStatus =
                  student.status === AttendanceStatus.FALTA_JUSTIFICADA
                    ? AttendanceStatus.FALTA_INJUSTIFICADA
                    : AttendanceStatus.FALTA_JUSTIFICADA;
                handleStatusChange(student.enrollmentId, nextStatus);
              }}
            >
              {student.status === AttendanceStatus.FALTA_JUSTIFICADA ? "Justificada" : "Injustificada"}
            </Badge>
          </div>
        )}
      </td>
    </tr>
  );
}
