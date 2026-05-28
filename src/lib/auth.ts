import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import { processCredentialLogin } from "@/lib/auth/login-credentials";
import { type AppRole, hasAllowedRole, normalizeRole } from "@/lib/rbac";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const result = await processCredentialLogin(credentials, {
          sessionBootstrap: true,
        });
        if (!result.success) return null;
        return result.user;
      },
    }),
  ],
  session: { strategy: "jwt" },
});

export class AuthenticationError extends Error {
  constructor(message = "No autenticado") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function getCurrentUser() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
  });
}

export async function requireAuth() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new AuthenticationError();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
    },
  });

  if (!user) {
    throw new AuthenticationError();
  }

  if (!user.active) {
    throw new AuthenticationError("Usuario inactivo. Contacte al administrador.");
  }

  return {
    ...user,
    role: normalizeRole(user.role) ?? user.role,
  };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const user = await requireAuth();

  if (!hasAllowedRole(user.role, allowedRoles)) {
    throw new AuthorizationError(
      `El rol ${user.role} no tiene permiso para ejecutar esta accion.`,
    );
  }

  return user;
}
