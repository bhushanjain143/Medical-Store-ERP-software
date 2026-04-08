import "dotenv/config";
import { defineConfig } from "prisma/config";

function getDatabaseUrl(): string {
  if (process.env.TURSO_DATABASE_URL) {
    const token = process.env.TURSO_AUTH_TOKEN || "";
    return `${process.env.TURSO_DATABASE_URL}?authToken=${token}`;
  }
  return process.env.DATABASE_URL || "file:./dev.db";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: getDatabaseUrl(),
  },
});
