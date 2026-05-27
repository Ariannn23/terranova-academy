import "dotenv/config";

import { Level, PrismaClient, type PaymentConcept } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL no esta configurada. No se ejecuta seed base.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const gradeLevels = [
  { name: "1er Ano Inicial", level: Level.INICIAL, order: 1 },
  { name: "2do Ano Inicial", level: Level.INICIAL, order: 2 },
  { name: "3er Ano Inicial", level: Level.INICIAL, order: 3 },
  { name: "1er Grado Primaria", level: Level.PRIMARIA, order: 4 },
  { name: "2do Grado Primaria", level: Level.PRIMARIA, order: 5 },
  { name: "3er Grado Primaria", level: Level.PRIMARIA, order: 6 },
  { name: "4to Grado Primaria", level: Level.PRIMARIA, order: 7 },
  { name: "5to Grado Primaria", level: Level.PRIMARIA, order: 8 },
  { name: "6to Grado Primaria", level: Level.PRIMARIA, order: 9 },
  { name: "1ro Secundaria", level: Level.SECUNDARIA, order: 10 },
  { name: "2do Secundaria", level: Level.SECUNDARIA, order: 11 },
  { name: "3ro Secundaria", level: Level.SECUNDARIA, order: 12 },
  { name: "4to Secundaria", level: Level.SECUNDARIA, order: 13 },
  { name: "5to Secundaria", level: Level.SECUNDARIA, order: 14 },
] as const;

const basePaymentConcepts = [
  {
    name: "Matricula",
    type: "MATRICULA",
    amount: 250,
    description: "Pago base de matricula escolar",
  },
  {
    name: "Mensualidad",
    type: "MENSUALIDAD",
    amount: 350,
    description: "Pago base de mensualidad escolar",
  },
  {
    name: "Examen",
    type: "EXAMEN",
    amount: 50,
    description: "Pago base para evaluaciones especiales",
  },
] satisfies Array<{
  name: string;
  type: PaymentConcept["type"];
  amount: number;
  description: string;
}>;

async function main() {
  console.log("[SEED] Iniciando seed base de TerraNova Academy...");

  const academicYear = await prisma.academicYear.upsert({
    where: { year: 2025 },
    update: {
      startDate: new Date("2025-03-01T00:00:00.000Z"),
      endDate: new Date("2025-12-20T00:00:00.000Z"),
      active: true,
    },
    create: {
      year: 2025,
      startDate: new Date("2025-03-01T00:00:00.000Z"),
      endDate: new Date("2025-12-20T00:00:00.000Z"),
      active: true,
    },
  });

  for (const grade of gradeLevels) {
    const gradeLevel = await prisma.gradeLevel.upsert({
      where: { name: grade.name },
      update: {
        level: grade.level,
        order: grade.order,
      },
      create: grade,
    });

    await prisma.section.upsert({
      where: {
        gradeLevelId_academicYearId: {
          gradeLevelId: gradeLevel.id,
          academicYearId: academicYear.id,
        },
      },
      update: {
        name: "Seccion A",
        capacity: 30,
      },
      create: {
        name: "Seccion A",
        gradeLevelId: gradeLevel.id,
        academicYearId: academicYear.id,
        capacity: 30,
      },
    });

    console.log(`[SEED] Grado listo: ${grade.name}`);
  }

  for (const concept of basePaymentConcepts) {
    await upsertPaymentConcept(concept);
    console.log(`[SEED] Concepto de pago listo: ${concept.name}`);
  }

  console.log("[SEED] Seed base completado.");
  console.log(
    "[SEED] Para crear el primer administrador real use: npm run bootstrap:admin",
  );
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
    await prisma.paymentConcept.update({ where: { id: existing.id }, data });
    return;
  }

  await prisma.paymentConcept.create({ data });
}

main()
  .catch((error) => {
    console.error("[SEED] Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
