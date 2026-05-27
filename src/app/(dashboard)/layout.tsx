import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { InitialLoader } from "./_components/InitialLoader";
import { getAllowedRolesForPath, hasAllowedRole } from "@/lib/rbac";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Proteger la ruta: Si no hay sesión, al login
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Validar active contra base de datos en cada request protegido
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { active: true },
  });

  if (!dbUser || !dbUser.active) {
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
      <Sidebar userRole={(session.user as { role?: string }).role} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header user={session.user} />
        <main className="flex-1 w-full mx-auto">
          <InitialLoader>{children}</InitialLoader>
        </main>
      </div>
    </div>
  );
}
