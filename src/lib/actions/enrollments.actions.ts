"use server";

import { prisma } from "@/lib/prisma";

export async function getWizardData() {
  try {
    const students = await prisma.student.findMany({
      where: { status: "ACTIVO" },
      orderBy: { lastName: "asc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dni: true,
        photoUrl: true,
        enrollments: {
          where: { active: true },
          select: { id: true },
        },
      },
    });

    const academicYears = await prisma.academicYear.findMany({
      where: { active: true },
      orderBy: { year: "desc" },
    });

    // Only return students without an active enrollment
    const eligibleStudents = students.filter((s) => s.enrollments.length === 0);

    const sections = await prisma.section.findMany({
      where: {
        academicYearId: academicYears[0]?.id,
      },
      include: {
        gradeLevel: true,
        _count: {
          select: { enrollments: { where: { active: true } } },
        },
      },
      orderBy: [{ gradeLevel: { order: "asc" } }, { name: "asc" }],
    });

    const mappedSections = sections.map((s) => ({
      id: s.id,
      name: s.name,
      capacity: 30, // Defecto si no existe en BD
      occupied: s._count.enrollments,
      gradeLevelId: s.gradeLevelId,
      grade: s.gradeLevel.name,
      level: s.gradeLevel.level,
    }));

    return {
      success: true,
      data: {
        students: eligibleStudents,
        sections: mappedSections,
        academicYears,
      },
    };
  } catch (error) {
    console.error("Error obteniendo datos del wizard:", error);
    return { success: false, error: "Error de conexión al cargar datos base." };
  }
}

export async function createEnrollment(
  studentId: string,
  sectionId: string,
  academicYearId: string,
) {
  try {
    // 1. Transaction to handle enrollment and payment generation safely
    const result = await prisma.$transaction(async (tx) => {
      const active = await tx.enrollment.findFirst({
        where: { studentId, active: true },
      });

      if (active) {
        throw new Error("El estudiante ya tiene una matrícula activa.");
      }

      // Process student code generation if missing
      const student = await tx.student.findUnique({
        where: { id: studentId },
      });
      if (student && !student.code) {
        const yearRecord = await tx.academicYear.findUnique({
          where: { id: academicYearId },
        });
        const sectionRecord = await tx.section.findUnique({
          where: { id: sectionId },
          include: { gradeLevel: true },
        });

        if (yearRecord && sectionRecord) {
          const year = yearRecord.year;
          const level = sectionRecord.gradeLevel.level; // INICIAL, PRIMARIA, SECUNDARIA
          const levelCode =
            level === "INICIAL" ? "I" : level === "PRIMARIA" ? "P" : "S";
          const prefix = `${year}${levelCode}`;

          // Get count of students with this prefix to calculate the incremental ID
          const existingCount = await tx.student.count({
            where: { code: { startsWith: prefix } },
          });

          const newId = (existingCount + 1).toString().padStart(4, "0");
          const generatedCode = `${prefix}${newId}`;

          await tx.student.update({
            where: { id: studentId },
            data: { code: generatedCode },
          });
        }
      }

      const enrollment = await tx.enrollment.create({
        data: {
          studentId,
          sectionId,
          academicYearId,
          active: true,
        },
      });

      // --- Generación Automática de Cuotas ---
      // 1. Asegurar que existan conceptos base
      let matriculaConcept = await tx.paymentConcept.findFirst({
        where: { name: "Derecho de Matrícula" },
      });
      if (!matriculaConcept) {
        matriculaConcept = await tx.paymentConcept.create({
          data: {
            name: "Derecho de Matrícula",
            type: "MATRICULA",
            amount: 250, // Default configurable
            description: "Pago anual por derecho de inscripción",
          },
        });
      }

      let pensionConcept = await tx.paymentConcept.findFirst({
        where: { name: "Pensión Mensual" },
      });
      if (!pensionConcept) {
        pensionConcept = await tx.paymentConcept.create({
          data: {
            name: "Pensión Mensual",
            type: "MENSUALIDAD",
            amount: 300, // Default configurable
            description: "Mensualidad regular",
          },
        });
      }

      // 2. Obtener el año académico para las fechas
      const yearRecord = await tx.academicYear.findUnique({
        where: { id: academicYearId },
      });
      const currentYear = yearRecord
        ? yearRecord.year
        : new Date().getFullYear();

      // 3. Crear los 11 pagos (1 matrícula + 10 pensiones)
      const paymentsToCreate = [];

      // Matrícula (vence al inicio de clases/marzo)
      paymentsToCreate.push({
        enrollmentId: enrollment.id,
        conceptId: matriculaConcept.id,
        amount: matriculaConcept.amount,
        dueDate: new Date(`${currentYear}-03-05T12:00:00Z`), // 5 de marzo
      });

      // 10 Mensualidades (Marzo a Diciembre)
      for (let month = 3; month <= 12; month++) {
        // Vencimiento los 5 de cada mes
        const dueDate = new Date(
          `${currentYear}-${month.toString().padStart(2, "0")}-05T12:00:00Z`,
        );

        paymentsToCreate.push({
          enrollmentId: enrollment.id,
          conceptId: pensionConcept.id,
          amount: pensionConcept.amount,
          dueDate: dueDate,
        });
      }

      // Insertar en bloque
      await tx.payment.createMany({
        data: paymentsToCreate,
      });

      return enrollment;
    });

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creando matrícula:", error);
    return {
      success: false,
      error: error.message || "Error en el servidor al matricular al alumno.",
    };
  }
}

export async function getEnrollments() {
  try {
    const enrollments = await prisma.enrollment.findMany({
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            dni: true,
            photoUrl: true,
          },
        },
        section: { include: { gradeLevel: true } },
        academicYear: true,
      },
      orderBy: { enrollDate: "desc" },
    });

    return { success: true, data: enrollments };
  } catch (error) {
    console.error("Error obteniendo matrículas:", error);
    return {
      success: false,
      error: "Error interno del servidor al obtener matrículas.",
    };
  }
}

export async function toggleEnrollmentStatus(id: string, newStatus: boolean) {
  try {
    const updatedEnrollment = await prisma.enrollment.update({
      where: { id },
      data: { active: newStatus },
    });
    return { success: true, data: updatedEnrollment };
  } catch (error) {
    console.error("Error toggling enrollment status:", error);
    return {
      success: false,
      error: "Error interno del servidor al cambiar el estado de la matrícula.",
    };
  }
}

export async function getEnrollmentById(id: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: true,
        section: {
          include: { gradeLevel: true },
        },
        academicYear: true,
        payments: {
          include: { concept: true },
          orderBy: { dueDate: "asc" },
        },
        gradeRecords: {
          include: { course: true },
        },
      },
    });

    if (!enrollment) {
      return { success: false, error: "Matrícula no encontrada" };
    }

    return { success: true, data: enrollment };
  } catch (error) {
    console.error("Error obteniendo detalle de matrícula:", error);
    return {
      success: false,
      error: "Error interno del servidor al obtener la matrícula.",
    };
  }
}
