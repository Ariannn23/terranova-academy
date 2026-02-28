import { RegisterDisabilityClient } from "@/components/modules/disabilities/RegisterDisabilityClient";

export const metadata = {
  title: "Nueva Inhabilitación - TerraNova Academy",
  description: "Formulario para inhabilitar a un alumno activo.",
};

export default function RegisterDisabilityPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <RegisterDisabilityClient />
    </div>
  );
}
