import { StudentProfileResult } from "@/lib/actions/student.actions";
import { Card, CardContent } from "@/components/ui/card";
import { User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function ProfilePersonalTab({ student }: { student: StudentProfileResult }) {
  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <User className="h-4 w-4" /> Datos de Identidad
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Tipo Documento</p>
                <p className="font-medium text-slate-900">DNI</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Número</p>
                <p className="font-medium text-slate-900">{student.dni}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Nacimiento
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-400">Fecha</p>
                <p className="font-medium text-slate-900">
                  {student.birthDate
                    ? format(new Date(student.birthDate), "dd/MM/yyyy")
                    : "No registrada"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Género</p>
                <p className="font-medium text-slate-900">
                  {student.gender === "M" ? "Masculino" : "Femenino"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-slate-400 mb-1">Domicilio</p>
            <p className="font-medium text-slate-900">{student.address}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">Dato Médico / Alergias</p>
            <p className="font-medium text-slate-900">
              {(student as any).medicalInfo || "Ninguno"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
