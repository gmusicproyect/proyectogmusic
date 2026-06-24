import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  getInitialPageFromPath,
  navigateStudentZoneAware,
  pageFromPathname,
  pathnameForPage,
} from "./student-zone-routing";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");

const DEMO_PAGES = [
  ["onboarding-quiz", "/quiz-temperamento"],
  ["mi-camino-demo", "/mi-camino-demo"],
  ["demo-clase-1", "/demo-clase-1"],
  ["demo-clase-2", "/demo-clase-2"],
  ["demo-clase-3", "/demo-clase-3"],
  ["demo-clase-4", "/demo-clase-4"],
  ["demo-clase-5", "/demo-clase-5"],
  ["inscripcion-gate", "/inscripcion"],
] as const;

function withMockLocation(
  pathname: string,
  run: () => void,
  options: { pushState?: (url: string) => void } = {}
): { pathname: string; pushCalls: string[] } {
  let currentPath = pathname;
  const pushCalls: string[] = [];
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;

  const mockWindow = {
    location: {
      get pathname() {
        return currentPath;
      },
    },
    history: {
      replaceState(_state: unknown, _title: string, url?: string | URL | null) {
        if (typeof url === "string") {
          currentPath = url;
        }
      },
      pushState(_state: unknown, _title: string, url?: string | URL | null) {
        if (typeof url === "string") {
          currentPath = url;
          pushCalls.push(url);
          options.pushState?.(url);
        }
      },
    },
  };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: mockWindow,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { title: "" },
  });

  try {
    run();
  } finally {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: previousWindow,
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: previousDocument,
    });
  }

  return { pathname: currentPath, pushCalls };
}

describe("student-zone-routing — mapa D-GOV-02", () => {
  it("page → pathname para funnel demo y zona suscriptor", () => {
    for (const [page, path] of DEMO_PAGES) {
      assert.equal(pathnameForPage(page), path);
    }
    assert.equal(pathnameForPage("mi-estudio"), "/alumno");
    assert.equal(pathnameForPage("welcome"), "/alumno");
    assert.equal(pathnameForPage("mi-camino"), "/mi-camino");
  });

  it("pathname → page incluye funnel demo y zona suscriptor", () => {
    for (const [page, path] of DEMO_PAGES) {
      assert.equal(pageFromPathname(path), page);
    }
    assert.equal(pageFromPathname("/alumno"), "mi-estudio");
    assert.equal(pageFromPathname("/mi-camino"), "mi-camino");
    assert.equal(pageFromPathname("/"), "home");
  });

  it("/inscripcion resuelve a inscripcion-gate", () => {
    assert.equal(pageFromPathname("/inscripcion"), "inscripcion-gate");
    assert.equal(pathnameForPage("inscripcion-gate"), "/inscripcion");
  });

  it("inscripcion-registro no tiene pathname propio", () => {
    assert.equal(pathnameForPage("inscripcion-registro"), null);
    assert.equal(pageFromPathname("/inscripcion-registro"), "home");
  });

  it("pathname desconocido → home", () => {
    assert.equal(pageFromPathname("/checkout"), "home");
    assert.equal(pageFromPathname("/legacy-courses"), "home");
  });

  it("carga directa /quiz-temperamento → onboarding-quiz", () => {
    withMockLocation("/quiz-temperamento", () => {
      assert.equal(getInitialPageFromPath(), "onboarding-quiz");
    });
  });

  it("carga directa /demo-clase-3 → demo-clase-3", () => {
    const result = withMockLocation("/demo-clase-3", () => {
      assert.equal(getInitialPageFromPath(), "demo-clase-3");
    });
    assert.equal(result.pathname, "/demo-clase-3");
  });
});

describe("student-zone-routing — navigateStudentZoneAware", () => {
  it("navega demo-clase-2 con pushState", () => {
    let nextPage = "home";
    const result = withMockLocation("/", () => {
      navigateStudentZoneAware("demo-clase-2", (page) => {
        nextPage = page;
      }, "home");
    });

    assert.equal(nextPage, "demo-clase-2");
    assert.equal(result.pathname, "/demo-clase-2");
    assert.deepEqual(result.pushCalls, ["/demo-clase-2"]);
  });

  it("salida demo → home deja URL en /", () => {
    let nextPage = "mi-camino-demo";
    const result = withMockLocation("/mi-camino-demo", () => {
      navigateStudentZoneAware("home", (page) => {
        nextPage = page;
      }, "mi-camino-demo");
    });

    assert.equal(nextPage, "home");
    assert.equal(result.pathname, "/");
  });

  it("gate → registro mantiene /inscripcion sin pathname propio", () => {
    let nextPage = "inscripcion-gate";
    const result = withMockLocation("/inscripcion", () => {
      navigateStudentZoneAware("inscripcion-registro", (page) => {
        nextPage = page;
      }, "inscripcion-gate");
    });

    assert.equal(nextPage, "inscripcion-registro");
    assert.equal(result.pathname, "/inscripcion");
    assert.equal(result.pushCalls.length, 0);
  });

  it("regresión: desde /alumno a home deja URL en /", () => {
    let nextPage = "mi-estudio";
    const result = withMockLocation("/alumno", () => {
      navigateStudentZoneAware("home", (page) => {
        nextPage = page;
      }, "mi-estudio");
    });

    assert.equal(nextPage, "home");
    assert.equal(result.pathname, "/");
  });

  it("regresión: desde /mi-camino a home deja URL en /", () => {
    let nextPage = "mi-camino";
    const result = withMockLocation("/mi-camino", () => {
      navigateStudentZoneAware("home", (page) => {
        nextPage = page;
      }, "mi-camino");
    });

    assert.equal(nextPage, "home");
    assert.equal(result.pathname, "/");
  });
});

describe("App — Semestral usa handlePageChange hacia inscripcion-gate", () => {
  it("handleSemestralPlanSelect navega con handlePageChange (sync /inscripcion)", () => {
    const fnMatch = appSource.match(/const handleSemestralPlanSelect = \(\) => \{([\s\S]*?)\};/);
    assert.ok(fnMatch, "handleSemestralPlanSelect debe existir en App.tsx");
    const body = fnMatch[1];
    assert.ok(
      body.includes('handlePageChange("inscripcion-gate")'),
      "debe navegar a inscripcion-gate vía handlePageChange"
    );
    assert.equal(body.includes('setCurrentPage("inscripcion-gate")'), false);
  });
});
