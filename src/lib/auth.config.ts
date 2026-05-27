import type { NextAuthConfig } from "next-auth";
import { normalizeRole } from "@/lib/rbac";

// auth.config.ts — Configuración base compatible con Edge Runtime
// No importar prisma ni bcrypt aquí.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = normalizeRole((user as { role?: string }).role) ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as { role?: unknown }).role = token.role;
      }
      return session;
    },
  },
  providers: [], // Se llenan en auth.ts para evitar imports pesados en el middleware
} satisfies NextAuthConfig;
