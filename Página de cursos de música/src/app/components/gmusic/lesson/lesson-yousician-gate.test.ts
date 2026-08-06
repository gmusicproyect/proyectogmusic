import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const gateSource = readFileSync(join(root, "LessonYousicianGate.tsx"), "utf8");
const practicaSource = readFileSync(join(root, "../path/PathPracticaTab.tsx"), "utf8");
const runnerSource = readFileSync(join(root, "../path/PathLessonRunner.tsx"), "utf8");

describe("T-UX-LESSON-01 CP4 — gate Yousician", () => {
  it("usa copy honesto del spec", () => {
    assert.match(gateSource, /Modo escucha — en evaluación/);
    assert.match(gateSource, /Hoy practicas respondiendo en pantalla/);
    assert.match(gateSource, /No se activa el micrófono en esta versión/);
    assert.doesNotMatch(gateSource, /D-GOV-AUDIO-01/);
    assert.doesNotMatch(gateSource, /próximamente/i);
  });

  it("no promete audio ni solicita micrófono", () => {
    const forbidden = [
      "getUserMedia",
      "mediaDevices",
      "navigator.mediaDevices",
      "AudioContext",
      "Escucha tu guitarra",
      "Activa el micrófono",
    ];

    for (const token of forbidden) {
      assert.equal(gateSource.includes(token), false, `gate no debe incluir ${token}`);
    }
  });

  it("PathPracticaTab muestra el gate solo durante la sesión activa", () => {
    assert.match(runnerSource, /LessonYousicianGate/);
    assert.doesNotMatch(practicaSource, /LessonYousicianGate/);
  });
});
