import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("--- ACADEMIC YEARS ---");
  const ay = await prisma.academicYear.findMany();
  console.log(JSON.stringify(ay, null, 2));

  console.log("--- PAYMENT CONCEPTS ---");
  const pc = await prisma.paymentConcept.findMany({ where: { active: true } });
  console.log(JSON.stringify(pc, null, 2));

  console.log("--- LATEST ENROLLMENTS ---");
  const e = await prisma.enrollment.findMany({
    take: 2,
    orderBy: { createdAt: "desc" },
    include: {
      student: true,
      payments: {
        include: { concept: true },
      },
    },
  });
  console.log(JSON.stringify(e, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
