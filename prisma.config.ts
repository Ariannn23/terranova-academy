import { defineConfig } from "@prisma/config";
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
