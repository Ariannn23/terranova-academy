// prisma/seed.ts — Datos iniciales del sistema TerraNova Academy
// Ejecutar con: npx tsx prisma/seed.ts
import { PrismaClient, Level } from "@prisma/client";
import bcrypt from "bcryptjs";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed de TerraNova Academy...");

  // ─── 1. Usuario Admin ────────────────────────────────────────────────────────
  console.log("👤 Creando usuario administrador...");
  const passwordHash = await bcrypt.hash("Admin1234!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "director@terranova.edu.pe" },
    update: {},
    create: {
      email: "director@terranova.edu.pe",
      passwordHash,
      name: "Director Terranova",
      role: "ADMIN",
    },
  });
  console.log(`   ✅ Admin creado: ${admin.email}`);

  // ─── 2. Año Lectivo 2025 ─────────────────────────────────────────────────────
  console.log("📅 Creando año lectivo 2025...");
  const academicYear = await prisma.academicYear.upsert({
    where: { year: 2025 },
    update: {},
    create: {
      year: 2025,
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-12-20"),
      active: true,
    },
  });
  console.log(
    `   ✅ Año lectivo: ${academicYear.year} (activo: ${academicYear.active})`,
  );

  // ─── 3. Niveles y Grados (14 secciones) ─────────────────────────────────────
  console.log("🏫 Creando niveles y grados...");

  const gradeLevels = [
    // Nivel Inicial (3 grados)
    { name: "1er Año Inicial", level: Level.INICIAL, order: 1 },
    { name: "2do Año Inicial", level: Level.INICIAL, order: 2 },
    { name: "3er Año Inicial", level: Level.INICIAL, order: 3 },
    // Nivel Primaria (6 grados)
    { name: "1er Grado", level: Level.PRIMARIA, order: 4 },
    { name: "2do Grado", level: Level.PRIMARIA, order: 5 },
    { name: "3er Grado", level: Level.PRIMARIA, order: 6 },
    { name: "4to Grado", level: Level.PRIMARIA, order: 7 },
    { name: "5to Grado", level: Level.PRIMARIA, order: 8 },
    { name: "6to Grado", level: Level.PRIMARIA, order: 9 },
    // Nivel Secundaria (5 grados)
    { name: "1ro Secundaria", level: Level.SECUNDARIA, order: 10 },
    { name: "2do Secundaria", level: Level.SECUNDARIA, order: 11 },
    { name: "3ro Secundaria", level: Level.SECUNDARIA, order: 12 },
    { name: "4to Secundaria", level: Level.SECUNDARIA, order: 13 },
    { name: "5to Secundaria", level: Level.SECUNDARIA, order: 14 },
  ];

  for (const gl of gradeLevels) {
    const gradeLevel = await prisma.gradeLevel.upsert({
      where: { name: gl.name },
      update: {},
      create: gl,
    });

    // Crear una sección por grado en el año lectivo activo
    await prisma.section.upsert({
      where: {
        gradeLevelId_academicYearId: {
          gradeLevelId: gradeLevel.id,
          academicYearId: academicYear.id,
        },
      },
      update: {},
      create: {
        name: `Sección A`,
        gradeLevelId: gradeLevel.id,
        academicYearId: academicYear.id,
      },
    });

    console.log(`   ✅ ${gl.name} (${gl.level})`);
  }

  // ─── Resumen ──────────────────────────────────────────────────────────────────
  const totalGrades = await prisma.gradeLevel.count();
  const totalSections = await prisma.section.count();
  const totalUsers = await prisma.user.count();

  console.log("\n📊 Resumen del seed:");
  console.log(`   👤 Usuarios:  ${totalUsers}`);
  console.log(`   📚 Grados:    ${totalGrades}`);
  console.log(`   🏫 Secciones: ${totalSections}`);
  console.log("\n🎉 Seed completado exitosamente!");
  console.log("\n🔑 Credenciales de acceso:");
  console.log("   Email:    director@terranova.edu.pe");
  console.log("   Password: Admin1234!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
