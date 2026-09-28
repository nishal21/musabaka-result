import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { mkdirSync } from "fs";
import { dirname, join } from "path";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  adminReady?: Promise<void>;
};

function ensureDataDir() {
  const url = process.env.DATABASE_URL ?? "file:../data/musabaka.db";
  if (url.startsWith("file:")) {
    const rel = url.replace(/^file:/, "");
    const abs = join(process.cwd(), "prisma", rel);
    mkdirSync(dirname(abs), { recursive: true });
  }
}

ensureDataDir();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function ensureAdminSeeded() {
  if (!globalForPrisma.adminReady) {
    globalForPrisma.adminReady = (async () => {
      const existing = await prisma.adminCredential.findFirst();
      if (existing) return;
      const { getAdminPasswordForSeed } = await import("@/lib/secrets");
      const passwordHash = await bcrypt.hash(getAdminPasswordForSeed(), 12);
      await prisma.adminCredential.create({ data: { passwordHash } });
    })();
  }
  await globalForPrisma.adminReady;
}
