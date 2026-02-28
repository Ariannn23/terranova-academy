import { RegisterIncidentClient } from "@/components/modules/incidents/RegisterIncidentClient";

export const metadata = {
  title: "Nueva Incidencia - TerraNova Academy",
  description: "Registrar incidencia disciplinaria en el libro.",
};

export default function RegisterIncidentPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <RegisterIncidentClient />
    </div>
  );
}
