"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Search, ArrowLeft, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { searchStudentsForPayment } from "@/lib/actions/payments.actions";
import { createDisability } from "@/lib/actions/disability.actions";
import { DisabilitySchema } from "@/lib/validations/incident.schema";

export function RegisterDisabilityClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [activeEnrollment, setActiveEnrollment] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof DisabilitySchema>>({
    resolver: zodResolver(DisabilitySchema),
    defaultValues: {
      enrollmentId: "",
      reason: "DISCIPLINA",
      description: "",
    },
  });

  // ========== SEARCH LOGIC ==========
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 3) {
        setIsSearching(true);
        const res = await searchStudentsForPayment(searchTerm);
        if (res.success) {
          setSearchResults(res.data || []);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearchTerm("");
    setSearchResults([]);

    if (student.enrollments && student.enrollments.length > 0) {
      const enrollment = student.enrollments[0];
      setActiveEnrollment(enrollment);
      form.setValue("enrollmentId", enrollment.id);
    } else {
      setActiveEnrollment(null);
      form.setValue("enrollmentId", "");
      toast.error("El alumno seleccionado no tiene una matrícula activa.");
    }
  };

  const removeSelectedStudent = () => {
    setSelectedStudent(null);
    setActiveEnrollment(null);
    form.reset();
  };

  // ========== SUBMIT LOGIC ==========
  const onSubmit = async (values: z.infer<typeof DisabilitySchema>) => {
    setIsSubmitting(true);
    toast.loading("Registrando inhabilitación...", { id: "register-disab" });

    try {
      const res = await createDisability(values);

      if (res.success) {
        toast.success("Inhabilitación registrada correctamente.", {
          id: "register-disab",
        });
        router.push("/dashboard/inhabilitaciones");
      } else {
        toast.error(res.error, { id: "register-disab" });
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.", { id: "register-disab" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nueva Inhabilitación"
        description="Selecciona un alumno activo y documenta la razón de la inhabilitación académica o disciplinaria."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/inhabilitaciones">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Búsqueda */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                1. Alumno a Inhabilitar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="DNI o Apellido..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                  disabled={selectedStudent !== null}
                />

                {/* Dropdown de Resultados */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-0"
                        onClick={() => handleSelectStudent(student)}
                      >
                        <div className="font-medium text-sm text-slate-800">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {student.dni}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="text-xs text-slate-500 mt-2 text-center flex items-center justify-center gap-2">
                    <div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                    Buscando...
                  </div>
                )}
              </div>

              {/* Alumno Seleccionado UI */}
              {selectedStudent && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-lg relative overflow-hidden">
                  <div className="flex gap-3 items-start relative z-10">
                    <div className="h-10 w-10 rounded-full bg-red-200 flex items-center justify-center text-red-700 font-bold shrink-0">
                      {selectedStudent.firstName[0]}
                      {selectedStudent.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-sm">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mb-1">
                        DNI: {selectedStudent.dni}
                      </p>
                      {activeEnrollment ? (
                        <Badge
                          variant="secondary"
                          className="bg-white border-red-200 text-red-700 text-[10px]"
                        >
                          {activeEnrollment.section.gradeLevel.name} "
                          {activeEnrollment.section.name}"
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          Sin Matrícula Activa
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-3 text-red-600 hover:text-red-700 hover:bg-red-100 text-xs h-7 absolute z-10 bottom-0 left-0 rounded-none rounded-b-lg opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                    onClick={removeSelectedStudent}
                  >
                    Cambiar Alumno
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Formulario de Motivos */}
        <div className="lg:col-span-2">
          <Card
            className={
              !activeEnrollment ? "opacity-50 pointer-events-none" : ""
            }
          >
            <CardHeader className="border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                2. Detalles de Sanción / Inhabilitación
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo Principal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona un motivo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="DISCIPLINA">
                              Falta Disciplinaria / Conducta
                            </SelectItem>
                            <SelectItem value="BAJO_RENDIMIENTO">
                              Bajo Rendimiento Académico
                            </SelectItem>
                            <SelectItem value="EXCESO_FALTAS">
                              Exceso de Inasistencias Injustificadas
                            </SelectItem>
                            <SelectItem value="OTRO">Otro Motivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Descripción o Explicación del caso (Opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej. El alumno agredió a un compañero reiteradas veces..."
                            className="resize-none min-h-[120px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4 gap-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard/inhabilitaciones")}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700"
                      disabled={!activeEnrollment || isSubmitting}
                    >
                      {isSubmitting
                        ? "Registrando..."
                        : "Confirmar Inhabilitación"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
