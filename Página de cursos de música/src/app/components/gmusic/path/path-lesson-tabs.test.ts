import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  PATH_LESSON_TAB_DEFINITIONS,
  isPathLessonTabId,
} from "./path-lesson-tab-ids";

const root = dirname(fileURLToPath(import.meta.url));
const gmusicPathSource = readFileSync(join(root, "../../../pages/GmusicPath.tsx"), "utf8");
const tabsShellSource = readFileSync(join(root, "PathLessonTabsShell.tsx"), "utf8");
const videoCardSource = readFileSync(join(root, "PathNodeVideoCard.tsx"), "utf8");
const resumenSource = readFileSync(join(root, "PathResumenPdfTab.tsx"), "utf8");
const practicaSource = readFileSync(join(root, "PathPracticaTab.tsx"), "utf8");
const runnerSource = readFileSync(join(root, "PathLessonRunner.tsx"), "utf8");

describe("T-UX-LESSON-01 CP3 — shell de 3 pestañas", () => {
  it("define exactamente Tarjetas · Práctica · Resumen PDF", () => {
    assert.equal(PATH_LESSON_TAB_DEFINITIONS.length, 3);
    assert.deepEqual(
      PATH_LESSON_TAB_DEFINITIONS.map((tab) => tab.label),
      ["Tarjetas (Mi Camino)", "Práctica", "Resumen PDF"]
    );
    assert.equal(isPathLessonTabId("tarjetas"), true);
    assert.equal(isPathLessonTabId("practica"), true);
    assert.equal(isPathLessonTabId("resumen-pdf"), true);
    assert.equal(isPathLessonTabId("pdf"), false);
  });

  it("GmusicPath monta PathLessonTabsShell con los tres paneles", () => {
    assert.match(gmusicPathSource, /PathLessonTabsShell/);
    assert.match(gmusicPathSource, /tarjetasPanel=/);
    assert.match(gmusicPathSource, /practicaPanel=/);
    assert.match(gmusicPathSource, /resumenPdfPanel=/);
    assert.match(gmusicPathSource, /PathNodeVideoCard/);
    assert.match(gmusicPathSource, /PathResumenPdfTab/);
    assert.match(gmusicPathSource, /PathPracticaTab/);
    assert.doesNotMatch(gmusicPathSource, /fixed inset-0/);
  });

  it("PathLessonTabsShell usa tablist accesible", () => {
    assert.match(tabsShellSource, /role="tablist"/);
    assert.match(tabsShellSource, /role="tab"/);
    assert.match(tabsShellSource, /role="tabpanel"/);
    assert.match(tabsShellSource, /PATH_LESSON_TAB_DEFINITIONS/);
  });

  it("Práctica embebe PathLessonRunner sin overlay de pantalla completa", () => {
    assert.match(practicaSource, /variant="embedded"/);
    assert.match(practicaSource, /LessonYousicianGate/);
    assert.match(runnerSource, /variant\?: "overlay" \| "embedded"/);
    assert.match(runnerSource, /isEmbedded \? "practice" : "video"/);
  });
});

describe("T-UX-LESSON-01 CP3 — video firmado en Tarjetas", () => {
  it("PathNodeVideoCard firma videos Supabase vía useSignedMaterialUrl", () => {
    assert.match(videoCardSource, /useSignedMaterialUrl/);
    assert.match(videoCardSource, /isSupabaseStorageVideoUrl/);
    assert.match(videoCardSource, /nativeVideoSrc=\{nativeVideoSrc/);
    assert.equal(videoCardSource.includes("fetchSignedMaterialUrl"), false);
    assert.doesNotMatch(videoCardSource, /src=\{node\.videoUrl\}/);
  });

  it("Resumen PDF firma guías privadas solo al expandir", () => {
    assert.match(resumenSource, /useSignedMaterialUrl/);
    assert.match(resumenSource, /expanded && needsSigning/);
    assert.doesNotMatch(resumenSource, /href=\{node\.guidePdfUrl\}/);
  });
});
