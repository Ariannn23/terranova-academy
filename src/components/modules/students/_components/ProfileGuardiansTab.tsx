import { StudentProfileResult } from "@/lib/actions/student.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert } from "lucide-react";

export function ProfileGuardiansTab({ student }: { student: StudentProfileResult }) {
  if (!student.guardians || student.guardians.length === 0) {
    return (
      <p className="text-slate-400 text-sm italic text-center py-6">
        No hay apoderados registrados
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {student.guardians.map((guard) => {
        return (
          <Card key={guard.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    {guard.firstName} {guard.lastName}
                  </h4>
                  <p className="text-sm text-slate-500 capitalize">
                    {guard.relation?.toLowerCase() || "apoderado"}
                  </p>
                </div>
                {guard.isPrimary && (
                  <Badge variant="secondary" className="bg-red-50 text-red-700">
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Principal
                  </Badge>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">DNI</span>
                  <span className="font-medium">{guard.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono</span>
                  <span className="font-medium">{guard.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email</span>
                  <span className="font-medium truncate max-w-[150px]">
                    {guard.email}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
