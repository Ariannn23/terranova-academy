import OverduePaymentsClient from "@/components/modules/payments/OverduePaymentsClient";
import { getOverduePayments } from "@/lib/actions/payment.actions";

export const metadata = {
  title: "Pagos Vencidos | TerraNova Academy",
  description: "Reporte de estudiantes con cuotas en estado de morosidad",
};

export default async function OverduePaymentsPage() {
  const overdueRes = await getOverduePayments();

  if (!overdueRes.success) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar los pagos vencidos: {overdueRes.error}
      </div>
    );
  }

  return <OverduePaymentsClient initialData={overdueRes.data || []} />;
}
