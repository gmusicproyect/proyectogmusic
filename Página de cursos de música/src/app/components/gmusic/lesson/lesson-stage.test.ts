import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMockPracticeChecklist,
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

  it("buildMockPracticeChecklist genera 3 microacciones", () => {
    const items = buildMockPracticeChecklist("Técnica", "Tu guitarra y postura");
    assert.equal(items.length, 3);
    assert.match(items[0], /Tu guitarra y postura/);
    assert.match(items[1], /Técnica/);
  });
});
