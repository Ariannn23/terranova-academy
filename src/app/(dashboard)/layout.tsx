import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { InitialLoader } from "./_components/InitialLoader";
import { getAllowedRolesForPath, hasAllowedRole } from "@/lib/rbac";
import { headers } from "next/headers";
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

  const pathname = headers().get("x-next-url") ?? "";
  if (pathname.startsWith("/dashboard")) {
    const allowedRoles = getAllowedRolesForPath(pathname);
    const userRole = (session.user as { role?: string }).role;

    if (!hasAllowedRole(userRole, allowedRoles)) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header user={session.user} />
        <main className="flex-1 w-full mx-auto">
          <InitialLoader>{children}</InitialLoader>
        </main>
      </div>
    </div>
  );
}
