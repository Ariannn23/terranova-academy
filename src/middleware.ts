// src/middleware.ts — Protección de rutas del dashboard
// Redirige al login a cualquier usuario no autenticado que intente acceder a /dashboard/*
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  const isTestPage = req.nextUrl.pathname === "/dashboard/test-backend";

  if (isDashboard && !isTestPage && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
