import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { type AppRole, hasAllowedRole, normalizeRole } from "@/lib/rbac";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
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
    },
  });
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError();
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
