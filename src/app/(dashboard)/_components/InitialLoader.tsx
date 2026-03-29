"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export function InitialLoader({ children }: { children: React.ReactNode }) {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Mostramos el loader global solo durante el primer renderizado de la aplicación
    // Le damos un pequeño delay artificial para asegurar que toda la UI pesada del layout ha hidratado
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  if (isInitialLoad) {
    return (
      <div className="p-8 w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <LoadingSpinner text="Iniciando plataforma..." />
      </div>
    );
  }

  return <>{children}</>;
}
