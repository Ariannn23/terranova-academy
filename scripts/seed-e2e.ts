import "dotenv/config";

import { PrismaClient, type PaymentConcept, type Payment } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const e2eDatabaseUrl = process.env.E2E_DATABASE_URL;
const e2ePassword = process.env.E2E_DEFAULT_PASSWORD ?? "E2ePassword123!";

if (!e2eDatabaseUrl) {
  throw new Error(
    "E2E_DATABASE_URL no esta configurada. No se ejecuta seed E2E para evitar tocar otra base.",
  );
}

function assertE2eDbIsIsolated() {
  const runtimeDb = process.env.DATABASE_URL;
  const migrationDb = process.env.MIGRATION_DATABASE_URL;

  if (runtimeDb && e2eDatabaseUrl === runtimeDb) {
    throw new Error(
      "E2E_DATABASE_URL no puede ser igual a DATABASE_URL. Aborta para evitar tocar la base de runtime.",
    );
  }

  if (migrationDb && e2eDatabaseUrl === migrationDb) {
    throw new Error(
      "E2E_DATABASE_URL no puede ser igual a MIGRATION_DATABASE_URL. Aborta para evitar tocar la base de migraciones.",
    );
  }
}

assertE2eDbIsIsolated();

const pool = new Pool({ connectionString: e2eDatabaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const e2eUsers = [
  {
    email: "admin.e2e@terranova.test",
    name: "E2E Admin",
    role: "ADMIN",
    recoveryEmail: "admin.recovery.e2e@example.com",
  },
  {
    email: "director.e2e@terranova.test",
    name: "E2E Directora",
    role: "DIRECTOR",
    recoveryEmail: "director.recovery.e2e@example.com",
  },
  {
    email: "recepcion.e2e@terranova.test",
    name: "E2E Recepcion",
    role: "RECEPCION",
    recoveryEmail: "recepcion.recovery.e2e@example.com",
  },
  {
    email: "caja.e2e@terranova.test",
    name: "E2E Caja",
    role: "CAJA",
    recoveryEmail: "caja.recovery.e2e@example.com",
  },
  {
    email: "docente.e2e@terranova.test",
    name: "E2E Docente",
    role: "DOCENTE",
    recoveryEmail: "docente.recovery.e2e@example.com",
  },
  {
    email: "coordinador.e2e@terranova.test",
    name: "E2E Coordinador",
    role: "COORDINADOR",
    recoveryEmail: "coordinador.recovery.e2e@example.com",
  },
  {
    email: "lockout.e2e@terranova.test",
    name: "E2E Lockout",
    role: "DOCENTE",
    recoveryEmail: "lockout.recovery.e2e@example.com",
  },
] as const;

async function main() {
  console.log("[E2E SEED] Preparando datos aislados para Playwright...");

  const passwordHash = await bcrypt.hash(e2ePassword, 12);

  for (const user of e2eUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        recoveryEmail: user.recoveryEmail,
        passwordHash,
        active: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        recoveryEmail: user.recoveryEmail,
        passwordHash,
        active: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastFailedLoginAt: null,
      },
    });
  }

  const academicYear = await prisma.academicYear.upsert({
    where: { year: 2026 },
    update: {
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-12-20T00:00:00.000Z"),
      active: true,
    },
    create: {
      year: 2026,
      startDate: new Date("2026-03-01T00:00:00.000Z"),
      endDate: new Date("2026-12-20T00:00:00.000Z"),
      active: true,
    },
  });

  const gradeLevel = await prisma.gradeLevel.upsert({
    where: { name: "E2E Inicial Demo" },
    update: {
      level: "INICIAL",
      order: 101,
    },
    create: {
      name: "E2E Inicial Demo",
      level: "INICIAL",
      order: 101,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { email: "docente.e2e@terranova.test" },
    update: {
      dni: "99000001",
      firstName: "E2E",
      lastName: "Docente Demo",
      phone: "999000001",
      specialty: "Comunicacion",
      active: true,
    },
    create: {
      dni: "99000001",
      firstName: "E2E",
      lastName: "Docente Demo",
      email: "docente.e2e@terranova.test",
      phone: "999000001",
      specialty: "Comunicacion",
      active: true,
    },
  });

  const section = await prisma.section.upsert({
    where: {
      gradeLevelId_academicYearId: {
        gradeLevelId: gradeLevel.id,
        academicYearId: academicYear.id,
      },
    },
    update: {
      name: "E2E Seccion A",
      capacity: 30,
      teacherId: teacher.id,
    },
    create: {
      name: "E2E Seccion A",
      gradeLevelId: gradeLevel.id,
      academicYearId: academicYear.id,
      capacity: 30,
      teacherId: teacher.id,
    },
  });

  const course = await prisma.course.upsert({
    where: {
      name_gradeLevelId: {
        name: "E2E Curso Comunicacion",
        gradeLevelId: gradeLevel.id,
      },
    },
    update: {
      hoursPerWeek: 4,
      active: true,
    },
    create: {
      name: "E2E Curso Comunicacion",
      gradeLevelId: gradeLevel.id,
      hoursPerWeek: 4,
      active: true,
    },
  });

  await upsertSchedule({
    sectionId: section.id,
    courseId: course.id,
    teacherId: teacher.id,
  });

  const student = await prisma.student.upsert({
    where: { dni: "99000002" },
    update: {
      code: "E2E-0001",
      firstName: "E2E",
      lastName: "Estudiante Demo",
      birthDate: new Date("2018-05-15T00:00:00.000Z"),
      gender: "F",
      address: "Direccion E2E",
      status: "ACTIVO",
    },
    create: {
      code: "E2E-0001",
      dni: "99000002",
      firstName: "E2E",
      lastName: "Estudiante Demo",
      birthDate: new Date("2018-05-15T00:00:00.000Z"),
      gender: "F",
      address: "Direccion E2E",
      status: "ACTIVO",
    },
  });

  await upsertGuardian(student.id);

  const enrollment = await prisma.enrollment.upsert({
    where: {
      studentId_academicYearId: {
        studentId: student.id,
        academicYearId: academicYear.id,
      },
    },
    update: {
      sectionId: section.id,
      active: true,
      notes: "Matricula seed E2E",
    },
    create: {
      studentId: student.id,
      sectionId: section.id,
      academicYearId: academicYear.id,
      active: true,
      notes: "Matricula seed E2E",
    },
  });

  const enrollmentConcept = await upsertPaymentConcept({
    name: "E2E Matricula",
    type: "MATRICULA",
    amount: 150,
    description: "Concepto de matricula para pruebas E2E",
  });

  const overdueConcept = await upsertPaymentConcept({
    name: "E2E Mensualidad Vencida",
    type: "MENSUALIDAD",
    amount: 300,
    description: "Concepto vencido para pruebas E2E",
  });

  const pendingConcept = await upsertPaymentConcept({
    name: "E2E Mensualidad Pendiente",
    type: "MENSUALIDAD",
    amount: 300,
    description: "Concepto pendiente para pruebas E2E",
  });

  await upsertPayment({
    enrollmentId: enrollment.id,
    concept: enrollmentConcept,
    amount: 150,
    balance: 0,
    status: "PAGADO",
    paidAt: new Date("2026-03-05T10:00:00.000Z"),
    dueDate: new Date("2026-03-05T00:00:00.000Z"),
    method: "EFECTIVO",
  });

  await upsertPayment({
    enrollmentId: enrollment.id,
    concept: overdueConcept,
    amount: 300,
    balance: 300,
    status: "VENCIDO",
    dueDate: new Date("2026-04-10T00:00:00.000Z"),
  });

  await upsertPayment({
    enrollmentId: enrollment.id,
    concept: pendingConcept,
    amount: 300,
    balance: 300,
    status: "PENDIENTE",
    dueDate: new Date("2026-12-10T00:00:00.000Z"),
  });

  await prisma.gradeRecord.upsert({
    where: {
      enrollmentId_courseId_period: {
        enrollmentId: enrollment.id,
        courseId: course.id,
        period: "P1",
      },
    },
    update: {
      score: 16,
      status: "REGISTRADO",
    },
    create: {
      enrollmentId: enrollment.id,
      courseId: course.id,
      period: "P1",
      score: 16,
      status: "REGISTRADO",
    },
  });

  await prisma.attendance.upsert({
    where: {
      enrollmentId_date: {
        enrollmentId: enrollment.id,
        date: new Date("2026-04-15T00:00:00.000Z"),
      },
    },
    update: {
      status: "PRESENTE",
    },
    create: {
      enrollmentId: enrollment.id,
      date: new Date("2026-04-15T00:00:00.000Z"),
      status: "PRESENTE",
    },
  });

  console.log("[E2E SEED] Datos listos.");
  console.log("[E2E SEED] Password local:", e2ePassword);
  console.log("[E2E SEED] Matricula:", enrollment.id);
}

async function upsertGuardian(studentId: string) {
  const existing = await prisma.guardian.findFirst({
    where: { studentId, dni: "99000003" },
  });

  const data = {
    studentId,
    dni: "99000003",
    firstName: "E2E",
    lastName: "Apoderado Demo",
    relation: "Madre",
    phone: "999000003",
    email: "apoderado.e2e@terranova.test",
    address: "Direccion E2E",
    isPrimary: true,
  };

  if (existing) {
    await prisma.guardian.update({ where: { id: existing.id }, data });
    return;
  }

  await prisma.guardian.create({ data });
}

async function upsertSchedule(input: {
  sectionId: string;
  courseId: string;
  teacherId: string;
}) {
  const existing = await prisma.schedule.findFirst({
    where: {
      sectionId: input.sectionId,
      courseId: input.courseId,
      dayOfWeek: 1,
      startTime: "08:00",
    },
  });

  const data = {
    sectionId: input.sectionId,
    courseId: input.courseId,
    teacherId: input.teacherId,
    dayOfWeek: 1,
    startTime: "08:00",
    endTime: "09:30",
  };

  if (existing) {
    await prisma.schedule.update({ where: { id: existing.id }, data });
    return;
  }

  await prisma.schedule.create({ data });
}

async function upsertPaymentConcept(input: {
  name: string;
  type: PaymentConcept["type"];
  amount: number;
  description: string;
}) {
  const existing = await prisma.paymentConcept.findFirst({
    where: { name: input.name },
  });

  const data = {
    name: input.name,
    type: input.type,
    amount: input.amount,
    description: input.description,
    active: true,
  };

  if (existing) {
    return prisma.paymentConcept.update({ where: { id: existing.id }, data });
  }

  return prisma.paymentConcept.create({ data });
}

async function upsertPayment(input: {
  enrollmentId: string;
  concept: PaymentConcept;
  amount: number;
  balance: number;
  status: Payment["status"];
  dueDate: Date;
  paidAt?: Date;
  method?: string;
}) {
  const existing = await prisma.payment.findFirst({
    where: {
      enrollmentId: input.enrollmentId,
      conceptId: input.concept.id,
    },
  });

  const data = {
    enrollmentId: input.enrollmentId,
    conceptId: input.concept.id,
    amount: input.amount,
    balance: input.balance,
    dueDate: input.dueDate,
    paidAt: input.paidAt ?? null,
    status: input.status,
    method: input.method ?? null,
    reference: "E2E-SEED",
    notes: "Pago seed E2E",
  };

  if (existing) {
    return prisma.payment.update({ where: { id: existing.id }, data });
  }

  return prisma.payment.create({ data });
}

main()
  .catch((error) => {
    console.error("[E2E SEED] Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
