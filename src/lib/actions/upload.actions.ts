"use server";

import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Sube la foto de un estudiante a Supabase Storage y actualiza su registro.
 */
export async function uploadStudentPhoto(
  studentId: string,
  formData: FormData,
) {
  await requireRole(ROLE_GROUPS.ADMISSIONS);

  const file = formData.get("file") as File;
  if (!file)
    return { success: false, error: "No se proporcionó ningún archivo" };

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "La imagen excede el límite de 10 MB" };
  }

  const bucket = PHOTOS_BUCKET;
  const fileExt = file.name.split(".").pop();
  const fileName = `${studentId}-${Date.now()}.${fileExt}`;
  const filePath = `students/${fileName}`;

  try {
    // 1. Convertir para compatibilidad en Server Actions (Node.js environment)
    const arrayBuffer = await file.arrayBuffer();

    // 2. Subir a Supabase Storage (usando admin para bypass RLS si es necesario)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, arrayBuffer, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type, // Especificar el tipo para que Supabase lo reconozca
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      return { success: false, error: `Error Storage: ${error.message}` };
    }

    // 3. Obtener URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    // 4. Actualizar el perfil del estudiante en la base de datos
    await prisma.student.update({
      where: { id: studentId },
      data: { photoUrl: publicUrl },
    });

    revalidatePath("/dashboard/estudiantes");
    revalidatePath(`/dashboard/estudiantes/${studentId}`);

    return { success: true, data: publicUrl };
  } catch (error: any) {
    console.error("Error in uploadStudentPhoto:", error);
    return {
      success: false,
      error: error.message || "Error inesperado al subir la foto",
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
  await requireRole(ROLE_GROUPS.ADMINISTRATION);

  const file = formData.get("file") as File;
  if (!file)
    return { success: false, error: "No se proporcionó ningún archivo" };

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: "La imagen excede el límite de 10 MB" };
  }

  const bucket = PHOTOS_BUCKET;
  const fileExt = file.name.split(".").pop();
  const fileName = `${teacherId}-${Date.now()}.${fileExt}`;
  const filePath = `teachers/${fileName}`;

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

    return { success: true, data: publicUrl };
  } catch (error: any) {
    console.error("Error in uploadTeacherPhoto:", error);
    return {
      success: false,
      error: error.message || "Error inesperado al subir la foto",
    };
  }
}

/**
 * Elimina una foto de Supabase Storage.
 */
export async function deletePhoto(url: string) {
  await requireRole([...ROLE_GROUPS.ADMISSIONS, "DIRECTOR"]);

  if (!url) return { success: true };

  try {
    const parts = url.split(`/${PHOTOS_BUCKET}/`);
    const filePath = parts.pop();

    if (!filePath) {
      return { success: false, error: "URL de foto inválida para eliminación" };
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
