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
const cardHeroSource = readFileSync(join(root, "PathCarouselCardHero.tsx"), "utf8");
const videoSourcesSource = readFileSync(join(root, "use-path-node-video-sources.ts"), "utf8");
const carouselSource = readFileSync(join(root, "../PathCarouselCards.tsx"), "utf8");
const resumenSource = readFileSync(join(root, "PathResumenPdfTab.tsx"), "utf8");
const practicaSource = readFileSync(join(root, "PathPracticaTab.tsx"), "utf8");
const practicaShellSource = readFileSync(join(root, "PathPracticaShell.tsx"), "utf8");
const practicaReposoSource = readFileSync(join(root, "PathPracticaReposo.tsx"), "utf8");
const runnerSource = readFileSync(join(root, "PathLessonRunner.tsx"), "utf8");
const runnerShellSource = readFileSync(join(root, "../lesson/LessonRunnerShell.tsx"), "utf8");

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
    assert.doesNotMatch(gmusicPathSource, /PathNodeVideoCard/);
    assert.match(carouselSource, /PathCarouselCardHero/);
    assert.match(gmusicPathSource, /PathResumenPdfTab/);
    assert.match(gmusicPathSource, /PathPracticaTab/);
    assert.match(gmusicPathSource, /activeRunner=\{activeRunner\}/);
    assert.doesNotMatch(gmusicPathSource, /Ir a Práctica/);
    assert.doesNotMatch(gmusicPathSource, /Ver pestaña Práctica/);
  });

  it("PathLessonTabsShell usa tablist accesible", () => {
    assert.match(tabsShellSource, /role="tablist"/);
    assert.match(tabsShellSource, /role="tab"/);
    assert.match(tabsShellSource, /role="tabpanel"/);
    assert.match(tabsShellSource, /PATH_LESSON_TAB_DEFINITIONS/);
  });

  it("Práctica embebida: guitarra visible, contador y pantalla completa opcional", () => {
    assert.match(practicaSource, /PathPracticaShell/);
    assert.match(practicaSource, /PathPracticaReposo/);
    assert.match(practicaSource, /onToggleFullscreen/);
    assert.match(practicaSource, /variant="embedded"/);
    assert.match(practicaShellSource, /de \{totalExercises\}/);
    assert.match(practicaShellSource, /Maximize2/);
    assert.match(practicaShellSource, /fixed inset-0/);
    assert.match(practicaShellSource, /path-practica-immersive-stage/);
    assert.match(practicaShellSource, /path-practica-immersive-hud/);
    assert.match(practicaReposoSource, /LessonFretboard/);
    assert.match(practicaReposoSource, /PathPracticaBody/);
    assert.doesNotMatch(practicaReposoSource, /Etapa activa/);
    assert.doesNotMatch(practicaReposoSource, /Cinco ejercicios/);
    assert.match(runnerSource, /onExerciseProgress/);
  });

  it("sesión activa usa layout Paquete A embebido dentro del shell", () => {
    assert.match(runnerShellSource, /LessonPracticeChips/);
    assert.match(runnerSource, /variant="embedded"/);
    assert.match(runnerShellSource, /LessonPracticePanel/);
    assert.match(runnerShellSource, /hideTitle/);
    assert.match(runnerShellSource, /onExerciseProgress/);
    assert.match(runnerShellSource, /diapason--immersive|immersiveLayout/);
  });
});

describe("T-UX-LESSON-01 CP3 — video firmado en Tarjetas", () => {
  it("video en tarjeta firma Supabase vía useSignedMaterialUrl", () => {
    assert.match(videoSourcesSource, /useSignedMaterialUrl/);
    assert.match(videoSourcesSource, /isSupabaseStorageVideoUrl/);
    assert.match(cardHeroSource, /usePathNodeVideoSources/);
    assert.doesNotMatch(cardHeroSource, /src=\{node\.videoUrl\}/);
    assert.match(videoCardSource, /usePathNodeVideoSources/);
  });

  it("Resumen PDF firma guías privadas solo al expandir", () => {
    assert.match(resumenSource, /useSignedMaterialUrl/);
    assert.match(resumenSource, /expanded && needsSigning/);
    assert.doesNotMatch(resumenSource, /href=\{node\.guidePdfUrl\}/);
    assert.match(resumenSource, /entries: PathNodeWithStep\[\]/);
    assert.match(gmusicPathSource, /PathResumenPdfTab entries=\{viewModel\.entries\}/);
    assert.match(resumenSource, /resolveLessonStageSlot\(node\.stageType, stepNumber\)/);
    assert.doesNotMatch(resumenSource, /node\.order\}/);
    assert.doesNotMatch(resumenSource, /flattenPathNodesWithStep/);
  });
});
