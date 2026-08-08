import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  computeStringYPositions,
  getStringY,
  HIGHWAY_FEATURE_ENABLED,
  LAB_STRING_COUNT,
} from "./lab-note";
import { FRETBOARD_STRING_NUMBER_TO_ID } from "./lesson-fretboard";

const root = dirname(fileURLToPath(import.meta.url));
const canvasSource = readFileSync(join(root, "FretboardCanvas.tsx"), "utf8");
const shellSource = readFileSync(join(root, "LessonRunnerShell.tsx"), "utf8");

describe("FretboardCanvas layout (patrón Lab)", () => {
  it("string 1 arriba y string 6 abajo", () => {
    const ys = computeStringYPositions(240);
    assert.equal(ys.length, LAB_STRING_COUNT);
    assert.ok(getStringY(1, ys) < getStringY(6, ys));
    assert.equal(FRETBOARD_STRING_NUMBER_TO_ID[1], "e");
    assert.equal(FRETBOARD_STRING_NUMBER_TO_ID[6], "E");
  });

  it("highway/hit line stub OFF en fuente", () => {
    assert.equal(HIGHWAY_FEATURE_ENABLED, false);
    assert.match(canvasSource, /HIGHWAY_FEATURE_ENABLED/);
    assert.equal(canvasSource.includes("getUserMedia"), false);
    assert.equal(canvasSource.includes("YIN"), false);
  });

  it("shell usa FretboardCanvas y no importa volumen Lab", () => {
    assert.match(shellSource, /FretboardCanvas/);
    assert.equal(shellSource.includes("/Volumes/Juan lizama h"), false);
    assert.equal(canvasSource.includes("/Volumes/Juan lizama h"), false);
  });
});
