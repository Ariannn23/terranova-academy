import { getWizardData } from "@/lib/actions/enrollments.actions";
import { EnrollmentWizard } from "@/components/modules/enrollments/EnrollmentWizard";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function NewEnrollmentPage() {
  const result = await getWizardData();

  if (!result.success || !result.data) {
    return (
      <div className="p-6">
        <EmptyState
          title="Error de conexión"
          description="No se pudieron cargar los datos necesarios para matricular."
        />
      </div>
    );
  }

  return (
    <div className="p-6 animate-in fade-in duration-500">
      <EnrollmentWizard initialData={result.data} />
    </div>
  );
}
