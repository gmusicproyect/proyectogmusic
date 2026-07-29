import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildLessonResultFeedback } from "./lesson-result-feedback";

describe("B1 — feedback de acierto (server-graded)", () => {
  it("no completado => mensaje claro de reintento", () => {
    const msg = buildLessonResultFeedback({ precisionPercent: 40, stepCompleted: false });
    assert.match(msg, /incorrectas/);
    assert.match(msg, /Inténtalo de nuevo/);
  });

  it("completado con errores => aviso de repaso sin bloquear", () => {
    const msg = buildLessonResultFeedback({ precisionPercent: 80, stepCompleted: true });
    assert.match(msg, /incorrectas/);
    assert.doesNotMatch(msg, /Inténtalo de nuevo/);
  });

  it("100% completado => copy actual intacto", () => {
    assert.equal(
      buildLessonResultFeedback({ precisionPercent: 100, stepCompleted: true }),
      "Paso del camino marcado como completado."
    );
  });

  it("0% no completado => misma rama de reintento (sin límite inventado)", () => {
    assert.match(
      buildLessonResultFeedback({ precisionPercent: 0, stepCompleted: false }),
      /Inténtalo de nuevo/
    );
  });

  it("LessonRunnerShell cablea el helper", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(path.join(here, "LessonRunnerShell.tsx"), "utf8");
    assert.match(source, /buildLessonResultFeedback\(summary\)/);
  });
});
