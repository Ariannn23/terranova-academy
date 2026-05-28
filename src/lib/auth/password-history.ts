import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const PASSWORD_HISTORY_LIMIT = 3;
export const PASSWORD_REUSE_ERROR =
  "La nueva contraseña no puede ser igual a una de las ultimas 3 contrasenas utilizadas.";

type PasswordHistoryEntry = {
  passwordHash: string;
};

export async function assertPasswordWasNotRecentlyUsed(input: {
  userId: string;
  newPassword: string;
  currentPasswordHash?: string | null;
}) {
  const recentPasswords = await prisma.passwordHistory.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
    take: PASSWORD_HISTORY_LIMIT,
    select: { passwordHash: true },
  });

  const hashesToCheck = [
    input.currentPasswordHash,
    ...recentPasswords.map((entry: PasswordHistoryEntry) => entry.passwordHash),
  ].filter((hash): hash is string => Boolean(hash));

  for (const hash of hashesToCheck) {
    if (await bcrypt.compare(input.newPassword, hash)) {
      throw new Error(PASSWORD_REUSE_ERROR);
    }
  }
}

export async function recordPasswordHistory(input: {
  userId: string;
  passwordHash: string;
}) {
  await prisma.passwordHistory.create({
    data: {
      userId: input.userId,
      passwordHash: input.passwordHash,
    },
  });

  const entriesToKeep = await prisma.passwordHistory.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
    take: PASSWORD_HISTORY_LIMIT,
    select: { id: true },
  });

  await prisma.passwordHistory.deleteMany({
    where: {
      userId: input.userId,
      id: { notIn: entriesToKeep.map((entry) => entry.id) },
    },
  });
}
