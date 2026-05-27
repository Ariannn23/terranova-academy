import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center p-8">
      <div className="flex max-w-lg flex-col items-center rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <AlertCircle className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          Ruta no encontrada o m&oacute;dulo no habilitado
        </h2>
        <p className="mb-8 text-slate-500">
          La secci&oacute;n solicitada no existe, no est&aacute; disponible o no
          se encuentra habilitada dentro del panel de TerraNova Academy.
        </p>
        <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
          <Link href="/dashboard">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  );
}
