import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ConfiguracionClient from "@/components/modules/configuracion/ConfiguracionClient";

export const metadata: Metadata = {
  title: "Configuración | TerraNova Academy",
  description: "Gestión de configuración general del sistema académico.",
};

export const dynamic = "force-dynamic";

export default async function ConfiguracionPage() {
  const activeYear = await prisma.academicYear.findFirst({
    where: { active: true },
    include: {
      sections: {
        include: { gradeLevel: true },
      },
      _count: {
        select: { enrollments: true },
      },
    },
  });

  return <ConfiguracionClient activeYear={activeYear} />;
}
