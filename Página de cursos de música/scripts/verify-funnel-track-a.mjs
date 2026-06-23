#!/usr/bin/env node
/**
 * Verifica wiring mínimo del funnel PostHog (T2).
 * Uso: npm run deploy:verify-funnel
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

console.log("verify-funnel-track-a");

const funnelDoc = join(root, "docs", "deploy", "funnel-events-track-a.md");
if (!existsSync(funnelDoc)) {
  fail("docs/deploy/funnel-events-track-a.md no encontrado");
} else {
  ok("funnel-events-track-a.md presente");
}

const checklist = join(root, "docs", "deploy", "checklist-track-a-t2.md");
if (existsSync(checklist)) ok("checklist-track-a-t2.md presente");
else fail("checklist-track-a-t2.md no encontrado");

const analyticsPath = join(root, "src", "app", "utils", "analytics.ts");
if (!existsSync(analyticsPath)) {
  fail("analytics.ts no encontrado");
} else {
  const analytics = readFileSync(analyticsPath, "utf8");
  const requiredEvents = [
    "pageViewed",
    "demoCtaClicked",
    "demoCompleted",
    "gateViewed",
    "whatsappCtaClicked",
    "temperamentQuizCompleted",
    "$pageview",
  ];
  for (const name of requiredEvents) {
    if (analytics.includes(name)) ok(`analytics — ${name}`);
    else fail(`analytics — falta ${name}`);
  }
}

const appPath = join(root, "src", "app", "App.tsx");
if (!existsSync(appPath)) {
  fail("App.tsx no encontrado");
} else {
  const app = readFileSync(appPath, "utf8");
  if (app.includes("analytics.pageViewed")) ok("App.tsx — pageViewed en cambio de ruta");
  else fail("App.tsx — falta analytics.pageViewed");
}

const mainPath = join(root, "src", "main.tsx");
const main = readFileSync(mainPath, "utf8");
if (main.includes("posthog.init") && main.includes("VITE_POSTHOG_KEY")) {
  ok("main.tsx — init PostHog condicionado a key");
} else {
  fail("main.tsx — init PostHog incompleto");
}

if (failed) {
  console.error("\nverify-funnel-track-a: FALLÓ");
  process.exit(1);
}

console.log("\nverify-funnel-track-a: OK");
