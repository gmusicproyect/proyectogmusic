import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const root = join(import.meta.dirname, "..");
const analyticsSource = readFileSync(join(root, "utils/analytics.ts"), "utf8");

function readSource(relativePath: string): string {
  return readFileSync(join(root, relativePath), "utf8");
}

function collectSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      collectSourceFiles(fullPath, acc);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".test.ts")) {
      acc.push(fullPath);
    }
  }
  return acc;
}

describe("analytics — PostHog funnel", () => {
  it("exporta las 10 funciones del funnel", () => {
    const fnNames = [
      "demoCtaClicked",
      "semestralCtaClicked",
      "demoLessonCompleted",
      "demoCompleted",
      "gateViewed",
      "planSelected",
      "registroViewed",
      "whatsappCtaClicked",
      "temperamentQuizCompleted",
      "temperamentQuizSkipped",
    ];
    for (const name of fnNames) {
      assert.ok(analyticsSource.includes(`${name}:`), `analytics debe exportar ${name}`);
    }
  });

  it("cada página del funnel importa analytics", () => {
    const pages = [
      "components/music/InteractiveLevelSelector.tsx",
      "App.tsx",
      "pages/DemoLessonPage.tsx",
      "pages/InscripcionGatePage.tsx",
      "pages/InscripcionRegistroPage.tsx",
      "pages/TemperamentQuizPage.tsx",
    ];

    for (const page of pages) {
      const source = readSource(page);
      assert.ok(
        source.includes('from "../utils/analytics"') ||
          source.includes('from "../../utils/analytics"') ||
          source.includes('from "./utils/analytics"'),
        `${page} debe importar analytics`
      );
    }
  });

  it("no hay posthog.capture fuera de analytics.ts en src/app", () => {
    const appDir = join(root);
    const offenders = collectSourceFiles(appDir)
      .filter((file) => relative(appDir, file) !== "utils/analytics.ts")
      .filter((file) => readFileSync(file, "utf8").includes("posthog.capture"))
      .map((file) => relative(appDir, file));

    assert.deepEqual(offenders, []);
  });

  it("main.tsx inicializa posthog con host configurable (US por defecto)", () => {
    const mainSource = readFileSync(join(root, "../main.tsx"), "utf8");
    assert.ok(mainSource.includes("posthog.init"));
    assert.ok(mainSource.includes("VITE_POSTHOG_HOST"));
    assert.ok(mainSource.includes("https://us.i.posthog.com"));
    assert.equal(mainSource.includes("posthog.capture"), false);
  });
});
