// API Route temporal para ejecutar el seed desde el browser
// IMPORTANTE: Eliminar este archivo después del primer uso en producción
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Level } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const results: string[] = [];

    // 1. Usuario Admin
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
    results.push(`✅ Admin: ${admin.email}`);

    // 2. Año Lectivo 2025
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
    results.push(`✅ Año lectivo: ${academicYear.year}`);

    // 3. Niveles y Grados
    const gradeLevels = [
      { name: "1er Año Inicial", level: Level.INICIAL, order: 1 },
      { name: "2do Año Inicial", level: Level.INICIAL, order: 2 },
      { name: "3er Año Inicial", level: Level.INICIAL, order: 3 },
      { name: "1er Grado", level: Level.PRIMARIA, order: 4 },
      { name: "2do Grado", level: Level.PRIMARIA, order: 5 },
      { name: "3er Grado", level: Level.PRIMARIA, order: 6 },
      { name: "4to Grado", level: Level.PRIMARIA, order: 7 },
      { name: "5to Grado", level: Level.PRIMARIA, order: 8 },
      { name: "6to Grado", level: Level.PRIMARIA, order: 9 },
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
      await prisma.section.upsert({
        where: {
          gradeLevelId_academicYearId: {
            gradeLevelId: gradeLevel.id,
            academicYearId: academicYear.id,
          },
        },
        update: {},
        create: {
          name: "Sección A",
          gradeLevelId: gradeLevel.id,
          academicYearId: academicYear.id,
        },
      });
      results.push(`✅ ${gl.name} (${gl.level})`);
    }

    const counts = {
      users: await prisma.user.count(),
      grades: await prisma.gradeLevel.count(),
      sections: await prisma.section.count(),
    };

    return NextResponse.json({
      success: true,
      message: "🎉 Seed completado",
      counts,
      results,
      login: {
        email: "director@terranova.edu.pe",
        password: "Admin1234!",
      },
    });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
