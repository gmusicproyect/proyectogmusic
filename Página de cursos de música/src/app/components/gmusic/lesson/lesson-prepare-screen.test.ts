import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const prepareSource = readFileSync(join(root, "LessonPrepareScreen.tsx"), "utf8");
const runnerSource = readFileSync(join(root, "../path/PathLessonRunner.tsx"), "utf8");
const tabsSource = readFileSync(join(root, "LessonMaterialTabs.tsx"), "utf8");

describe("T-UX-LESSON-01A — pantalla prepare", () => {
  it("LessonPrepareScreen usa barras de etapa y checklist mock", () => {
    assert.match(prepareSource, /LessonStageIndicator/);
    assert.match(prepareSource, /LessonPracticeChecklist/);
    assert.match(prepareSource, /Continuar a la práctica/);
    assert.equal(prepareSource.includes("Completar clase"), false);
    assert.equal(prepareSource.includes("completeLessonSession"), false);
  });

  it("tabs: tablatura próximamente y PDF condicional", () => {
    assert.match(tabsSource, /Próximamente/);
    assert.match(tabsSource, /guidePdfUrl/);
    assert.match(tabsSource, /Ver guía PDF/);
  });

  it("PathLessonRunner integra prepare antes del runner evaluado", () => {
    assert.match(runnerSource, /LessonPrepareScreen/);
    assert.match(runnerSource, /LessonRunnerShell/);
    assert.match(runnerSource, /completeLessonSession/);
    assert.match(runnerSource, /onContinueToPractice/);
  });
});
