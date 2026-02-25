// lib/supabase.ts — Cliente Supabase para Storage
// Se usa exclusivamente para subir y gestionar archivos (fotos de estudiantes/docentes)
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente público (frontend — respeta RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin (backend — bypassa RLS, úsalo solo en Server Actions/API)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Nombre del bucket de fotos (debe existir en Supabase Storage)
export const PHOTOS_BUCKET = "student-photos";

/**
 * Sube una foto al bucket de Supabase Storage.
 * @returns La URL pública del archivo subido
 */
export async function uploadPhoto(
  file: File,
  folder: "students" | "teachers",
  entityId: string,
): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${entityId}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(PHOTOS_BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(`Error al subir foto: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
