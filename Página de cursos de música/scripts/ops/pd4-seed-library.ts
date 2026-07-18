#!/usr/bin/env tsx
/**
 * PD-4 — seed controlado del catálogo Biblioteca en DB LOCAL/Docker.
 *
 * Migra el fixture `memory_fixture_h1` a filas LibraryResource(+Link).
 * Idempotente: re-ejecutar deja el mismo estado (upsert + reemplazo de links).
 *
 * Blindaje (mandato PD-4: sin prod, sin push):
 * - Rechaza cualquier DATABASE_URL cuyo host no sea localhost/127.0.0.1.
 * - Si falta DATABASE_URL, intenta leerla SOLO de .env.docker.
 *
 * Uso:
 *   npx dotenv-cli -e .env.docker -- tsx scripts/ops/pd4-seed-library.ts
 *   # o con DATABASE_URL local ya exportada:
 *   tsx scripts/ops/pd4-seed-library.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { seedLibraryCatalogH1 } from "../../server/lib/librarySeedH1.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function loadDatabaseUrlFromDockerEnv(): string | undefined {
  const envDocker = resolve(root, ".env.docker");
  if (!existsSync(envDocker)) return undefined;
  const text = readFileSync(envDocker, "utf8");
  const match = text.match(/^\s*DATABASE_URL\s*=\s*(.+)\s*$/m);
  if (!match) return undefined;
  return match[1].trim().replace(/^["']|["']$/g, "");
}

const databaseUrl = process.env.DATABASE_URL?.trim() || loadDatabaseUrlFromDockerEnv();
if (!databaseUrl) {
  console.error(
    "[PD-4] Falta DATABASE_URL local. Exporta una hacia localhost o crea .env.docker."
  );
  process.exit(1);
}

const host = databaseUrl.match(/@([^:/]+)/)?.[1] ?? "";
if (host !== "localhost" && host !== "127.0.0.1") {
  console.error(`[PD-4] REHUSANDO host no local: ${host || "(desconocido)"}. Solo local/Docker.`);
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

try {
  const result = await seedLibraryCatalogH1(prisma);
  const [published, links] = await Promise.all([
    prisma.libraryResource.count({ where: { status: "PUBLISHED" } }),
    prisma.libraryResourceLink.count(),
  ]);
  console.log(
    JSON.stringify(
      {
        host,
        seeded: result,
        dbCounts: { publishedResources: published, links },
        idempotent: "re-ejecutar deja el mismo estado",
      },
      null,
      2
    )
  );
} finally {
  await prisma.$disconnect();
}
