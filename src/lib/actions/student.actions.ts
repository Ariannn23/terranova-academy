"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, StudentStatus } from "@prisma/client";
import {
  CreateStudentSchema,
  StudentSchema,
} from "@/lib/validations/student.schema";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/lib/auth";
import { ROLE_GROUPS } from "@/lib/rbac";
import { AuditAction, AuditEntity, createAuditLog } from "@/lib/audit";

export async function getStudents(
  query?: string,
  level?: string,
  status?: string,
) {
  try {
    await requireAuth();

    const where: Prisma.StudentWhereInput = {};

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: "insensitive" } },
        { lastName: { contains: query, mode: "insensitive" } },
        { dni: { contains: query } },
      ];
    }

    if (status) {
      where.status = status as StudentStatus;
    }

    if (level) {
      where.enrollments = {
        some: {
          active: true,
          section: {
            gradeLevel: {
              level: level as any,
            },
          },
        },
      };
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { active: true },
          include: {
            section: { include: { gradeLevel: true } },
          },
        },
      },
      orderBy: { lastName: "asc" },
    });

    return { success: true, data: students };
  } catch (error) {
    console.error("Error listando estudiantes:", error);
    return { success: false, error: "Error al cargar la base de estudiantes" };
  }
}

export type StudentProfileResult = NonNullable<Awaited<ReturnType<typeof getStudentById>>["data"]>;

export async function getStudentById(id: string) {
  try {
    await requireAuth();

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        guardians: true,
        enrollments: {
          where: { active: true },
          include: {
            section: { include: { gradeLevel: true } },
            gradeRecords: {
              include: { course: true },
              orderBy: [{ course: { name: "asc" } }, { period: "asc" }],
            },
            attendances: {
              orderBy: { date: "desc" },
              take: 60,
            },
            payments: {
              include: {
                concept: true,
                transactions: { orderBy: { paidAt: "desc" } },
              },
              orderBy: { dueDate: "desc" },
            },
            incidents: {
              orderBy: { date: "desc" },
            },
            disabilities: {
              orderBy: { startDate: "desc" },
            },
          },
        },
      },
    });

    if (!student) {
      return { success: false, error: "Estudiante no encontrado." };
    }

    return { success: true, data: student };
  } catch (error) {
    console.error("Error obteniendo estudiante:", error);
    return {
      success: false,
      error: "No se pudo cargar el perfil del estudiante.",
    };
  }
}

export async function createStudent(data: unknown) {
  await requireRole(ROLE_GROUPS.ADMISSIONS);

  const parsed = CreateStudentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos de entrada inválidos",
      details: parsed.error.flatten(),
    };
  }

  try {
    const { guardians, ...student } = parsed.data;
    const guardian = guardians[0]; // Tomamos el primer apoderado del wizard/form

    const existing = await prisma.student.findUnique({
      where: { dni: student.dni },
    });
    if (existing) {
      return {
        success: false,
        error: "Ya existe un estudiante registrado con el DNI ingresado.",
      };
    }

    const newStudent = await prisma.student.create({
      data: {
        firstName: student.firstName,
        lastName: student.lastName,
        dni: student.dni,
        birthDate: student.birthDate,
        gender: student.gender,
        address: student.address,
        photoUrl: student.photoUrl,
        status: (student.status as StudentStatus) || "ACTIVO",
        guardians: {
          create: {
            firstName: guardian.firstName,
            lastName: guardian.lastName,
            dni: guardian.dni,
            relation: guardian.relation,
            phone: guardian.phone,
            email: guardian.email,
            isPrimary: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/estudiantes");
    await createAuditLog({
      action: AuditAction.CREATE,
      entity: AuditEntity.STUDENT,
      entityId: newStudent.id,
      newValue: {
        dni: newStudent.dni,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        status: newStudent.status,
      },
      metadata: {
        module: "students",
        guardiansCreated: guardians.length,
      },
    });
    return { success: true, data: newStudent };
  } catch (error) {
    console.error("Error creating student:", error);
    return {
      success: false,
      error: "Error interno del servidor al crear el registro.",
    };
  }
}

export async function updateStudent(id: string, data: unknown) {
  await requireRole(ROLE_GROUPS.ADMISSIONS);

  const parsed = CreateStudentSchema.partial().safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: "Datos inválidos",
      details: parsed.error.flatten(),
    };
  }

  try {
    const { guardians, ...student } = parsed.data;
    const guardian = guardians?.[0];

    const existing = student?.dni
      ? await prisma.student.findUnique({
          where: { dni: student.dni },
        })
      : null;

    if (existing && existing.id !== id) {
      return {
        success: false,
        error: "Ya existe otro estudiante registrado con ese DNI.",
      };
    }

    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: { guardians: true },
    });

    const guardianId = existingStudent?.guardians[0]?.id;

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        firstName: student?.firstName,
        lastName: student?.lastName,
        dni: student?.dni,
        birthDate: student?.birthDate,
        gender: student?.gender,
        address: student?.address,
        photoUrl: student?.photoUrl,
        status: student?.status as StudentStatus,
        guardians:
          guardian && guardianId
            ? {
                update: {
                  where: { id: guardianId },
                  data: {
                    firstName: guardian.firstName,
                    lastName: guardian.lastName,
                    dni: guardian.dni,
                    relation: guardian.relation,
                    phone: guardian.phone,
                    email: guardian.email,
                  },
                },
              }
            : undefined,
      },
    });

    revalidatePath("/dashboard/estudiantes");
    revalidatePath(`/dashboard/estudiantes/${id}`);
    await createAuditLog({
      action: AuditAction.UPDATE,
      entity: AuditEntity.STUDENT,
      entityId: updatedStudent.id,
      oldValue: existingStudent
        ? {
            dni: existingStudent.dni,
            firstName: existingStudent.firstName,
            lastName: existingStudent.lastName,
            status: existingStudent.status,
          }
        : null,
      newValue: {
        dni: updatedStudent.dni,
        firstName: updatedStudent.firstName,
        lastName: updatedStudent.lastName,
        status: updatedStudent.status,
      },
      metadata: {
        module: "students",
      },
    });
    return { success: true, data: updatedStudent };
  } catch (error) {
    console.error("Error updating student:", error);
    return {
      success: false,
      error: "Error interno del servidor al actualizar el registro.",
    };
  }
}

export async function toggleStudentStatus(
  id: string,
  newStatus: StudentStatus,
) {
  try {
    await requireRole([...ROLE_GROUPS.ADMISSIONS, "COORDINADOR"]);

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: { status: newStatus },
    });
    revalidatePath("/dashboard/estudiantes");
    await createAuditLog({
      action: AuditAction.CHANGE_STATUS,
      entity: AuditEntity.STUDENT,
      entityId: updatedStudent.id,
      newValue: { status: updatedStudent.status },
      metadata: {
        module: "students",
        operation: "toggle_student_status",
      },
    });
    return { success: true, data: updatedStudent };
  } catch (error) {
    console.error("Error toggling student status:", error);
    return {
      success: false,
      error: "Error interno del servidor al cambiar el estado del estudiante.",
    };
  }
}
