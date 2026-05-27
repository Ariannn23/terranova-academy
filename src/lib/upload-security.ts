import { randomUUID } from "crypto";

export const MAX_UPLOAD_IMAGE_SIZE = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

const EXTENSION_BY_MIME: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const SUSPICIOUS_EXTENSIONS = new Set([
  "bat",
  "cmd",
  "exe",
  "html",
  "js",
  "pdf",
  "php",
  "ps1",
  "sh",
  "svg",
]);

export type UploadValidationResult =
  | { success: true; extension: string }
  | { success: false; error: string };

function getExtension(fileName: string) {
  const trimmed = fileName.trim().toLowerCase();
  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot === -1) return "";
  return trimmed.slice(lastDot);
}

function hasSuspiciousDoubleExtension(fileName: string) {
  const parts = fileName.trim().toLowerCase().split(".");
  if (parts.length <= 2) return false;
  return parts.slice(1, -1).some((part) => SUSPICIOUS_EXTENSIONS.has(part));
}

export function validateImageUploadFile(file: File): UploadValidationResult {
  if (!file) return { success: false, error: "No se proporciono ningun archivo" };
  if (!file.type) return { success: false, error: "El archivo no tiene MIME valido" };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { success: false, error: "Tipo de archivo no permitido" };
  }
  if (file.size > MAX_UPLOAD_IMAGE_SIZE) {
    return { success: false, error: "El archivo supera el tamano maximo permitido" };
  }
  if (!file.name || /[\\/]/.test(file.name)) {
    return { success: false, error: "Nombre de archivo invalido" };
  }
  if (hasSuspiciousDoubleExtension(file.name)) {
    return { success: false, error: "Nombre de archivo sospechoso" };
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return { success: false, error: "Extension de archivo no permitida" };
  }
  if (!EXTENSION_BY_MIME[file.type]?.includes(extension)) {
    return { success: false, error: "La extension no coincide con el tipo de archivo" };
  }

  return { success: true, extension };
}

export function createSafeUploadPath(
  folder: "students" | "teachers",
  entityId: string,
  extension: string,
) {
  const safeEntityId = entityId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `${folder}/${safeEntityId}-${randomUUID()}${extension}`;
}
