import { prisma } from "@/lib/prisma";
import { DisabilityDetailClient } from "@/components/modules/disabilities/DisabilityDetailClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Detalles Inhabilitación - TerraNova Academy",
  description: "Resolver o ver inhabilitación médica o disciplinaria.",
};

export default async function DisabilityDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const record = await prisma.disabilityRecord.findUnique({
    where: { id: params.id },
    include: {
      enrollment: {
        include: {
          student: true,
          section: { include: { gradeLevel: true } },
        },
      },
    },
  });

  if (!record) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <DisabilityDetailClient record={record} />
    </div>
  );
}
