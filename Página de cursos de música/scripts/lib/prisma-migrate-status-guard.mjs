/**
 * T-OPS-MIGRATE-GUARD-01 — fail-closed si prod tiene migraciones Prisma pendientes.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const APP_ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

/** @typedef {{ ok: true, message: string }} MigrateGuardPass */
/** @typedef {{ ok: false, code: string, message: string, pending?: string[] }} MigrateGuardFail */
/** @typedef {MigrateGuardPass | MigrateGuardFail} MigrateGuardResult */

const UP_TO_DATE_RE = /Database schema is up to date!/i;
const PENDING_HEADER_RE = /Following migration[s]? have not yet been applied:/i;

/**
 * @param {string} stdout
 * @param {number} exitCode
 * @param {string} [stderr]
 */
export function parseMigrateStatusOutput(stdout, exitCode, stderr = "") {
  const combined = `${stdout}\n${stderr}`.trim();

  if (exitCode === 0 && UP_TO_DATE_RE.test(stdout)) {
    return {
      ok: true,
      message: "Prisma migrate status — schema alineado (up to date)",
    };
  }

  if (PENDING_HEADER_RE.test(combined)) {
    const pending = [];
    for (const line of combined.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("Following migration")) continue;
      if (/^[\d]{14}_/.test(trimmed)) {
        pending.push(trimmed);
      }
    }
    return {
      ok: false,
      code: "MIGRATE_PENDING",
      message:
        pending.length > 0
          ? `Migraciones Prisma pendientes en prod: ${pending.join(", ")}`
          : "Migraciones Prisma pendientes en prod (ver salida migrate status)",
      pending,
    };
  }

  return {
    ok: false,
    code: "MIGRATE_STATUS_ERROR",
    message:
      combined.length > 0
        ? `prisma migrate status falló (exit ${exitCode})`
        : `prisma migrate status falló (exit ${exitCode}) sin salida`,
  };
}

export function redactDatabaseUrl(databaseUrl) {
  if (!databaseUrl) return "(missing)";
  try {
    const url = new URL(databaseUrl);
    return `postgresql://***@${url.host}${url.pathname}`;
  } catch {
    return "postgresql://***";
  }
}

/**
 * @param {object} [options]
 * @param {string} [options.databaseUrl]
 * @param {boolean} [options.skipGuard]
 * @param {typeof spawnSync} [options.spawnSyncFn]
 * @param {string} [options.cwd]
 */
export function checkProdMigrateGuard(options = {}) {
  const skipGuard = options.skipGuard ?? process.env.SKIP_PROD_MIGRATE_GUARD === "1";
  if (skipGuard) {
    return {
      ok: true,
      message: "SKIP_PROD_MIGRATE_GUARD=1 — guard omitido (solo debug local)",
      skipped: true,
    };
  }

  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim() === "") {
    return {
      ok: false,
      code: "DATABASE_URL_MISSING",
      message:
        "DATABASE_URL ausente — verify prod requiere conexión prod para migrate guard (fail-closed)",
    };
  }

  const spawnSyncFn = options.spawnSyncFn ?? spawnSync;
  const cwd = options.cwd ?? APP_ROOT;
  const result = spawnSyncFn("npx", ["prisma", "migrate", "status"], {
    cwd,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  const exitCode = result.status ?? 1;
  const parsed = parseMigrateStatusOutput(stdout, exitCode, stderr);

  return {
    ...parsed,
    host: redactDatabaseUrl(databaseUrl),
  };
}
