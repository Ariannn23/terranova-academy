import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function checkLogin() {
  const email = "director@terranova.edu.pe";
  const password = "Admin1234!";

  console.log("Checking user:", email);
  console.log("Database URL:", process.env.DATABASE_URL ? "Exists" : "Missing");

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("User not found!");

      const allUsers = await prisma.user.findMany();
      console.log(
        "Existing users in DB:",
        allUsers.map((u) => u.email),
      );
      return;
    }

    console.log("User found:", user.id, user.name);

    const valid = await bcrypt.compare(password, user.passwordHash);
    console.log("Password matching:", valid);
  } catch (e) {
    console.error("Error connecting to DB", e);
  }
}

checkLogin().finally(() => prisma.$disconnect());
