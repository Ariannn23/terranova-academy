// src/middleware.ts — Protección de rutas del dashboard
// Redirige al login a cualquier usuario no autenticado que intente acceder a /dashboard/*
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import {
  getAllowedRolesForPath,
  getDefaultDashboardPath,
  hasAllowedRole,
  ROLE_GROUPS,
} from "@/lib/rbac";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isDashboard) {
    const allowedRoles = getAllowedRolesForPath(req.nextUrl.pathname);
    const userRole = (req.auth?.user as { role?: string } | undefined)?.role;

    if (
      req.nextUrl.pathname === "/dashboard" &&
      !hasAllowedRole(userRole, ROLE_GROUPS.REPORTS)
    ) {
      return Response.redirect(new URL(getDefaultDashboardPath(userRole), req.nextUrl));
    }

    if (!hasAllowedRole(userRole, allowedRoles)) {
      return Response.redirect(new URL(getDefaultDashboardPath(userRole), req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
