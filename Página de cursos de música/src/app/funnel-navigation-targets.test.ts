import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Oleada C · C1 — Guard anti-callejones del funnel Track A.
 * Todo target literal de navegación en las páginas del funnel debe existir
 * como página renderizada en App.tsx (o caer en el handler demo-clase-1..5).
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p: string) => readFileSync(path.join(here, p), "utf8");

const FUNNEL_SOURCES = [
  "pages/GmusicLanding.tsx",
  "pages/RegistroCuentaPage.tsx",
  "pages/TemperamentQuizPage.tsx",
  "pages/OnboardingAcademiaPage.tsx",
  "pages/PathDemoPage.tsx",
  "pages/DemoLessonPage.tsx",
  "pages/InscripcionGatePage.tsx",
  "pages/InscripcionRegistroPage.tsx",
  "components/marketing/AcademiaOnboardingWizard.tsx",
  "components/music/InteractiveLevelSelector.tsx",
];

const DEMO_CLASE = new Set(["demo-clase-1", "demo-clase-2", "demo-clase-3", "demo-clase-4", "demo-clase-5"]);

function literalTargets(source: string): string[] {
  const out: string[] = [];
  const re = /(?:setPage|handlePageChange)\(\s*"([a-z0-9-]+)"\s*\)/g;
  for (const m of source.matchAll(re)) out.push(m[1]);
  return out;
}

describe("C1 — funnel sin rutas huérfanas", () => {
  const appSource = read("App.tsx");
  const rendered = new Set(
    [...appSource.matchAll(/currentPage === "([a-z0-9-]+)"/g)].map((m) => m[1])
  );

  it("App.tsx maneja demo-clase-1..5 por regex", () => {
    assert.match(appSource, /demo-clase-\(\[1-5\]\)/);
  });

  for (const file of FUNNEL_SOURCES) {
    it(`${file}: todos sus targets literales renderizan`, () => {
      const targets = literalTargets(read(file));
      for (const target of targets) {
        const ok = rendered.has(target) || DEMO_CLASE.has(target);
        assert.ok(ok, `target huérfano "${target}" en ${file}`);
      }
    });
  }
});
