import Link from "next/link";
import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-8 w-full h-[calc(100vh-100px)]">
      <div className="flex flex-col items-center text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-lg">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
          <HardHat className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Módulo en Construcción
        </h2>
        <p className="text-slate-500 mb-8">
          Aún estamos trabajando duro en esta sección para traer nuevas
          funcionalidades escolares muy pronto. ¡Vuelve más adelante!
        </p>
        <Button asChild className="bg-emerald-700 hover:bg-emerald-800">
          <Link href="/dashboard">Volver al Inicio</Link>
        </Button>
      </div>
    </div>
  );
}
