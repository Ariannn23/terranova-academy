// lib/prisma.ts — Singleton del cliente Prisma
// Evita múltiples instancias en desarrollo (hot-reload de Next.js)
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Definimos el tipo concreto del cliente con la config de logs declarada,
// de forma que TypeScript reconozca los overloads de $on('query').
// Sin esto, el ?? operator amplía el tipo a PrismaClient genérico y pierde
// los overloads tipados necesarios para $on('query', (QueryEvent) => void).
function createPrismaClient(adapter: PrismaPg) {
  return new PrismaClient({
    adapter,
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });
}

type PrismaClientWithEvents = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientWithEvents | undefined;
  pool: Pool | undefined;
  // Flag para evitar registrar el listener $on('query') más de una vez
  // en desarrollo (Next.js re-evalúa el módulo en cada hot-reload).
  listenerRegistered: boolean | undefined;
};

const connectionString = process.env.DATABASE_URL;

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

const adapter = new PrismaPg(pool);

export const prisma: PrismaClientWithEvents =
  globalForPrisma.prisma ?? createPrismaClient(adapter);

// Loggear queries lentas (>100ms) en consola del servidor.
// El flag `listenerRegistered` evita que $on() se llame múltiples veces
// cuando Next.js re-evalúa este módulo en hot-reload, lo que causaría
// que cada query aparezca N veces en los logs (una por recarga).
if (!globalForPrisma.listenerRegistered) {
  prisma.$on("query", (e) => {
    if (e.duration > 100) {
      console.warn(
        `[SLOW QUERY] ${e.duration}ms\n  Query: ${e.query}\n  Params: ${e.params}`,
      );
    }
  });
  globalForPrisma.listenerRegistered = true;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
