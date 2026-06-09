import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { navigateDeniedToHomePlans } from "../../utils/student-zone-routing";

const root = dirname(fileURLToPath(import.meta.url));
const guardSource = readFileSync(join(root, "StudentZoneGuard.tsx"), "utf8");
const appSource = readFileSync(join(root, "../../App.tsx"), "utf8");

describe("StudentZoneGuard — renderizado", () => {
  it("loading no renderiza children", () => {
    assert.match(guardSource, /access\.status === "loading"/);
    assert.match(guardSource, /Verificando acceso/);
    assert.equal(guardSource.includes('access.status === "allowed"'), false);
    assert.match(guardSource, /return <>\{children\}<\/>/);
  });

  it("allowed renderiza children", () => {
    assert.match(guardSource, /return <>\{children\}<\/>/);
    assert.equal(guardSource.includes("GmusicWelcome"), false);
    assert.equal(guardSource.includes("GmusicPath"), false);
  });

  it("error muestra retry y no renderiza children", () => {
    assert.match(guardSource, /access\.status === "error"/);
    assert.match(guardSource, /No pudimos verificar tu acceso/);
    assert.match(guardSource, /access\.retry\(\)/);
    assert.match(guardSource, /Reintentar/);
    assert.match(guardSource, /Volver al inicio/);
  });

  it("denied redirige una sola vez con ref", () => {
    assert.match(guardSource, /deniedRedirectRef/);
    assert.match(guardSource, /navigateDeniedToHomePlans/);
    assert.match(guardSource, /useEffect\(/);
    assert.equal(guardSource.includes("localStorage"), false);
    assert.equal(guardSource.includes("sessionStorage"), false);
  });

  it("no infiere acceso desde datos locales", () => {
    assert.equal(guardSource.includes("useDashboard"), false);
    assert.equal(guardSource.includes("usePath"), false);
    assert.equal(guardSource.includes("MOCK_USER"), false);
    assert.match(guardSource, /useStudentAccess/);
  });
});

describe("navigateDeniedToHomePlans", () => {
  function withMockLocation(pathname: string, run: () => void): string {
    let currentPath = pathname;
    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;
    const scrolled: string[] = [];

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
        pushState() {},
      },
      setTimeout(fn: () => void) {
        fn();
        return 0;
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

    return currentPath;
  }

  it("denied navega una sola vez a home y desplaza a planes", () => {
    let nextPage = "mi-estudio";
    let scrollTarget = "";
    const finalPath = withMockLocation("/alumno", () => {
      navigateDeniedToHomePlans(
        (page) => {
          nextPage = page;
        },
        "mi-estudio",
        (sectionId) => {
          scrollTarget = sectionId;
        },
        0
      );
    });

    assert.equal(nextPage, "home");
    assert.equal(finalPath, "/");
    assert.equal(scrollTarget, "planes");
  });
});

describe("App.tsx — protección de zona privada", () => {
  it("protege GmusicWelcome y GmusicPath con StudentZoneGuard", () => {
    assert.match(
      appSource,
      /\(currentPage === "welcome" \|\| currentPage === "mi-estudio"\)[\s\S]*StudentZoneGuard[\s\S]*GmusicWelcome/
    );
    assert.match(
      appSource,
      /currentPage === "mi-camino"[\s\S]*StudentZoneGuard[\s\S]*GmusicPath/
    );
  });

  it("el funnel público sigue montado sin guard", () => {
    assert.match(appSource, /currentPage === "home"[\s\S]*GmusicLanding/);
    assert.equal(appSource.includes("StudentZoneGuard"), true);
    assert.equal(
      appSource.includes('<StudentZoneGuard setPage={handlePageChange} currentPage={currentPage}>\n          <GmusicLanding'),
      false
    );
    assert.match(appSource, /isPublicFreeLessonPage\(currentPage\)[\s\S]*FreeFundamentoLessonPage/);
  });
});

describe("StudentZoneGuard — sin loops de redirección", () => {
  it("denied usa useEffect, no setState durante render", () => {
    assert.match(guardSource, /useEffect\([\s\S]*deniedRedirectRef/);
    assert.equal(guardSource.includes("navigateDeniedToHomePlans(setPage"), true);
    assert.equal(guardSource.includes("if (access.status === \"denied\") {\n    navigate"), false);
  });
});
