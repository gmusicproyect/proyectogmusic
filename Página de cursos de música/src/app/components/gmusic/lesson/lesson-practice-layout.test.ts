import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLessonPracticeChipItems } from "./LessonPracticeChips";

describe("LessonPracticeChips — Paquete A", () => {
  it("marca done, current y locked según el índice activo", () => {
    const items = buildLessonPracticeChipItems(5, 2);
    assert.deepEqual(
      items.map((item) => item.state),
      ["done", "done", "current", "locked", "locked"]
    );
  });
});
