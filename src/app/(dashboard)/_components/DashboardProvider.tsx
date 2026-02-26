"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const DashboardContext = createContext({
  isNavigating: false,
  setIsNavigating: (v: boolean) => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading state whenever the URL finishes changing
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  return (
    <DashboardContext.Provider value={{ isNavigating, setIsNavigating }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);

export function MainContentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isNavigating } = useDashboard();

  if (isNavigating) {
    return (
      <div className="p-8 w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center">
        <LoadingSpinner text="Cargando módulo..." />
      </div>
    );
  }

  return <>{children}</>;
}
