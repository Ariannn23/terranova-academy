import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import {
  DashboardProvider,
  MainContentWrapper,
} from "./_components/DashboardProvider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Proteger la ruta: Si no hay sesión, al login
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header user={session.user} />
          <main className="flex-1 w-full mx-auto">
            <MainContentWrapper>{children}</MainContentWrapper>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
