import { PrismaClient } from "@prisma/client";

/**
 * LEGACY / ONE-OFF SCRIPT
 * Script puntual de saneamiento historico.
 * No forma parte del flujo operativo ni del onboarding oficial.
 */
const prisma = new PrismaClient();

async function cleanup() {
  console.log("--- Iniciando limpieza de pagos duplicados ---");

  // Encontrar pagos con monto 0 que probablemente sean duplicados basura
  const batchDelete = await prisma.payment.deleteMany({
    where: {
      amount: 0,
      status: "PENDIENTE",
    },
  });

  console.log(`Se eliminaron ${batchDelete.count} registros con monto S/ 0.00`);

  // (Opcional) Lógica más compleja para duplicados reales si fuera necesario
  // Por ahora el usuario reportó que "se duplicaron muchas", usualmente por el bug del loop.

  console.log("--- Limpieza finalizada ---");
}

cleanup()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
