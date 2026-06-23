#!/usr/bin/env node
/**
 * Verifica que la config mínima de deploy Track A esté presente.
 * Uso: npm run deploy:verify-config
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
let failed = false;

function ok(message) {
  console.log(`  ✔ ${message}`);
}

function fail(message) {
  console.error(`  ✖ ${message}`);
  failed = true;
}

console.log("verify-deploy-track-a");

const vercelPath = join(root, "vercel.json");
if (!existsSync(vercelPath)) {
  fail("vercel.json no encontrado");
} else {
  const vercel = JSON.parse(readFileSync(vercelPath, "utf8"));
  const rewrites = vercel.rewrites ?? [];
  const hasSpaRewrite = rewrites.some(
    (r) => r.destination === "/index.html" || r.destination?.endsWith("/index.html")
  );
  if (hasSpaRewrite) ok("vercel.json — rewrite SPA a index.html");
  else fail("vercel.json — falta rewrite /* → /index.html");
}

const redirectsPath = join(root, "public", "_redirects");
if (!existsSync(redirectsPath)) {
  fail("public/_redirects no encontrado (Netlify / Cloudflare Pages)");
} else {
  const redirects = readFileSync(redirectsPath, "utf8");
  if (redirects.includes("/index.html")) ok("public/_redirects — fallback SPA");
  else fail("public/_redirects — falta regla hacia index.html");
}

const migrationDir = join(
  root,
  "prisma",
  "migrations",
  "20260622143000_onboarding_analytics",
  "migration.sql"
);
if (!existsSync(migrationDir)) {
  fail("migración 20260622143000_onboarding_analytics no encontrada");
} else {
  const sql = readFileSync(migrationDir, "utf8");
  if (sql.includes("onboarding_analytics")) ok("migración onboarding_analytics presente");
  else fail("migración onboarding_analytics — SQL inesperado");
}

const checklist = join(root, "docs", "deploy", "checklist-track-a.md");
if (existsSync(checklist)) ok("docs/deploy/checklist-track-a.md");
else fail("checklist-track-a.md no encontrado");

if (failed) {
  console.error("\nverify-deploy-track-a: FALLÓ");
  process.exit(1);
}

console.log("\nverify-deploy-track-a: OK");
