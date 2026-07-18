#!/usr/bin/env node
/**
 * DB-02A — Runner de api:test con blindaje fail-closed.
 *
 * Modos:
 *   (default local)  lee SOLO DATABASE_URL desde .env.ci
 *   GMUSIC_API_TEST_DB=docker  lee SOLO DATABASE_URL desde .env.docker
 *   GITHUB_ACTIONS             usa DATABASE_URL del secret; falta → exit 1
 *
 * Nunca carga .env (producción). Nunca copia JWT/Sentry/VITE/admin al proceso.
 */

import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertSafeDatabaseUrlForTests,
  extractDatabaseUrlFromEnvText,
  redactDatabaseUrl,
} from "./db-env-guard.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function isGitHubActions() {
  return process.env.GITHUB_ACTIONS === "true";
}

/**
 * Carga únicamente DATABASE_URL desde un archivo .env*.
 * @param {string} filePath
 * @returns {string}
 */
function loadDatabaseUrlOnly(filePath) {
  const text = readFileSync(filePath, "utf8");
  const value = extractDatabaseUrlFromEnvText(text);
  if (!value?.trim()) {
    throw new Error(`No hay DATABASE_URL en ${relative(root, filePath)}`);
  }
  return value.trim();
}

function resolveMode() {
  const explicit = (process.env.GMUSIC_API_TEST_DB || "").trim().toLowerCase();
  if (explicit === "docker" || explicit === "local") return "docker";
  if (explicit === "ci" || explicit === "ci-file") return "ci-file";
  if (isGitHubActions()) return "actions";
  return "ci-file";
}

function fail(message) {
  console.error(`\n[DB-02] ${message}\n`);
  process.exit(1);
}

function listApiTestFiles(testsRoot) {
  /** @type {string[]} */
  const out = [];
  /** @param {string} dir */
  function walk(dir) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.name.endsWith(".test.ts")) out.push(relative(root, full));
    }
  }
  walk(testsRoot);
  return out.sort();
}

function main() {
  process.env.NODE_ENV = "test";
  const mode = resolveMode();

  if (mode === "ci-file") {
    const envCi = resolve(root, ".env.ci");
    if (!existsSync(envCi)) {
      fail(
        "Falta .env.ci con DATABASE_URL del proyecto CI (us-east-2). " +
          "Prohibido usar .env (producción).\n" +
          "Ver docs/operations/DB-02-blindaje-entorno-pruebas.md\n" +
          "Alternativa: docker compose up -d && npm run api:test:docker"
      );
    }
    try {
      process.env.DATABASE_URL = loadDatabaseUrlOnly(envCi);
    } catch (err) {
      fail(err instanceof Error ? err.message : String(err));
    }
    try {
      assertSafeDatabaseUrlForTests(process.env.DATABASE_URL, { requireKind: "ci" });
    } catch (err) {
      fail(
        `${err instanceof Error ? err.message : String(err)}\n` +
          ".env.ci debe ser SOLO el proyecto CI canónico (ref + host), nunca producción."
      );
    }
  } else if (mode === "docker") {
    const envDocker = resolve(root, ".env.docker");
    if (existsSync(envDocker)) {
      try {
        process.env.DATABASE_URL = loadDatabaseUrlOnly(envDocker);
      } catch (err) {
        fail(err instanceof Error ? err.message : String(err));
      }
    }
    if (!process.env.DATABASE_URL?.trim()) {
      fail(
        "Modo Docker sin DATABASE_URL. Crea .env.docker con UNA sola línea DATABASE_URL " +
          "hacia localhost:5432/gmusic_learning_db (ver docker-compose.yml). No uses .env."
      );
    }
    try {
      assertSafeDatabaseUrlForTests(process.env.DATABASE_URL, { requireKind: "local" });
    } catch (err) {
      fail(err instanceof Error ? err.message : String(err));
    }
  } else {
    if (!process.env.DATABASE_URL?.trim()) {
      fail(
        "GITHUB_ACTIONS: falta secret DATABASE_URL. " +
          "Configura el secret del proyecto CI (nunca producción). CI no puede quedar verde sin él."
      );
    }
    try {
      assertSafeDatabaseUrlForTests(process.env.DATABASE_URL, { requireKind: "ci" });
    } catch (err) {
      fail(
        `${err instanceof Error ? err.message : String(err)}\n` +
          "El secret DATABASE_URL de GitHub Actions debe ser el proyecto CI canónico."
      );
    }
  }

  console.error(
    `[DB-02] api:test OK — modo=${mode} db=${redactDatabaseUrl(process.env.DATABASE_URL)}`
  );

  const testFiles = listApiTestFiles(resolve(root, "server/tests"));
  if (testFiles.length === 0) {
    fail("No se encontraron server/tests/**/*.test.ts");
  }

  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "--test", "--test-concurrency=1", ...testFiles],
    {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
      stdio: "inherit",
      shell: false,
    }
  );

  if (result.error) {
    fail(`No se pudo lanzar la suite: ${result.error.message}`);
  }
  process.exit(result.status ?? 1);
}

main();
