"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { AnnouncementSchema } from "@/lib/validations/incident.schema";
import { Level } from "@prisma/client";

// ==========================================
// ACCIONES PARA COMUNICADOS (Announcements)
// ==========================================

export async function getAnnouncements(filters?: {
  level?: Level;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const whereClause: any = {};

    if (filters?.level) {
      // Retornar tanto los que son específicamente para ese nivel como los GLOBALES (null)
      whereClause.OR = [{ targetLevel: filters.level }, { targetLevel: null }];
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
      if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
    }

    const announcements = await prisma.announcement.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: announcements };
  } catch (error) {
    console.error("Error in getAnnouncements:", error);
    return { success: false, error: "Error al obtener comunicados" };
  }
}

export async function createAnnouncement(data: unknown) {
  const parsed = AnnouncementSchema.safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const announcement = await prisma.announcement.create({
      data: parsed.data,
    });

    revalidatePath("/dashboard/anuncios");
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Error in createAnnouncement:", error);
    return { success: false, error: "Error al publicar comunicado" };
  }
}

export async function updateAnnouncement(id: string, data: unknown) {
  const parsed = AnnouncementSchema.partial().safeParse(data);
  if (!parsed.success) return { success: false, error: parsed.error.flatten() };

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/dashboard/anuncios");
    return { success: true, data: announcement };
  } catch (error: any) {
    console.error("Error in updateAnnouncement:", error);
    return { success: false, error: "Error al actualizar comunicado" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await prisma.announcement.delete({
      where: { id },
    });

    revalidatePath("/dashboard/anuncios");
    return { success: true };
  } catch (error) {
    console.error("Error in deleteAnnouncement:", error);
    return { success: false, error: "Error al eliminar comunicado" };
  }
}
