import { beforeEach, describe, expect, it, vi } from "vitest";
import { allowRole } from "@/test/integration/test-auth";

const {
  prismaMock,
  requireRoleMock,
  createAuditLogMock,
  revalidatePathMock,
  uploadMock,
  getPublicUrlMock,
  fromMock,
} = vi.hoisted(() => {
  const uploadMock = vi.fn();
  const getPublicUrlMock = vi.fn();
  const fromMock = vi.fn(() => ({
    upload: uploadMock,
    getPublicUrl: getPublicUrlMock,
    remove: vi.fn(),
  }));

  return {
    prismaMock: {
      student: { update: vi.fn() },
      teacher: { update: vi.fn() },
    },
    requireRoleMock: vi.fn(),
    createAuditLogMock: vi.fn(),
    revalidatePathMock: vi.fn(),
    uploadMock,
    getPublicUrlMock,
    fromMock,
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth", () => ({
  requireRole: requireRoleMock,
  requireAuth: vi.fn(),
  getCurrentUser: vi.fn(),
}));
vi.mock("@/lib/audit", () => ({
  AuditAction: { UPDATE: "UPDATE" },
  AuditEntity: { STUDENT: "STUDENT", TEACHER: "TEACHER" },
  createAuditLog: createAuditLogMock,
}));
vi.mock("@/lib/supabase", () => ({
  PHOTOS_BUCKET: "student-photos",
  supabaseAdmin: {
    storage: {
      from: fromMock,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));

function createFormData(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
}

describe("upload actions integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploadStudentPhoto rechaza archivo invalido antes de llamar Supabase", async () => {
    const { uploadStudentPhoto } = await import("@/lib/actions/upload.actions");
    allowRole(requireRoleMock, "RECEPCION");

    const result = await uploadStudentPhoto(
      "student_1",
      createFormData(new File(["fake"], "foto.pdf", { type: "application/pdf" })),
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain("Tipo de archivo");
    expect(uploadMock).not.toHaveBeenCalled();
    expect(prismaMock.student.update).not.toHaveBeenCalled();
    expect(createAuditLogMock).not.toHaveBeenCalled();
  });

  it("uploadStudentPhoto sube imagen valida con path seguro y audita metadata", async () => {
    const { uploadStudentPhoto } = await import("@/lib/actions/upload.actions");
    allowRole(requireRoleMock, "RECEPCION");
    uploadMock.mockResolvedValue({
      data: { path: "students/student_1-generated.webp" },
      error: null,
    });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: "https://cdn.test/students/student_1-generated.webp" },
    });
    prismaMock.student.update.mockResolvedValue({ id: "student_1" });

    const result = await uploadStudentPhoto(
      "student_1",
      createFormData(new File(["image"], "foto.webp", { type: "image/webp" })),
    );

    expect(result.success).toBe(true);
    expect(uploadMock).toHaveBeenCalled();
    const uploadedPath = uploadMock.mock.calls[0][0] as string;
    expect(uploadedPath).toMatch(/^students\/student_1-[\w-]+\.webp$/);
    expect(uploadedPath).not.toContain("foto.webp");
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "UPDATE",
        entity: "STUDENT",
        entityId: "student_1",
        metadata: expect.objectContaining({
          operation: "upload_student_photo",
          mimeType: "image/webp",
        }),
      }),
    );
  });

  it("uploadTeacherPhoto exige roles administrativos", async () => {
    const { uploadTeacherPhoto } = await import("@/lib/actions/upload.actions");
    allowRole(requireRoleMock, "DIRECTOR");
    uploadMock.mockResolvedValue({
      data: { path: "teachers/teacher_1-generated.png" },
      error: null,
    });
    getPublicUrlMock.mockReturnValue({
      data: { publicUrl: "https://cdn.test/teachers/teacher_1-generated.png" },
    });
    prismaMock.teacher.update.mockResolvedValue({ id: "teacher_1" });

    const result = await uploadTeacherPhoto(
      "teacher_1",
      createFormData(new File(["image"], "docente.png", { type: "image/png" })),
    );

    expect(result.success).toBe(true);
    expect(requireRoleMock).toHaveBeenCalledWith(["ADMIN", "DIRECTOR"]);
    expect(createAuditLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: "TEACHER",
        metadata: expect.objectContaining({
          operation: "upload_teacher_photo",
        }),
      }),
    );
  });
});
