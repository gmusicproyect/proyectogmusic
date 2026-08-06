import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  FRETBOARD_STRING_IDS,
  areDistinctFretboardStringIds,
  isFretboardStringId,
} from "./lesson-fretboard";

const root = dirname(fileURLToPath(import.meta.url));
const fretboardComponentSource = readFileSync(join(root, "LessonFretboard.tsx"), "utf8");

describe("lesson-fretboard — case-sensitive string ids", () => {
  it("acepta E (sexta) y e (primera) como ids distintos", () => {
    assert.equal(isFretboardStringId("E"), true);
    assert.equal(isFretboardStringId("e"), true);
    assert.notEqual("E", "e");
    assert.equal(areDistinctFretboardStringIds("E", "e"), true);
    assert.equal(areDistinctFretboardStringIds("e", "E"), true);
  });

  it("rechaza variantes con casing incorrecto", () => {
    assert.equal(isFretboardStringId("b"), false);
    assert.equal(isFretboardStringId("g"), false);
    assert.equal(isFretboardStringId("a"), false);
    assert.equal(isFretboardStringId("d"), false);
  });

  it("FRETBOARD_STRING_IDS incluye exactamente un E y un e", () => {
    const graveE = FRETBOARD_STRING_IDS.filter((id) => id === "E");
    const acuteE = FRETBOARD_STRING_IDS.filter((id) => id === "e");
    assert.equal(graveE.length, 1);
    assert.equal(acuteE.length, 1);
  });
});

describe("LessonFretboard — vocabulario seguro", () => {
  it("no usa tokens prohibidos de scoring ni contentPayload", () => {
    const forbidden = [
      "isCorrect",
      "xpEarned",
      "accuracy",
      "contentPayload",
      "secureAnswer",
      "correctOptionId",
    ];

    for (const token of forbidden) {
      assert.equal(
        fretboardComponentSource.includes(token),
        false,
        `LessonFretboard no debe incluir ${token}`
      );
    }
  });

  it("usa vocabulario permitido: lesson-fretboard, stringId, selectedStringId", () => {
    assert.equal(fretboardComponentSource.includes("lesson-fretboard"), true);
    assert.equal(fretboardComponentSource.includes("stringId"), true);
    assert.equal(fretboardComponentSource.includes("selectedStringId"), true);
  });
});
