import StudentPaymentHistory from "@/components/modules/payments/StudentPaymentHistory";
import { getStudentPaymentHistory } from "@/lib/actions/payments.actions";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Historial de Pagos | TerraNova Academy",
  description: "Cronograma e historial de cuotas del estudiante",
};

export default async function PaymentHistoryPage({
  params,
}: {
  params: { matriculaId: string };
}) {
  const historyRes = await getStudentPaymentHistory(params.matriculaId);

  if (!historyRes.success) {
    if (historyRes.error === "No encontrado") notFound();
    return (
      <div className="p-6 text-red-500">
        Error al cargar el historial: {historyRes.error}
      </div>
    );
  }

  return <StudentPaymentHistory enrollmentData={historyRes.data} />;
}
