"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AnnouncementSchema } from "@/lib/validations/incident.schema";
import { Level } from "@prisma/client";

export async function getAnnouncements(filters?: {
  targetLevel?: Level | "ALL";
}) {
  try {
    const whereClause: any = {};

    if (filters?.targetLevel && filters.targetLevel !== "ALL") {
      whereClause.OR = [
        { targetLevel: filters.targetLevel },
        { targetLevel: null }, // Muestra también los globales
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return { success: false, error: "Error interno al cargar comunicados." };
  }
}

export async function createAnnouncement(data: unknown) {
  const parsed = AnnouncementSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        body: parsed.data.body,
        targetLevel: parsed.data.targetLevel,
      },
    });

    revalidatePath("/dashboard/comunicados");
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Error creating announcement:", error);
    return { success: false, error: "Error al registrar el comunicado." };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath("/dashboard/comunicados");
    return { success: true };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return { success: false, error: "Error al eliminar el comunicado." };
  }
}
