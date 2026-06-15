import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { buildDemoModules } from "./PathDemoPage";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const demoPageSource = readFileSync(join(root, "./PathDemoPage.tsx"), "utf8");
const selectorSource = readFileSync(
  join(root, "../components/music/InteractiveLevelSelector.tsx"),
  "utf8"
);

describe("PathDemoPage — camino demo público", () => {
  it("buildDemoModules sin lecciones completadas: 5 nodos, 1 activo (demo-node-1), 4 bloqueados", () => {
    const modules = buildDemoModules([]);
    const allNodes = modules.flatMap((mod) => mod.nodes);
    const activeNode = allNodes.find((n) => n.status === "active");

    assert.equal(allNodes.length, 5);
    assert.equal(allNodes.filter((n) => n.status === "active").length, 1);
    assert.equal(allNodes.filter((n) => n.status === "locked").length, 4);
    assert.equal(activeNode?.id, "demo-node-1");
    assert.equal(activeNode?.title, "Conoce tu guitarra");
  });

  it("buildDemoModules con 2 completadas: marca completadas y activa la tercera", () => {
    const modules = buildDemoModules([1, 2]);
    const allNodes = modules.flatMap((mod) => mod.nodes);

    assert.equal(allNodes.find((n) => n.id === "demo-node-1")?.status, "completed");
    assert.equal(allNodes.find((n) => n.id === "demo-node-2")?.status, "completed");
    assert.equal(allNodes.find((n) => n.id === "demo-node-3")?.status, "active");
    assert.equal(allNodes.filter((n) => n.status === "locked").length, 2);
  });

  it("buildDemoModules con todas completadas: 5 completadas, 0 activas", () => {
    const modules = buildDemoModules([1, 2, 3, 4, 5]);
    const allNodes = modules.flatMap((mod) => mod.nodes);

    assert.equal(allNodes.filter((n) => n.status === "completed").length, 5);
    assert.equal(allNodes.filter((n) => n.status === "active").length, 0);
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

  it("InteractiveLevelSelector navega al camino demo", () => {
    assert.equal(selectorSource.includes('setPage("mi-camino-demo")'), true);
  });

  it("PathDemoPage conecta clases demo y CTA de planes", () => {
    assert.equal(demoPageSource.includes("allowLockedSelection"), true);
    assert.equal(demoPageSource.includes('navigateToHomeSection(setPage, "planes")'), true);
    assert.equal(demoPageSource.includes("demo-clase-"), true);
    assert.equal(demoPageSource.includes("LockedDemoNodePanel"), true);
  });

  it("PathDemoPage usa solo DemoAcademyNav (Visual C — sin GmusicInternalHeader)", () => {
    assert.equal(demoPageSource.includes("GmusicInternalHeader"), false);
    assert.equal(demoPageSource.includes("DemoAcademyNav"), true);
  });

  it("demo completado muestra celebración, intro, carrusel y reinicio (Visual C)", () => {
    assert.equal(demoPageSource.includes("DemoFinishedCelebration"), true);
    assert.equal(demoPageSource.includes("Tu recorrido completado"), true);
    assert.equal(demoPageSource.includes("Ver como primera vez"), true);
    assert.equal(demoPageSource.includes("previewAsFirstVisit"), true);
    assert.equal(demoPageSource.includes("Reiniciar y borrar progreso"), true);
    assert.equal(demoPageSource.includes("resetProgress"), true);
    assert.equal(demoPageSource.includes("PathPageIntro"), true);
    assert.equal(demoPageSource.includes("DemoPathCards"), true);
  });
});
