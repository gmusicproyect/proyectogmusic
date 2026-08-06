import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  FRETBOARD_COMPACT_HEIGHT_PX,
  FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX,
  FRETBOARD_STRING_IDS,
  FRETBOARD_STRING_THICKNESS_PX,
  areDistinctFretboardStringIds,
  exerciseOptionsAreFretboardStrings,
  isFretboardStringId,
} from "./lesson-fretboard";

const root = dirname(fileURLToPath(import.meta.url));
const fretboardComponentSource = readFileSync(join(root, "LessonFretboard.tsx"), "utf8");
const fretboardCssSource = readFileSync(join(root, "lesson-fretboard.css"), "utf8");

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

describe("FRETBOARD_STRING_THICKNESS_PX — grosor real", () => {
  it("6ª (E) gruesa 6px → 1ª (e) fina 2px", () => {
    assert.equal(FRETBOARD_STRING_THICKNESS_PX.E, 6);
    assert.equal(FRETBOARD_STRING_THICKNESS_PX.e, 2);
    assert.equal(FRETBOARD_STRING_THICKNESS_PX.D, 4);
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

  it("renderiza diapasón Simply Guitar con trastes, incrustaciones y grosor por cuerda", () => {
    assert.match(fretboardComponentSource, /lesson-fretboard diapason/);
    assert.match(fretboardComponentSource, /diapason--immersive/);
    assert.match(fretboardComponentSource, /usePathPracticaLayout/);
    assert.match(fretboardComponentSource, /className="trastes"/);
    assert.match(fretboardComponentSource, /lesson-fretboard__cuerdas/);
    assert.match(fretboardComponentSource, /FRETBOARD_STRING_THICKNESS_PX/);
    assert.match(fretboardComponentSource, /FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX/);
    assert.match(fretboardComponentSource, /height: lineHeight/);
    assert.doesNotMatch(fretboardComponentSource, /flex flex-col/);
  });

  it("CSS: madera oscura, cejuela dorada, glow en cuerda marcada", () => {
    assert.match(fretboardCssSource, /linear-gradient\(180deg,\s*#171412,\s*#0e0c0a\)/);
    assert.match(fretboardCssSource, /border-left:\s*3px solid #c9a84c/);
    assert.match(fretboardCssSource, /repeating-linear-gradient/);
    assert.match(fretboardCssSource, /box-shadow:\s*0 0 12px rgba\(201,\s*168,\s*76,\s*0\.55\)/);
    assert.match(fretboardCssSource, /linear-gradient\(180deg,\s*#d9d9d9,\s*#6e6e6e\)/);
  });

  it("CSS defensivo anti-estiramiento en modo compacto", () => {
    assert.match(fretboardCssSource, /lesson-fretboard__cuerdas/);
    assert.match(fretboardCssSource, /\.lesson-fretboard \.cuerda[\s\S]*height:\s*34px/);
    assert.match(fretboardCssSource, /min-height:\s*34px/);
    assert.match(fretboardCssSource, /max-height:\s*34px/);
    assert.match(fretboardCssSource, /flex:\s*none/);
    assert.match(fretboardCssSource, /display:\s*block/);
  });

  it("CSS modo inmersivo full-bleed de borde a borde", () => {
    assert.match(fretboardCssSource, /diapason--immersive/);
    assert.match(fretboardCssSource, /width:\s*100vw/);
    assert.match(fretboardCssSource, /margin-left:\s*calc\(50% - 50vw\)/);
    assert.match(fretboardCssSource, /border-radius:\s*0/);
  });
});

describe("FRETBOARD_COMPACT_HEIGHT_PX — aceptación layout", () => {
  it("cuadro compacto ≈ 228px sin hint (6×34 + padding 12×2)", () => {
    assert.equal(FRETBOARD_COMPACT_HEIGHT_PX, 228);
  });

  it("cuadro con hint ≈ 256px", () => {
    assert.equal(FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX, 256);
  });
});

describe("exerciseOptionsAreFretboardStrings — Paquete A", () => {
  it("detecta ejercicios cuyas opciones son ids de cuerda", () => {
    assert.equal(
      exerciseOptionsAreFretboardStrings([
        { id: "a", text: "E" },
        { id: "b", text: "A" },
      ]),
      true
    );
    assert.equal(
      exerciseOptionsAreFretboardStrings([
        { id: "a", text: "Mi" },
        { id: "b", text: "La" },
      ]),
      false
    );
  });
});
