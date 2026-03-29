"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import {
  Search,
  User,
  CreditCard,
  Calendar,
  DollarSign,
  Printer,
  CheckCircle2,
  Smartphone,
  Landmark,
  CreditCard as CreditCardIcon,
  Banknote,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";

import {
  searchStudentsForPayment,
  getStudentPendingPayments,
  registerPayment as processPayment,
} from "@/lib/actions/payment.actions";
import { ReceiptModal } from "./ReceiptModal";

const PaymentFormSchema = z.object({
  paymentId: z.string().min(1, "Selecciona una cuota a pagar"),
  method: z.string().min(1, "Selecciona un método de pago"),
  referenceImage: z.any().optional(),
});

export default function RegisterPaymentClient() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);

  const form = useForm<z.infer<typeof PaymentFormSchema>>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      paymentId: "",
      method: "Efectivo",
    },
  });

  useEffect(() => {
    // Descartar toast de navegación al montar
    toast.dismiss("nav-payments");
  }, []);

  // Efecto para buscar alumnos
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setIsSearching(true);
        const res = await searchStudentsForPayment(searchTerm);
        if (res.success) {
          setSearchResults(res.data || []);
        } else {
          toast.error(res.error);
        }
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Cargar deudas del alumno al seleccionarlo
  const handleSelectStudent = async (student: any) => {
    setSelectedStudent(student);
    setSearchTerm("");
    setSearchResults([]);
    setIsLoadingPayments(true);

    // reset form
    form.reset({ paymentId: "", method: "Efectivo" });

    const res = await getStudentPendingPayments(student.id);
    if (res.success) {
      setPendingPayments(res.data || []);
    } else {
      toast.error(res.error);
      setPendingPayments([]);
    }
    setIsLoadingPayments(false);
  };

  const selectedPaymentId = form.watch("paymentId");
  const selectedPaymentInfo = pendingPayments.find(
    (p) => p.id === selectedPaymentId,
  );

  const onSubmit = async (values: z.infer<typeof PaymentFormSchema>) => {
    if (!selectedStudent) return;

    setIsProcessing(true);
    const toastId = toast.loading("Procesando pago y generando recibo...");

    try {
      const res = await processPayment({
        paymentId: values.paymentId,
        method: values.method,
      });

      if (res.success) {
        toast.success("Pago procesado correctamente", { id: toastId });
        setLastReceipt(res.data);
        setShowReceipt(true);

        // Actualizar la lista de pendientes localmente sacando el pagado
        setPendingPayments((prev) =>
          prev.filter((p) => p.id !== values.paymentId),
        );
        form.resetField("paymentId");
        setPreviewImage(null);
      } else {
        toast.error(res.error || "Ocurrió un error al procesar el pago", {
          id: toastId,
        });
      }
    } catch (error) {
      toast.error("Error de conexión o servidor", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Registrar Cobro"
        description="Busca al alumno y asienta el pago de cuotas pendientes."
        action={
          <Button variant="outline" asChild>
            <Link href="/dashboard/pagos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Regresar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Buscador */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                1. Estudiante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="DNI, Código o Nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />

                {/* Resultados de búsqueda (Dropdown flotante) */}
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
                        <div className="text-xs text-slate-500 flex gap-2">
                          <span className="font-mono">{student.dni}</span>
                          {student.code && <span>• {student.code}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="text-xs text-slate-500 mt-2 text-center">
                    Buscando...
                  </div>
                )}
              </div>

              {/* Tarjeta del Alumno Seleccionado */}
              {selectedStudent && (
                <div className="p-4 bg-slate-50 border rounded-lg flex gap-3 items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    {selectedStudent.firstName[0]}
                    {selectedStudent.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 line-clamp-1">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      DNI: {selectedStudent.dni}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Pagos Pendientes y Formulario */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                2. Cuotas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedStudent ? (
                <div className="text-center p-8 text-slate-500 border-2 border-dashed rounded-lg">
                  Busca y selecciona un alumno para ver sus deudas.
                </div>
              ) : isLoadingPayments ? (
                <div className="text-center p-8 text-slate-500">
                  Cargando cuentas...
                </div>
              ) : pendingPayments.length === 0 ? (
                <div className="text-center p-8 text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="w-8 h-8" />
                  <p className="font-medium">
                    El alumno está al día en sus pagos.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    noValidate
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="paymentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seleccionar Deuda</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-1">
                            {pendingPayments.map((payment) => {
                              const isOverdue =
                                new Date(payment.dueDate) < new Date();
                              const isSelected = field.value === payment.id;

                              return (
                                <div
                                  key={payment.id}
                                  onClick={() => field.onChange(payment.id)}
                                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-blue-600 bg-blue-50 shadow-sm"
                                      : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="absolute top-3 right-3 text-blue-600">
                                      <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-slate-900 pr-6">
                                      {payment.concept.name}
                                    </h4>
                                  </div>
                                  <div className="space-y-1 text-sm text-slate-600">
                                    <div className="flex items-center gap-2">
                                      <DollarSign className="w-4 h-4 text-emerald-600" />
                                      <span className="font-bold text-emerald-700">
                                        S/ {payment.amount.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        Vence:{" "}
                                        {format(
                                          new Date(payment.dueDate),
                                          "dd MMM yyyy",
                                          { locale: es },
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  {isOverdue && (
                                    <Badge
                                      variant="destructive"
                                      className="mt-2 text-[10px] px-1.5 py-0"
                                    >
                                      Vencido
                                    </Badge>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedPaymentId && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <FormField
                          control={form.control}
                          name="method"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Método de Pago</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecciona un método" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Efectivo">
                                    <div className="flex items-center gap-2">
                                      <Banknote className="w-4 h-4 text-emerald-600" />
                                      Efectivo
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Yape">
                                    <div className="flex items-center gap-2">
                                      <Smartphone className="w-4 h-4 text-purple-600" />
                                      Yape
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Plin">
                                    <div className="flex items-center gap-2">
                                      <Smartphone className="w-4 h-4 text-blue-500" />
                                      Plin
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Transferencia">
                                    <div className="flex items-center gap-2">
                                      <Landmark className="w-4 h-4 text-slate-600" />
                                      Transferencia
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Tarjeta">
                                    <div className="flex items-center gap-2">
                                      <CreditCardIcon className="w-4 h-4 text-slate-800" />
                                      POS / Tarjeta
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Image Upload for Transfers/Yape/Plin */}
                        {["Yape", "Plin", "Transferencia"].includes(
                          form.watch("method"),
                        ) && (
                          <div className="space-y-3 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
                            <label className="text-sm font-medium leading-none text-blue-900 flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" /> Adjuntar Captura
                              de Pago (Opcional)
                            </label>

                            <div className="flex items-center justify-center w-full">
                              {!previewImage ? (
                                <label
                                  htmlFor="dropzone-file"
                                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-6 h-6 mb-2 text-slate-500" />
                                    <p className="mb-1 text-sm text-slate-500">
                                      <span className="font-semibold">
                                        Haz clic para subir
                                      </span>{" "}
                                      o arrastra
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      PNG, JPG (Max. 5MB)
                                    </p>
                                  </div>
                                  <input
                                    id="dropzone-file"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        // Fake upload just for UI preview since there is no storage connected yet
                                        const objectUrl =
                                          URL.createObjectURL(file);
                                        setPreviewImage(objectUrl);
                                        form.setValue("referenceImage", file);
                                      }
                                    }}
                                  />
                                </label>
                              ) : (
                                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200">
                                  <img
                                    src={previewImage}
                                    alt="Voucher preview"
                                    className="object-cover w-full h-full"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewImage(null);
                                      form.setValue(
                                        "referenceImage",
                                        undefined,
                                      );
                                    }}
                                    className="absolute top-2 right-2 bg-slate-900/60 text-white rounded-full p-1.5 hover:bg-slate-900/90 text-xs backdrop-blur-md"
                                  >
                                    Cambiar imagen
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Summary Block */}
                        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <p className="text-slate-400 text-sm">
                              Total a cobrar
                            </p>
                            <p className="text-2xl font-bold">
                              S/ {selectedPaymentInfo?.amount.toFixed(2)}
                            </p>
                          </div>
                          <Button
                            type="submit"
                            size="lg"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            disabled={isProcessing}
                          >
                            {isProcessing ? "Procesando..." : "Confirmar Pago"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Recibo (imprimible) */}
      <ReceiptModal
        isOpen={showReceipt}
        onClose={setShowReceipt}
        receipt={lastReceipt}
        onReturn={() => (window.location.href = "/dashboard/pagos")}
        successTitle="Pago Procesado con Éxito"
      />
    </div>
  );
}
