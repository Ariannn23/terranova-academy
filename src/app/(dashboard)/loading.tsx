import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function DashboardLoading() {
  return (
    <div className="p-8 w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <LoadingSpinner text="Cargando módulo..." />
    </div>
  );
}
