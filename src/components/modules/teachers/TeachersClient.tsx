"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit2, BookOpen, Clock } from "lucide-react";
import { TeacherForm } from "./TeacherForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { StudentAvatar } from "@/components/shared/StudentAvatar";
import { Badge } from "@/components/ui/badge";
import { updateTeacher } from "@/lib/actions/teacher.actions";
import { toast } from "sonner";

export function TeachersClient({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const filteredTeachers = initialData.filter((t) =>
    `${t.firstName} ${t.lastName} ${t.dni} ${t.specialty || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  const handleEdit = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedTeacher(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio de Docentes"
        description="Gestiona la plana docente, sus especialidades y carga académica."
        action={
          <Button
            onClick={handleCreate}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Plus className="mr-2 h-4 w-4" /> Nuevo Docente
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre, DNI o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTeachers.map((teacher) => (
          <Card
            key={teacher.id}
            className="overflow-hidden hover:shadow-md transition-shadow relative group"
          >
            {!teacher.active && (
              <div className="absolute top-3 left-3 z-[5] pointer-events-none">
                <Badge variant="destructive">Inactivo</Badge>
              </div>
            )}

            <CardHeader className="pb-4 pt-6 flex flex-col items-center border-b border-slate-100 bg-slate-50 relative">
              <div className="absolute top-2 right-2 flex gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                  title="Editar Docente"
                  onClick={() => handleEdit(teacher)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>

              <StudentAvatar
                name={`${teacher.firstName} ${teacher.lastName}`}
                imageUrl={teacher.photoUrl}
                size="lg"
                className="mb-3 border-4 border-white shadow-sm"
              />
              <div className="text-center">
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-1">
                  {teacher.specialty || "Sin especialidad definida"}
                </p>
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="text-sm text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-[60px]">DNI:</span>
                  <span className="text-slate-900">{teacher.dni}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium min-w-[60px]">Email:</span>
                  <span
                    className="text-slate-900 truncate"
                    title={teacher.email}
                  >
                    {teacher.email}
                  </span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium min-w-[60px]">Teléf:</span>
                    <span className="text-slate-900">{teacher.phone}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50 border-t p-4 flex justify-between text-xs text-slate-500 font-medium">
              <div
                className="flex items-center gap-1.5"
                title="Secciones Principales (Tutoría)"
              >
                <BookOpen className="h-4 w-4 text-emerald-600" />
                {teacher._count?.sections || 0} Secciones
              </div>
              <div
                className="flex items-center gap-1.5"
                title="Bloques de Horario Dictados"
              >
                <Clock className="h-4 w-4 text-blue-600" />
                {teacher._count?.schedules || 0} Bloques
              </div>
            </CardFooter>
          </Card>
        ))}

        {filteredTeachers.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed">
            No se encontraron docentes con ese término de búsqueda.
          </div>
        )}
      </div>

      <TeacherForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={selectedTeacher}
      />
    </div>
  );
}
