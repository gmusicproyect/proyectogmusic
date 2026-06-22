import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildDemoModules } from "./PathDemoPage";
import {
  DEMO_ACADEMY_TEASER_NODE_ID,
  DEMO_CAROUSEL_LESSON_COUNT,
  DEMO_PATH_TOTAL_LESSONS,
} from "../data/demo-path-catalog";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const demoPageSource = readFileSync(join(root, "./PathDemoPage.tsx"), "utf8");
const selectorSource = readFileSync(
  join(root, "../components/music/InteractiveLevelSelector.tsx"),
  "utf8"
);

const CAROUSEL_NODE_COUNT = DEMO_CAROUSEL_LESSON_COUNT + 1;

describe("PathDemoPage — camino demo público", () => {
  it("buildDemoModules sin completadas: 16 nodos (15 preview + academia), 1 activo", () => {
    const modules = buildDemoModules([]);
    const allNodes = modules.flatMap((mod) => mod.nodes);
    const activeNode = allNodes.find((n) => n.status === "active");

    assert.equal(allNodes.length, CAROUSEL_NODE_COUNT);
    assert.equal(allNodes.filter((n) => n.status === "active").length, 1);
    assert.equal(allNodes.filter((n) => n.status === "locked").length, 14);
    assert.equal(activeNode?.id, "demo-node-1");
    assert.equal(activeNode?.title, "Conoce tu guitarra");
    assert.equal(allNodes[5]?.status, "locked");
    assert.equal(allNodes.at(-1)?.id, DEMO_ACADEMY_TEASER_NODE_ID);
  });

  it("buildDemoModules con 2 gratuitas completadas: activa la tercera", () => {
    const modules = buildDemoModules([1, 2]);
    const allNodes = modules.flatMap((mod) => mod.nodes);

    assert.equal(allNodes.find((n) => n.id === "demo-node-1")?.status, "completed");
    assert.equal(allNodes.find((n) => n.id === "demo-node-2")?.status, "completed");
    assert.equal(allNodes.find((n) => n.id === "demo-node-3")?.status, "active");
    assert.equal(allNodes.find((n) => n.id === "demo-node-6")?.status, "locked");
  });

  it("buildDemoModules con 5 gratuitas completadas: teaser 6–15 bloqueadas + card academia", () => {
    const modules = buildDemoModules([1, 2, 3, 4, 5]);
    const allNodes = modules.flatMap((mod) => mod.nodes);

    assert.equal(allNodes.filter((n) => n.status === "completed").length, 5);
    assert.equal(allNodes.filter((n) => n.status === "active").length, 0);
    assert.equal(allNodes.filter((n) => n.status === "locked").length, 10);
    assert.equal(allNodes.at(-1)?.id, DEMO_ACADEMY_TEASER_NODE_ID);
    assert.equal(allNodes.at(-1)?.status, "available");
  });

  it("App monta PathDemoPage en mi-camino-demo sin StudentZoneGuard", () => {
    assert.equal(appSource.includes('currentPage === "mi-camino-demo"'), true);
    assert.equal(appSource.includes("<PathDemoPage setPage={handlePageChange} />"), true);
    assert.doesNotMatch(
      appSource,
      /currentPage === "mi-camino-demo"[\s\S]{0,180}StudentZoneGuard/
    );
  });

  it("App registra rutas de clases demo (demo-clase-1..5) e inscripcion-gate", () => {
    assert.equal(appSource.includes("demo-clase-"), true);
    assert.equal(appSource.includes("DemoLessonPage"), true);
    assert.equal(appSource.includes("inscripcion-gate"), true);
    assert.equal(appSource.includes("InscripcionGatePage"), true);
  });

  it("InteractiveLevelSelector navega al quiz o al camino demo", () => {
    assert.equal(selectorSource.includes("shouldShowTemperamentQuiz"), true);
    assert.equal(selectorSource.includes('"onboarding-quiz"'), true);
    assert.equal(selectorSource.includes('"mi-camino-demo"'), true);
  });

  it("PathDemoPage conecta clases demo y CTA de planes", () => {
    assert.equal(demoPageSource.includes("allowLockedSelection"), true);
    assert.equal(demoPageSource.includes('navigateToHomeSection(setPage, "planes")'), true);
    assert.equal(demoPageSource.includes("demo-clase-"), true);
    assert.equal(demoPageSource.includes("LockedDemoNodePanel"), true);
    assert.equal(demoPageSource.includes("subscriptionLock"), true);
    assert.equal(demoPageSource.includes("onAcademyTeaserClick"), true);
  });

  it("PathDemoPage usa solo DemoAcademyNav (Visual C — sin GmusicInternalHeader)", () => {
    assert.equal(demoPageSource.includes("GmusicInternalHeader"), false);
    assert.equal(demoPageSource.includes("DemoAcademyNav"), true);
  });

  it("layout teaser: carrusel acotado, banner post-5/5 y FAB secundario", () => {
    const fabSource = readFileSync(
      join(root, "../components/gmusic/DemoPathCompletedFab.tsx"),
      "utf8"
    );
    assert.equal(demoPageSource.includes("DemoPathCompletedFab"), true);
    assert.equal(demoPageSource.includes("DemoPathCompletedBanner"), true);
    assert.equal(demoPageSource.includes('variant="rail"'), true);
    assert.equal(demoPageSource.includes("fullBleed"), true);
    assert.equal(demoPageSource.includes("DEMO_PATH_TOTAL_LESSONS"), true);
    assert.equal(demoPageSource.includes("DEMO_CAROUSEL_LESSON_COUNT"), true);
    assert.equal(demoPageSource.includes("lockedPanelRef"), true);
    assert.equal(fabSource.includes("Ver como primera vez"), true);
    assert.equal(demoPageSource.includes("previewAsFirstVisit"), true);
    assert.equal(demoPageSource.includes("resetProgress"), true);
    assert.equal(demoPageSource.includes("reviewCompleted"), true);
    assert.equal(demoPageSource.includes("DemoPathCards"), true);
  });
});
