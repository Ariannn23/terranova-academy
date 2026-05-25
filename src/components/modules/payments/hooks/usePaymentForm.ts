import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  getStudentPendingPayments,
  registerPayment as processPayment,
} from "@/lib/actions/payment.actions";
import { PaymentFormSchema } from "@/lib/validations/payment.schema";

export function usePaymentForm() {
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof PaymentFormSchema>>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      paymentId: "",
      amount: 0,
      method: "Efectivo",
    },
  });

  const loadStudentPayments = async (studentId: string) => {
    setIsLoadingPayments(true);
    form.reset({ paymentId: "", amount: 0, method: "Efectivo" });
    setPreviewImage(null);

    const res = await getStudentPendingPayments(studentId);
    if (res.success) {
      setPendingPayments(res.data || []);
    } else {
      toast.error(res.error);
      setPendingPayments([]);
    }
    setIsLoadingPayments(false);
  };

  const onSubmit = async (
    values: z.infer<typeof PaymentFormSchema>,
    studentId: string | undefined,
  ) => {
    if (!studentId) return;

    setIsProcessing(true);
    const toastId = toast.loading("Procesando pago y generando recibo...");

    try {
      const res = await processPayment({
        paymentId: values.paymentId,
        amount: values.amount,
        method: values.method,
      });

      if (res.success) {
        toast.success("Pago procesado correctamente", { id: toastId });
        setLastReceipt(res.data);
        setShowReceipt(true);

        setPendingPayments((prev) => {
          const remaining = res.data?.balance ?? 0;
          if (remaining <= 0) return prev.filter((p) => p.id !== values.paymentId);

          return prev.map((p) =>
            p.id === values.paymentId
              ? {
                  ...p,
                  balance: remaining,
                  transactions: res.data?.transactions ?? p.transactions,
                }
              : p,
          );
        });
        form.reset({ paymentId: "", amount: 0, method: values.method });
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

  return {
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
  };
}
