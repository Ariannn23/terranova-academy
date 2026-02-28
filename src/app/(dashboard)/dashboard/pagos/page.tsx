import { getPaymentDashboardStats } from "@/lib/actions/payments.actions";
import PaymentsDashboardClient from "@/components/modules/payments/PaymentsDashboardClient";

export const metadata = {
  title: "Pagos | TerraNova Academy",
  description: "Módulo de gestión de cobros y pagos",
};

export default async function PaymentsPage() {
  const statsRes = await getPaymentDashboardStats();
  // Se obtiene el mes y año actual por defecto. Luego el cliente puede refetchear filtrando.

  if (!statsRes.success) {
    return (
      <div className="p-6 text-red-500">
        Error al cargar los datos financieros: {statsRes.error}
      </div>
    );
  }

  return <PaymentsDashboardClient initialData={statsRes.data} />;
}
