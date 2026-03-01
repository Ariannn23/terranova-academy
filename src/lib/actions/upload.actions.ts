"use server";

import { supabaseAdmin, PHOTOS_BUCKET } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Sube la foto de un estudiante a Supabase Storage y actualiza su registro.
 */
export async function uploadStudentPhoto(
  studentId: string,
  formData: FormData,
) {
  const file = formData.get("file") as File;
  if (!file)
    return { success: false, error: "No se proporcionó ningún archivo" };

  const bucket = PHOTOS_BUCKET;
  const fileExt = file.name.split(".").pop();
  const fileName = `${studentId}-${Date.now()}.${fileExt}`;
  const filePath = `students/${fileName}`;

  try {
    // 1. Subir a Supabase Storage (usando admin para bypass RLS si es necesario)
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    // 2. Obtener URL pública
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);

    // 3. Actualizar el perfil del estudiante en la base de datos
    await prisma.student.update({
      where: { id: studentId },
      data: { photoUrl: publicUrl },
    });

    revalidatePath("/dashboard/estudiantes");
    revalidatePath(`/dashboard/estudiantes/${studentId}`);

    return { success: true, data: publicUrl };
  } catch (error) {
    console.error("Error in uploadStudentPhoto:", error);
    return { success: false, error: "Error al subir la foto" };
  }
}

/**
 * Sube la foto de un docente a Supabase Storage y actualiza su registro.
 */
export async function uploadTeacherPhoto(
  teacherId: string,
  formData: FormData,
) {
  const file = formData.get("file") as File;
  if (!file)
    return { success: false, error: "No se proporcionó ningún archivo" };

  const bucket = PHOTOS_BUCKET;
  const fileExt = file.name.split(".").pop();
  const fileName = `${teacherId}-${Date.now()}.${fileExt}`;
  const filePath = `teachers/${fileName}`;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

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
  } catch (error) {
    console.error("Error in uploadTeacherPhoto:", error);
    return { success: false, error: "Error al subir la foto" };
  }
}

/**
 * Elimina una foto de Supabase Storage.
 */
export async function deletePhoto(url: string) {
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
