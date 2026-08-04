#!/usr/bin/env node
/**
 * Smoke test de producción Track A (T1).
 * Uso: npm run deploy:verify-production
 *
 * Requiere DATABASE_URL prod para migrate guard (fail-closed si falta).
 * Ejemplo: node --env-file=.env scripts/verify-production-t1.mjs
 *
 * Variables opcionales:
 *   GMUSIC_FRONTEND_URL=https://proyectogmusic.vercel.app
 *   GMUSIC_API_URL=https://gmusic-api.onrender.com
 *   SKIP_PROD_MIGRATE_GUARD=1  — solo debug local (no flujo normal)
 */
import { checkProdMigrateGuard } from "./lib/prisma-migrate-status-guard.mjs";
const FRONTEND = (process.env.GMUSIC_FRONTEND_URL ?? "https://proyectogmusic.vercel.app").replace(
  /\/+$/,
  ""
);
const API = (process.env.GMUSIC_API_URL ?? "https://gmusic-api.onrender.com").replace(/\/+$/, "");

const FRONTEND_ROUTES = [
  "/",
  "/clase-gratuita",
  "/clase-gratuita/3",
  "/inscripcion",
  "/alumno",
  "/mi-camino",
];

let failed = false;

function ok(message) {
  console.log(`  ✔ ${message}`);
}

function fail(message) {
  console.error(`  ✖ ${message}`);
  failed = true;
}

console.log("verify-production-t1");
console.log(`  frontend: ${FRONTEND}`);
console.log(`  api: ${API}\n`);

try {
  const health = await fetch(`${API}/api/v1/health`);
  if (health.status !== 200) {
    fail(`GET /api/v1/health → ${health.status}`);
  } else {
    const body = await health.json();
    if (body.status === "ok" && body.database === "connected") {
      ok("API health — status ok, database connected");
    } else {
      fail(`API health — cuerpo inesperado: ${JSON.stringify(body)}`);
    }
  }
} catch (error) {
  fail(`API health — ${error instanceof Error ? error.message : String(error)}`);
}

const migrateGuard = checkProdMigrateGuard();
if (migrateGuard.skipped) {
  console.warn(`  ⚠ ${migrateGuard.message}`);
} else if (migrateGuard.ok) {
  ok(`${migrateGuard.message} (${migrateGuard.host})`);
} else {
  fail(`${migrateGuard.message}${migrateGuard.host ? ` · host ${migrateGuard.host}` : ""}`);
}

for (const route of FRONTEND_ROUTES) {
  try {
    const response = await fetch(`${FRONTEND}${route}`);
    if (response.status === 200) {
      ok(`Frontend ${route} → 200`);
    } else {
      fail(`Frontend ${route} → ${response.status}`);
    }
  } catch (error) {
    fail(`Frontend ${route} — ${error instanceof Error ? error.message : String(error)}`);
  }
}

try {
  const preflight = await fetch(`${API}/api/v1/onboarding/temperament-quiz`, {
    method: "OPTIONS",
    headers: {
      Origin: FRONTEND,
      "Access-Control-Request-Method": "POST",
    },
  });
  const allowOrigin = preflight.headers.get("access-control-allow-origin");
  if (preflight.status === 204 && allowOrigin === FRONTEND) {
    ok("CORS preflight quiz — Access-Control-Allow-Origin coincide con frontend");
  } else if (preflight.status === 204 && !allowOrigin) {
    fail(
      "CORS preflight quiz — falta Access-Control-Allow-Origin (añade CORS_ALLOWED_ORIGINS en Render y redeploy)"
    );
  } else {
    fail(`CORS preflight quiz — status ${preflight.status}, allow-origin=${allowOrigin ?? "none"}`);
  }
} catch (error) {
  fail(`CORS preflight — ${error instanceof Error ? error.message : String(error)}`);
}

if (failed) {
  console.error("\nverify-production-t1: FALLÓ");
  process.exit(1);
}

console.log("\nverify-production-t1: OK");
