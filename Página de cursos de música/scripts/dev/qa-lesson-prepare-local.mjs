/**
 * QA visual local — T-UX-LESSON-01A prepare screen.
 * Uso: node scripts/dev/qa-lesson-prepare-local.mjs
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = "http://localhost:5173";
const OUT = "/tmp/gmusic-qa-lesson";
mkdirSync(OUT, { recursive: true });

const completeCalls = [];

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

page.on("request", (req) => {
  const url = req.url();
  if (url.includes("/lesson-sessions/") && url.includes("/complete")) {
    completeCalls.push(`${req.method()} ${url}`);
  }
});

await page.goto(BASE, { waitUntil: "domcontentloaded" });
const activate = await page.evaluate(async () => {
  const res = await fetch("/api/v1/dev/activate-semestral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: "Carlos",
      email: "carlos@gmusic.academy",
      planId: "gmusic-semester-6-months",
    }),
  });
  const access = await fetch("/api/v1/me/access", { credentials: "include" });
  const accessBody = await access.json();
  return {
    status: res.status,
    canAccess: accessBody?.access?.canAccessStudentZone ?? false,
  };
});

await page.goto(`${BASE}/mi-camino`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => document.body.innerText.length > 80, { timeout: 25000 });
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/01-mi-camino.png`, fullPage: true });

const startBtn = page.locator("button").filter({ hasText: /Iniciar lección/i }).first();
if ((await startBtn.count()) === 0) {
  const buttons = await page.locator("button").allTextContents();
  const body = await page.locator("body").innerText();
  writeFileSync(
    `${OUT}/report.json`,
    JSON.stringify({ fail: "no Iniciar lección", activate, buttons, body: body.slice(0, 800) }, null, 2)
  );
  console.log(JSON.stringify({ fail: "no Iniciar lección", buttons }, null, 2));
  await browser.close();
  process.exit(1);
}

completeCalls.length = 0;
await page.evaluate(() => {
  const panelBtn = document.querySelector("button:not(.path-carousel__cta)");
  const candidates = [...document.querySelectorAll("button")].filter((b) =>
    /Iniciar lección/i.test(b.textContent ?? "")
  );
  const stable = candidates.find((b) => !b.classList.contains("path-carousel__cta")) ?? candidates[0];
  stable?.click();
});
await page.waitForTimeout(6000);
await page.screenshot({ path: `${OUT}/02-prepare.png`, fullPage: true });
const prepareText = await page.locator("body").innerText();

const checks = {
  etapaDe5: /Etapa\s+\d+\s+de\s+5/i.test(prepareText),
  stageBars5: (await page.locator('[role="listitem"]').count()) >= 5,
  tabVideo: (await page.getByRole("tab", { name: "Video" }).count()) > 0,
  tabTablatura: (await page.getByRole("tab", { name: "Tablatura" }).count()) > 0,
  tabPdf: (await page.getByRole("tab", { name: "Guía PDF" }).count()) > 0,
  practicaHoy: /Tu práctica de hoy/i.test(prepareText),
  ctaContinuar: /Continuar a la práctica/i.test(prepareText),
  noCompletarClase: !/Completar clase/i.test(prepareText),
  noPlus50: !/\+50\s*XP/i.test(prepareText),
  completeBeforePractice: completeCalls.length === 0,
  hasVideoHero: (await page.locator("iframe").count()) > 0,
};

if (checks.tabTablatura) {
  await page.getByRole("tab", { name: "Tablatura" }).click();
  await page.waitForTimeout(500);
  checks.tablaturaProximamente = /Próximamente/i.test(await page.locator("body").innerText());
  await page.screenshot({ path: `${OUT}/03-tab-tablatura.png`, fullPage: true });
}

if (checks.tabPdf) {
  await page.getByRole("tab", { name: "Guía PDF" }).click();
  await page.waitForTimeout(500);
  const pdfText = await page.locator("body").innerText();
  checks.pdfSinInventar = /No hay guía PDF/i.test(pdfText) || /Ver guía PDF/i.test(pdfText);
  await page.screenshot({ path: `${OUT}/04-tab-pdf.png`, fullPage: true });
}

const markBtn = page.locator("button").filter({ hasText: /terminado de ver|marcado como visto/i });
if (await markBtn.count()) {
  await markBtn.first().click();
  await page.waitForTimeout(600);
}

completeCalls.length = 0;
const continueBtn = page.getByRole("button", { name: "Continuar a la práctica" });
if ((await continueBtn.count()) > 0) {
  if (await continueBtn.isDisabled()) {
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) =>
        /terminado de ver|marcado como visto/i.test(b.textContent ?? "")
      );
      btn?.click();
    });
    await page.waitForTimeout(600);
  }
  await continueBtn.click();
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `${OUT}/05-practice.png`, fullPage: true });
  const practiceText = await page.locator("body").innerText();
  checks.enteredPractice =
    /ejercicio|opción|responder|intenta|Selecciona|Identifica|pregunta/i.test(practiceText);
  checks.completeAfterContinue = completeCalls.length === 0;
}

await page.goto(`${BASE}/mi-camino-demo`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2500);
const demoText = await page.locator("body").innerText();
checks.demoSinPrepare =
  !/Tu práctica de hoy/i.test(demoText) && !/Continuar a la práctica/i.test(demoText);

const allPass = Object.values(checks).every((v) => v === true);
const report = {
  activate,
  checks,
  allPass,
  completeCalls,
  screenshots: OUT,
  prepareSnippet: prepareText.slice(0, 1000),
};
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exit(allPass ? 0 : 2);
