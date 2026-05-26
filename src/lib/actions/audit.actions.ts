"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";

type AuditLogFilters = {
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  limit?: number;
};

export async function getAuditLogs(filters: AuditLogFilters = {}) {
  try {
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    const take = Math.min(filters.limit ?? 100, 250);
    const logs = await prisma.auditLog.findMany({
      where: {
        ...(filters.action ? { action: filters.action } : {}),
        ...(filters.entity ? { entity: filters.entity } : {}),
        ...(filters.entityId ? { entityId: filters.entityId } : {}),
        ...(filters.userId ? { userId: filters.userId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error("Error in getAuditLogs:", error);
    return { success: false, error: "Error al obtener logs de auditoria" };
  }
}

export async function getAuditLogsByEntity(entity: string, entityId: string) {
  try {
    await requireRole(ROLE_GROUPS.ADMINISTRATION);

    const logs = await prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error("Error in getAuditLogsByEntity:", error);
    return { success: false, error: "Error al obtener auditoria de entidad" };
  }
}
