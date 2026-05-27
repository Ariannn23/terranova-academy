import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.BOOTSTRAP_ADMIN_NAME;
const confirm = process.env.BOOTSTRAP_CONFIRM;

if (!connectionString) {
  throw new Error("DATABASE_URL es requerida para bootstrap:admin.");
}

if (confirm !== "true") {
  throw new Error(
    "BOOTSTRAP_CONFIRM debe ser true para ejecutar bootstrap:admin.",
  );
}

if (!email || !password || !name) {
  throw new Error(
    "BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD y BOOTSTRAP_ADMIN_NAME son requeridas.",
  );
}

if (password.length < 12) {
  throw new Error("BOOTSTRAP_ADMIN_PASSWORD debe tener al menos 12 caracteres.");
}

const bootstrapAdmin = {
  email,
  password,
  name,
};

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash(bootstrapAdmin.password, 12);

  const admin = await prisma.user.upsert({
    where: { email: bootstrapAdmin.email },
    update: {
      name: bootstrapAdmin.name,
      role: "ADMIN",
      passwordHash,
    },
    create: {
      email: bootstrapAdmin.email,
      name: bootstrapAdmin.name,
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log("[BOOTSTRAP] Administrador inicial listo.");
  console.log(`[BOOTSTRAP] Email: ${admin.email}`);
  console.log("[BOOTSTRAP] Password: no se imprime por seguridad.");
}

main()
  .catch((error) => {
    console.error("[BOOTSTRAP] Error:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
