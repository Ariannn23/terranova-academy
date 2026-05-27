import {
  AuthenticationError,
  AuthorizationError,
  requireAuth,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";
import Header from "./_components/Header";
import { InitialLoader } from "./_components/InitialLoader";
import { getAllowedRolesForPath, hasAllowedRole } from "@/lib/rbac";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await requireAuth();
  } catch (error) {
    if (
      error instanceof AuthenticationError ||
      error instanceof AuthorizationError
    ) {
      redirect("/login");
    }
    throw error;
  }

  if (!user) {
    redirect("/login");
  }

  const pathname = headers().get("x-next-url") ?? "";
  if (pathname.startsWith("/dashboard")) {
    const allowedRoles = getAllowedRolesForPath(pathname);
    const userRole = user.role;

    if (!hasAllowedRole(userRole, allowedRoles)) {
      redirect("/dashboard");
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar userRole={user.role} />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header
          user={{
            name: user.name ?? undefined,
            role: user.role,
          }}
        />
        <main className="flex-1 w-full mx-auto">
          <InitialLoader>{children}</InitialLoader>
        </main>
      </div>
    </div>
  );
}
