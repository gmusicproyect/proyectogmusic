import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildVisualPracticeChecklist,
  lessonStageLabelForSlot,
  resolveLessonStageSlot,
} from "./lesson-stage";

describe("lesson-stage", () => {
  it("resolveLessonStageSlot prioriza stageType sobre order", () => {
    assert.equal(resolveLessonStageSlot("PRACTICA", 1), 4);
    assert.equal(resolveLessonStageSlot(null, 3), 3);
    assert.equal(resolveLessonStageSlot(null, 99), 1);
  });

  it("lessonStageLabelForSlot devuelve las 5 etapas D-GOV-04", () => {
    assert.equal(lessonStageLabelForSlot(1), "Fundamento uno");
    assert.equal(lessonStageLabelForSlot(5), "Tocar");
  });

  it("buildVisualPracticeChecklist usa completionCriteria cuando existe", () => {
    const items = buildVisualPracticeChecklist({
      stageLabel: "Técnica",
      nodeTitle: "Tu guitarra y postura",
      completionCriteria: "Postura estable al tocar Am",
    });
    assert.equal(items.length, 3);
    assert.match(items[0], /Tu guitarra y postura/);
    assert.match(items[1], /Postura estable/);
  });

  it("buildVisualPracticeChecklist cae a hints genéricos sin criteria", () => {
    const items = buildVisualPracticeChecklist({
      stageLabel: "Técnica",
      nodeTitle: "Tu guitarra y postura",
    });
    assert.equal(items.length, 3);
    assert.match(items[0], /Tu guitarra y postura/);
    assert.match(items[1], /Técnica/);
  });
});
