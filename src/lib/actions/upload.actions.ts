"use server";

import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";
import {
  createSafeUploadPath,
  validateImageUploadFile,
} from "@/lib/upload-security";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Sube la foto de un estudiante a Supabase Storage y actualiza su registro.
 */
export async function uploadStudentPhoto(
  studentId: string,
  formData: FormData,
) {
  const currentUser = await requireRole(ROLE_GROUPS.ADMISSIONS);

  const file = formData.get("file") as File;
  if (!file)
    return { success: false, error: "No se proporciono ningun archivo" };

  const validation = validateImageUploadFile(file);
  if (!validation.success) return { success: false, error: validation.error };

  const bucket = PHOTOS_BUCKET;
  const filePath = createSafeUploadPath("students", studentId, validation.extension);

  try {
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      return { success: false, error: `Error Storage: ${error.message}` };
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    await prisma.student.update({
      where: { id: studentId },
      data: { photoUrl: publicUrl },
    });

    revalidatePath("/dashboard/estudiantes");
    revalidatePath(`/dashboard/estudiantes/${studentId}`);

    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.STUDENT,
      entityId: studentId,
      newValue: { photoUrl: publicUrl },
      metadata: {
        module: "uploads",
        operation: "upload_student_photo",
        bucket,
        path: data.path,
        mimeType: file.type,
        size: file.size,
      },
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
    });

    return { success: true, data: publicUrl };
  } catch (error: unknown) {
    console.error("Error in uploadStudentPhoto:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error inesperado al subir la foto"),
    };
  }
}

/**
 * Sube la foto de un docente a Supabase Storage y actualiza su registro.
 */
export async function uploadTeacherPhoto(
  teacherId: string,
  formData: FormData,
) {
  const currentUser = await requireRole(ROLE_GROUPS.ADMINISTRATION);

  const file = formData.get("file") as File;
  if (!file)
    return { success: false, error: "No se proporciono ningun archivo" };

  const validation = validateImageUploadFile(file);
  if (!validation.success) return { success: false, error: validation.error };

  const bucket = PHOTOS_BUCKET;
  const filePath = createSafeUploadPath("teachers", teacherId, validation.extension);

  try {
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase Storage Error (Teacher):", error);
      return { success: false, error: `Error Storage: ${error.message}` };
    }

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    await prisma.teacher.update({
      where: { id: teacherId },
      data: { photoUrl: publicUrl },
    });

    revalidatePath("/dashboard/docentes");
    revalidatePath(`/dashboard/docentes/${teacherId}`);

    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.TEACHER,
      entityId: teacherId,
      newValue: { photoUrl: publicUrl },
      metadata: {
        module: "uploads",
        operation: "upload_teacher_photo",
        bucket,
        path: data.path,
        mimeType: file.type,
        size: file.size,
      },
      userId: currentUser.id,
      userEmail: currentUser.email,
      userRole: currentUser.role,
    });

    return { success: true, data: publicUrl };
  } catch (error: unknown) {
    console.error("Error in uploadTeacherPhoto:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error inesperado al subir la foto"),
    };
  }
}

/**
 * Elimina una foto de Supabase Storage.
 */
export async function deletePhoto(url: string) {
  await requireRole(ROLE_GROUPS.ADMISSIONS);

  if (!url) return { success: true };

  try {
    const parts = url.split(`/${PHOTOS_BUCKET}/`);
    const filePath = parts.pop();

    if (!filePath) {
      return { success: false, error: "URL de foto invalida para eliminacion" };
    }

    const { error } = await supabaseAdmin.storage
      .from(PHOTOS_BUCKET)
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error in deletePhoto:", error);
    return { success: false, error: "Error al eliminar la foto" };
  }
}
