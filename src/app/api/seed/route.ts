// API Route temporal para ejecutar el seed desde el browser
// IMPORTANTE: Eliminar este archivo después del primer uso en producción
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Level } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function GET(request: Request) {
  // Guard 1: solo disponible en entornos no-productivos
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  // Guard 2: requiere token secreto como query param
  // Llamada válida: /api/seed?token=TU_SEED_TOKEN
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  if (!token || token !== process.env.SEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // 1. Usuario Admin
    const passwordHash = await bcrypt.hash("Admin1234!", 12);
    const admin = await prisma.user.upsert({
      where: { email: "director@terranova.edu.pe" },
      update: { passwordHash },
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
      message: "✅ Seed completado",
      counts,
      results,
      // ⚠️ Las credenciales NO se devuelven en la respuesta HTTP.
      // Consulta tu .env.local o la documentación interna del proyecto.
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
