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
import { createIncident } from "@/lib/actions/incident.actions";
import { IncidentSchema } from "@/lib/validations/incident.schema";

export function RegisterIncidentClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [activeEnrollment, setActiveEnrollment] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof IncidentSchema>>({
    resolver: zodResolver(IncidentSchema),
    defaultValues: {
      enrollmentId: "",
      date: new Date(),
      severity: "LEVE",
      description: "",
      action: "",
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
    form.reset({
      enrollmentId: "",
      date: new Date(),
      severity: "LEVE",
      description: "",
      action: "",
    });
  };

  // ========== SUBMIT LOGIC ==========
  const onSubmit = async (values: z.infer<typeof IncidentSchema>) => {
    setIsSubmitting(true);
    toast.loading("Registrando incidencia...", { id: "register-inc" });

    try {
      const res = await createIncident(values);

      if (res.success) {
        toast.success("Incidencia registrada correctamente.", {
          id: "register-inc",
        });
        router.push("/dashboard/incidents");
      } else {
        toast.error(res.error, { id: "register-inc" });
      }
    } catch (error) {
      toast.error("Error de conexión al servidor.", { id: "register-inc" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nueva Incidencia"
        description="Selecciona un alumno activo y documenta la incidencia ocurrida (Leve, Moderada o Grave)."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/incidents">
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
                1. Alumno Involucrado
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
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-lg relative overflow-hidden">
                  <div className="flex gap-3 items-start relative z-10">
                    <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold shrink-0">
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
                          className="bg-white border-orange-200 text-orange-700 text-[10px]"
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
                    className="w-full mt-3 text-orange-600 hover:text-orange-700 hover:bg-orange-100 text-xs h-7 absolute z-10 bottom-0 left-0 rounded-none rounded-b-lg opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100"
                    onClick={removeSelectedStudent}
                  >
                    Cambiar Alumno
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Formulario de Registro */}
        <div className="lg:col-span-2">
          <Card
            className={
              !activeEnrollment ? "opacity-50 pointer-events-none" : ""
            }
          >
            <CardHeader borderBottom>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                2. Detalles de la Incidencia
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del Incidente</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={
                                field.value
                                  ? (field.value as Date)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
                              onChange={(e) =>
                                field.onChange(new Date(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage className="text-xs text-red-600" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="severity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Severidad</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona severidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="LEVE">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                  Leve
                                </span>
                              </SelectItem>
                              <SelectItem value="MODERADO">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                  Moderado
                                </span>
                              </SelectItem>
                              <SelectItem value="GRAVE">
                                <span className="flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                                  Grave
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-600" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción de lo ocurrido</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ej. El alumno interrumpió la clase constantemente..."
                            className="resize-none min-h-[100px]"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs text-red-600" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Acción Tomada (Opcional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ej. Se llamó al apoderado, amonestación verbal..."
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
                      onClick={() => router.push("/dashboard/incidents")}
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={!activeEnrollment || isSubmitting}
                    >
                      {isSubmitting ? "Registrando..." : "Guardar Incidencia"}
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
