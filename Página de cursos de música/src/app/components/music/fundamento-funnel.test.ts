import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  ACADEMIA_TRACK_MATRIX,
  ACADEMIA_TIERS,
  ACADEMIA_FOCUSES,
  getTracksForTier,
  isFreeClassTrack,
  PUBLIC_FREE_LESSON_PAGE,
} from "../../utils/academia-track-matrix";
import {
  canAdvanceFreeFundamentoLesson,
  nextFreeFundamentoLessonPhase,
} from "../../utils/free-fundamento-lesson";
import {
  navigateToHomeSection,
  scrollToHomeSection,
} from "../../utils/public-home-navigation";

const root = dirname(fileURLToPath(import.meta.url));
const navbarSource = readFileSync(join(root, "Navbar.tsx"), "utf8");
const selectorSource = readFileSync(join(root, "InteractiveLevelSelector.tsx"), "utf8");
const heroSource = readFileSync(join(root, "../marketing/sections/HeroSection.tsx"), "utf8");
const planesSource = readFileSync(join(root, "../marketing/sections/PlanesSection.tsx"), "utf8");
const academiaSource = readFileSync(join(root, "../marketing/sections/AcademiaSection.tsx"), "utf8");
const appSource = readFileSync(join(root, "../../App.tsx"), "utf8");
const previewSource = readFileSync(join(root, "../../pages/FundamentoPreviewPage.tsx"), "utf8");
const lessonSource = readFileSync(join(root, "../../pages/FreeFundamentoLessonPage.tsx"), "utf8");

const LEGACY_PUBLIC_TARGETS = ["probar", "dashboard", "curriculum", "lesson"] as const;
const FORBIDDEN_PUBLIC_TARGETS = ["fundamento-preview", ...LEGACY_PUBLIC_TARGETS] as const;

function assertNoForbiddenNavigation(source: string, componentName: string) {
  for (const target of FORBIDDEN_PUBLIC_TARGETS) {
    assert.equal(
      source.includes(`setPage("${target}")`),
      false,
      `${componentName} no debe navegar a ${target}`
    );
  }
}

describe("Navbar — estado público anónimo A2.2", () => {
  it("no contiene Carlos ni Mes 2", () => {
    assert.equal(navbarSource.includes("Carlos"), false);
    assert.equal(navbarSource.includes("Mes 2"), false);
    assert.equal(navbarSource.includes("MOCK_USER"), false);
    assert.equal(navbarSource.includes("getUserLevelMonthLabel"), false);
    assert.equal(navbarSource.includes("gmusic-profile-trigger"), false);
  });

  it("muestra Iniciar sesión y Regístrate como acciones no disponibles aún", () => {
    assert.equal(navbarSource.includes("Iniciar sesión"), true);
    assert.equal(navbarSource.includes("Regístrate"), true);
    assert.equal(navbarSource.includes("aria-disabled"), false);
    assert.equal(navbarSource.includes("disabled"), true);
    assert.equal(navbarSource.includes("Disponible próximamente"), true);
    assert.equal(navbarSource.includes('aria-label="Iniciar sesión — disponible próximamente"'), true);
    assert.equal(navbarSource.includes('aria-label="Regístrate — disponible próximamente"'), true);
  });

  it("no navega a mi-estudio ni registro", () => {
    assert.equal(navbarSource.includes('setPage("mi-estudio")'), false);
    assert.equal(navbarSource.includes('setPage("mi-camino")'), false);
    assertNoForbiddenNavigation(navbarSource, "Navbar");
  });
});

describe("academia-track-matrix — modelo 3x3", () => {
  it("define exactamente 9 combinaciones nivel/enfoque", () => {
    assert.equal(ACADEMIA_TIERS.length, 3);
    assert.equal(ACADEMIA_FOCUSES.length, 3);
    assert.equal(ACADEMIA_TRACK_MATRIX.length, 9);
    const keys = new Set(
      ACADEMIA_TRACK_MATRIX.map((track) => `${track.tierId}:${track.focusId}`)
    );
    assert.equal(keys.size, 9);
  });

  it("cada nivel expone tres tarjetas de enfoque", () => {
    for (const tier of ACADEMIA_TIERS) {
      const tracks = getTracksForTier(tier.id);
      assert.equal(tracks.length, 3);
      assert.deepEqual(
        tracks.map((track) => track.focusId),
        ["fundamento", "tecnica", "crea"]
      );
      assert.equal(tracks.every((track) => track.tierId === tier.id), true);
    }
  });

  it("solo Básico + Fundamento permite iniciar clase gratuita", () => {
    const freeTracks = ACADEMIA_TRACK_MATRIX.filter((track) => isFreeClassTrack(track));
    assert.equal(freeTracks.length, 1);
    assert.equal(freeTracks[0]?.tierId, "basico");
    assert.equal(freeTracks[0]?.focusId, "fundamento");
    assert.equal(
      ACADEMIA_TRACK_MATRIX.filter((track) => track.freeClassAvailable).length,
      1
    );
  });
});

describe("HeroSection — funnel público A2.2", () => {
  it("Ver clase gratuita navega directamente a fundamento-free-lesson", () => {
    assert.equal(heroSource.includes("Ver clase gratuita"), true);
    assert.equal(heroSource.includes("PUBLIC_FREE_LESSON_PAGE"), true);
    assert.equal(heroSource.includes(`setPage(PUBLIC_FREE_LESSON_PAGE)`), true);
    assert.equal(PUBLIC_FREE_LESSON_PAGE, "fundamento-free-lesson");
  });

  it("no usa Probar gratis ni rutas prohibidas", () => {
    assert.equal(heroSource.includes("Probar gratis"), false);
    assertNoForbiddenNavigation(heroSource, "HeroSection");
  });
});

describe("PlanesSection — funnel público A2.2", () => {
  it("Ver clase gratuita navega directamente a fundamento-free-lesson", () => {
    assert.equal(planesSource.includes("Ver clase gratuita"), true);
    assert.equal(planesSource.includes("PUBLIC_FREE_LESSON_PAGE"), true);
    assert.equal(planesSource.includes(`setPage(PUBLIC_FREE_LESSON_PAGE)`), true);
    assert.equal(PUBLIC_FREE_LESSON_PAGE, "fundamento-free-lesson");
  });

  it("no usa Probar gratis ni rutas prohibidas", () => {
    assert.equal(planesSource.includes("Probar gratis"), false);
    assertNoForbiddenNavigation(planesSource, "PlanesSection");
  });
});

describe("AcademiaSection — copy y aislamiento legacy", () => {
  it("no habla de elegir instrumento", () => {
    assert.equal(academiaSource.includes("instrumento"), false);
    assert.equal(academiaSource.includes("punto de partida dentro de la academia"), true);
  });

  it("no navega a páginas legacy ni preview", () => {
    assertNoForbiddenNavigation(academiaSource, "AcademiaSection");
  });
});

describe("InteractiveLevelSelector — Academia 3x3 A2.2", () => {
  it("usa selector superior Básico, Intermedio y Avanzado", () => {
    assert.equal(selectorSource.includes("ACADEMIA_TIERS"), true);
    assert.equal(selectorSource.includes("activeTierId"), true);
  });

  it("renderiza tres tarjetas según el nivel activo", () => {
    assert.equal(selectorSource.includes("getTracksForTier(activeTierId)"), true);
    assert.equal(selectorSource.includes("setActiveTierId"), true);
    assert.equal(selectorSource.includes("ACADEMIA_TRACK_MATRIX"), false);
  });

  it("conserva nombres pedagógicos Fundamento, Técnica y Crea", () => {
    assert.equal(selectorSource.includes("focusTitle"), true);
    assert.equal(selectorSource.includes("Ver clase gratuita"), true);
    assert.equal(selectorSource.includes("Próximamente"), true);
  });

  it("Fundamento Básico abre fundamento-free-lesson", () => {
    assert.equal(selectorSource.includes(`setPage(PUBLIC_FREE_LESSON_PAGE)`), true);
    assert.equal(selectorSource.includes("isFreeClassTrack"), true);
    assertNoForbiddenNavigation(selectorSource, "InteractiveLevelSelector");
  });

  it("no inventa progreso, XP ni racha", () => {
    assert.equal(selectorSource.includes("XP"), false);
    assert.equal(selectorSource.includes("racha"), false);
    assert.equal(selectorSource.includes("progreso"), false);
  });
});

describe("FundamentoPreviewPage — desconectada pero conservada", () => {
  it("sigue existiendo como página autocontenida", () => {
    assert.equal(previewSource.includes("FundamentoPreviewPage"), true);
    assert.equal(previewSource.includes('setPage("fundamento-free-lesson")'), true);
  });

  it("no se monta directamente en App.tsx", () => {
    assert.equal(appSource.includes("FundamentoPreviewPage"), false);
  });
});

describe("App — red de seguridad fundamento-preview", () => {
  it("fundamento-preview renderiza FreeFundamentoLessonPage sin pantalla vacía", () => {
    assert.match(
      appSource,
      /\(currentPage === "fundamento-free-lesson" \|\| currentPage === "fundamento-preview"\)[\s\S]*FreeFundamentoLessonPage/
    );
  });

  it("no monta FundamentoPreviewPage", () => {
    assert.equal(appSource.includes("FundamentoPreviewPage"), false);
  });
});

describe("canAdvanceFreeFundamentoLesson", () => {
  it("rechaza null, vacío e IDs desconocidos", () => {
    assert.equal(canAdvanceFreeFundamentoLesson(null), false);
    assert.equal(canAdvanceFreeFundamentoLesson(""), false);
    assert.equal(canAdvanceFreeFundamentoLesson("unknown"), false);
    assert.equal(canAdvanceFreeFundamentoLesson("headstock-extra"), false);
  });

  it("acepta únicamente IDs presentes en FREE_FUNDAMENTO_LESSON_OPTIONS", () => {
    assert.equal(canAdvanceFreeFundamentoLesson("body"), true);
    assert.equal(canAdvanceFreeFundamentoLesson("neck"), true);
    assert.equal(canAdvanceFreeFundamentoLesson("headstock"), true);
  });
});

describe("FreeFundamentoLessonPage", () => {
  it("requiere selección válida antes de continuar", () => {
    assert.equal(lessonSource.includes('type="radio"'), true);
    assert.equal(lessonSource.includes("disabled={!canContinue}"), true);
    assert.equal(lessonSource.includes("canAdvanceFreeFundamentoLesson"), true);
  });

  it("incluye imagen educativa de guitarra con alt descriptivo", () => {
    assert.equal(lessonSource.includes("FREE_FUNDAMENTO_GUITAR_IMAGE_URL"), true);
    assert.equal(lessonSource.includes("FREE_FUNDAMENTO_GUITAR_IMAGE_ALT"), true);
    assert.equal(lessonSource.includes('width={720}'), true);
    assert.equal(lessonSource.includes('height={405}'), true);
    assert.equal(lessonSource.includes("aspectRatio"), true);
  });

  it("ofrece Volver a Academia durante y después de la clase", () => {
    const matches = lessonSource.match(/Volver a Academia/g) ?? [];
    assert.equal(matches.length, 2);
    assert.equal(lessonSource.includes('navigateToHomeSection(setPage, "academia")'), true);
  });

  it("no califica ni muestra respuestas correctas", () => {
    assert.equal(lessonSource.includes("correct"), false);
    assert.equal(lessonSource.includes("LessonRunnerShell"), false);
    assert.equal(lessonSource.includes("useLessonRunner"), false);
  });

  it("no muestra XP, racha ni semana completada", () => {
    assert.equal(lessonSource.includes("XP"), false);
    assert.equal(lessonSource.includes("racha"), false);
    assert.equal(lessonSource.includes("Semana completada"), false);
    assert.equal(lessonSource.includes("CofreVirtual"), false);
  });

  it("no usa letterSpacing negativo en títulos", () => {
    assert.equal(lessonSource.includes('letterSpacing: "-"'), false);
    assert.equal(lessonSource.includes("letterSpacing: 0"), true);
  });

  it("muestra CTA de planes al completar", () => {
    assert.equal(nextFreeFundamentoLessonPhase("lesson"), "complete");
    assert.equal(lessonSource.includes("Completaste tu primera clase gratuita"), true);
    assert.equal(lessonSource.includes("Conocer los planes"), true);
    assert.equal(lessonSource.includes('navigateToHomeSection(setPage, "planes")'), true);
  });
});

describe("App — rutas públicas del funnel A2.2", () => {
  it("registra fundamento-free-lesson sin DEV_LEGACY", () => {
    assert.equal(appSource.includes('currentPage === "fundamento-free-lesson"'), true);
    assert.equal(
      /fundamento-free-lesson[\s\S]*FreeFundamentoLessonPage/.test(appSource),
      true
    );
    assert.equal(appSource.includes("DEV_LEGACY && currentPage === \"fundamento"), false);
  });

  it("no importa LessonRunnerShell ni páginas legacy del funnel", () => {
    assert.equal(previewSource.includes("LessonRunnerShell"), false);
    assert.equal(lessonSource.includes("LessonRunnerShell"), false);
    assert.equal(previewSource.includes("MOCK_USER"), false);
    assert.equal(lessonSource.includes("MOCK_USER"), false);
    assert.equal(previewSource.includes("CurriculumPage"), false);
    assert.equal(lessonSource.includes("PaywallModal"), false);
    assert.equal(lessonSource.includes("AuthModal"), false);
  });
});

describe("navigateToHomeSection", () => {
  it("navega a home y desplaza a la sección academia", () => {
    let nextPage = "fundamento-free-lesson";
    let scrolledTo: string | null = null;

    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        pageYOffset: 0,
        scrollTo() {},
        setTimeout(fn: () => void) {
          fn();
          return 0;
        },
      },
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById(id: string) {
          scrolledTo = id;
          return {
            getBoundingClientRect() {
              return { top: 200 };
            },
          };
        },
      },
    });

    try {
      navigateToHomeSection((page) => {
        nextPage = page;
      }, "academia", 0);
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

    assert.equal(nextPage, "home");
    assert.equal(scrolledTo, "academia");
  });

  it("desplaza a la sección planes", () => {
    let scrolledTo: string | null = null;

    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        pageYOffset: 0,
        scrollTo() {},
      },
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById(id: string) {
          scrolledTo = id;
          return {
            getBoundingClientRect() {
              return { top: 400 };
            },
          };
        },
      },
    });

    try {
      scrollToHomeSection("planes");
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

    assert.equal(scrolledTo, "planes");
  });
});
