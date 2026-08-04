import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CLASE_GRATUITA_MAP_PAGE,
  claseGratuitaLessonPage,
} from "./utils/clase-gratuita-routing";

/**
 * Oleada C · C1 — Guard anti-callejones del funnel Track A.
 * Todo target literal de navegación en las páginas del funnel debe existir
 * como página renderizada en App.tsx (o caer en el handler clase-gratuita-N).
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

const CLASE_GRATUITA_LESSONS = new Set([
  claseGratuitaLessonPage(1),
  claseGratuitaLessonPage(2),
  claseGratuitaLessonPage(3),
  claseGratuitaLessonPage(4),
  claseGratuitaLessonPage(5),
]);

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
  if (appSource.includes("currentPage === CLASE_GRATUITA_MAP_PAGE")) {
    rendered.add(CLASE_GRATUITA_MAP_PAGE);
  }

  it("App.tsx maneja clase-gratuita-1..5 vía parseClaseGratuitaLessonPage", () => {
    assert.match(appSource, /parseClaseGratuitaLessonPage\(currentPage\)/);
  });

  it(`App.tsx renderiza mapa ${CLASE_GRATUITA_MAP_PAGE}`, () => {
    assert.equal(rendered.has(CLASE_GRATUITA_MAP_PAGE), true);
  });

  for (const file of FUNNEL_SOURCES) {
    it(`${file}: todos sus targets literales renderizan`, () => {
      const targets = literalTargets(read(file));
      for (const target of targets) {
        const ok =
          rendered.has(target) ||
          CLASE_GRATUITA_LESSONS.has(target) ||
          target === CLASE_GRATUITA_MAP_PAGE;
        assert.ok(ok, `target huérfano "${target}" en ${file}`);
      }
    });
  }
});
