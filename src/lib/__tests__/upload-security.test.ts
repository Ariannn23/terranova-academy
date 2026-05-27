import { describe, expect, it } from "vitest";

import {
  createSafeUploadPath,
  MAX_UPLOAD_IMAGE_SIZE,
  validateImageUploadFile,
} from "@/lib/upload-security";

function makeFile(name: string, type: string, size = 1024) {
  return new File([new Uint8Array(size)], name, { type });
}

describe("validateImageUploadFile", () => {
  it("acepta JPEG, PNG y WEBP validos", () => {
    expect(validateImageUploadFile(makeFile("foto.jpg", "image/jpeg")).success).toBe(true);
    expect(validateImageUploadFile(makeFile("foto.png", "image/png")).success).toBe(true);
    expect(validateImageUploadFile(makeFile("foto.webp", "image/webp")).success).toBe(true);
  });

  it("rechaza PDF si se intenta subir como foto", () => {
    expect(validateImageUploadFile(makeFile("foto.pdf", "application/pdf")).success).toBe(false);
  });

  it("rechaza ejecutables", () => {
    expect(validateImageUploadFile(makeFile("foto.exe", "application/octet-stream")).success).toBe(false);
  });

  it("rechaza archivos mayores a 10MB", () => {
    const file = makeFile("foto.jpg", "image/jpeg", MAX_UPLOAD_IMAGE_SIZE + 1);
    expect(validateImageUploadFile(file).success).toBe(false);
  });

  it("rechaza doble extension sospechosa", () => {
    const file = makeFile("foto.php.jpg", "image/jpeg");
    expect(validateImageUploadFile(file).success).toBe(false);
  });

  it("rechaza archivo sin MIME", () => {
    const file = makeFile("foto.jpg", "");
    expect(validateImageUploadFile(file).success).toBe(false);
  });

  it("rechaza extension que no coincide con MIME", () => {
    const file = makeFile("foto.png", "image/jpeg");
    expect(validateImageUploadFile(file).success).toBe(false);
  });
});

describe("createSafeUploadPath", () => {
  it("genera rutas sin reutilizar el nombre original", () => {
    const path = createSafeUploadPath("students", "student/../1", ".jpg");

    expect(path).toMatch(/^students\/student1-[\w-]+\.jpg$/);
    expect(path).not.toContain("..");
  });
});
