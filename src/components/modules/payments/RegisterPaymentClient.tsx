"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ReceiptModal } from "./ReceiptModal";

import { useStudentSearch } from "@/components/shared/hooks/useStudentSearch";
import { usePaymentForm } from "./hooks/usePaymentForm";
import { PaymentSearchInput } from "./_components/PaymentSearchInput";
import { PendingPaymentsList } from "./_components/PendingPaymentsList";
import { PaymentMethodSelect } from "./_components/PaymentMethodSelect";
import { SearchStudentResult } from "@/lib/actions/payment.actions";

export default function RegisterPaymentClient() {
  const router = useRouter();

  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching,
    selectedStudent,
    setSelectedStudent,
    clearSearch,
  } = useStudentSearch();

  const {
    form,
    pendingPayments,
    isLoadingPayments,
    isProcessing,
    showReceipt,
    setShowReceipt,
    lastReceipt,
    previewImage,
    setPreviewImage,
    loadStudentPayments,
    onSubmit,
  } = usePaymentForm();

  useEffect(() => {
    toast.dismiss("nav-payments");
  }, []);

  const handleSelectStudent = (student: SearchStudentResult) => {
    setSelectedStudent(student);
    clearSearch();
    loadStudentPayments(student.id);
  };

  const selectedPaymentInfo = pendingPayments.find(
    (p) => p.id === form.watch("paymentId"),
  );

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
              <PaymentSearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isSearching={isSearching}
                searchResults={searchResults}
                onSelectStudent={handleSelectStudent}
                selectedStudent={selectedStudent}
              />
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
                    onSubmit={form.handleSubmit((v) =>
                      onSubmit(v, selectedStudent.id),
                    )}
                    className="space-y-6"
                  >
                    <PendingPaymentsList
                      control={form.control}
                      pendingPayments={pendingPayments}
                    />

                    {form.watch("paymentId") && (
                      <div className="space-y-4 pt-4 border-t border-slate-100">
                        <PaymentMethodSelect
                          control={form.control}
                          methodValue={form.watch("method")}
                          previewImage={previewImage}
                          setPreviewImage={setPreviewImage}
                          setValue={form.setValue}
                        />

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
