import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  ACADEMIA_TRACK_MATRIX,
  ACADEMIA_TIERS,
  ACADEMIA_FOCUSES,
  buildFocusTitle,
  getTracksForTier,
  isFreeClassTrack,
  isPublicFreeLessonPage,
  PUBLIC_FREE_LESSON_PAGE,
} from "../../utils/academia-track-matrix";
import {
  canAdvanceFreeFundamentoLesson,
  isExpectedFreeFundamentoAnswer,
  nextFreeFundamentoLessonPhase,
} from "../../utils/free-fundamento-lesson";
import {
  ACTIVE_HOME_SECTION_EVENT,
  navigateToHomeSection,
  scrollToHomeSection,
} from "../../utils/public-home-navigation";

const root = dirname(fileURLToPath(import.meta.url));
const navbarSource = readFileSync(join(root, "Navbar.tsx"), "utf8");
const selectorSource = readFileSync(join(root, "InteractiveLevelSelector.tsx"), "utf8");
const heroSource = readFileSync(join(root, "../marketing/sections/HeroSection.tsx"), "utf8");
const planesSource = readFileSync(join(root, "../marketing/sections/PlanesSection.tsx"), "utf8");
const academiaPublicSource = readFileSync(join(root, "../marketing/sections/AcademiaPublicSection.tsx"), "utf8");
const onboardingWizardSource = readFileSync(join(root, "../marketing/AcademiaOnboardingWizard.tsx"), "utf8");
const instrumentSelectorSource = readFileSync(join(root, "../marketing/AcademiaInstrumentSelector.tsx"), "utf8");
const instrumentsDataSource = readFileSync(join(root, "../../data/academia-instruments.ts"), "utf8");
const appSource = readFileSync(join(root, "../../App.tsx"), "utf8");
const previewSource = readFileSync(join(root, "../../pages/FundamentoPreviewPage.tsx"), "utf8");
const lessonSource = readFileSync(join(root, "../../pages/FreeFundamentoLessonPage.tsx"), "utf8");

const LEGACY_PUBLIC_TARGETS = ["probar", "dashboard", "curriculum", "lesson"] as const;
const FORBIDDEN_PUBLIC_TARGETS = ["fundamento-preview", "fundamento-path", ...LEGACY_PUBLIC_TARGETS] as const;

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

  it("muestra Alumno y Regístrate como enlaces públicos", () => {
    assert.equal(navbarSource.includes("Alumno"), true);
    assert.equal(navbarSource.includes("Regístrate"), true);
    assert.equal(navbarSource.includes("onSignIn"), true);
    assert.equal(navbarSource.includes("onRegister"), true);
    assert.equal(navbarSource.includes("Carlos"), false);
    assert.equal(navbarSource.includes("MOCK_USER"), false);
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

  it("expone títulos compuestos por nivel y enfoque", () => {
    assert.equal(buildFocusTitle("fundamento", "basico"), "Fundamento Básico");
    assert.equal(buildFocusTitle("tecnica", "basico"), "Técnica Básica");
    assert.equal(buildFocusTitle("crea", "basico"), "Crea Básico");
    assert.equal(buildFocusTitle("fundamento", "intermedio"), "Fundamento Intermedio");
    assert.equal(buildFocusTitle("tecnica", "intermedio"), "Técnica Intermedia");
    assert.equal(buildFocusTitle("crea", "intermedio"), "Crea Intermedio");
    assert.equal(buildFocusTitle("fundamento", "avanzado"), "Fundamento Avanzado");
    assert.equal(buildFocusTitle("tecnica", "avanzado"), "Técnica Avanzada");
    assert.equal(buildFocusTitle("crea", "avanzado"), "Crea Avanzado");
  });

  it("expone filtros superiores Nivel 1 · Básico, Nivel 2 · Intermedio y Nivel 3 · Avanzado", () => {
    assert.equal(ACADEMIA_TIERS[0]?.selectorLabel, "Nivel 1 · Básico");
    assert.equal(ACADEMIA_TIERS[1]?.selectorLabel, "Nivel 2 · Intermedio");
    assert.equal(ACADEMIA_TIERS[2]?.selectorLabel, "Nivel 3 · Avanzado");
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

describe("HeroSection — funnel público v4 (Visual D threshold)", () => {
  it("CTA del demo vive en Academia, no en el hero de marca", () => {
    assert.equal(heroSource.includes("Ver clase gratuita"), false);
    assert.equal(heroSource.includes('setPage("mi-camino-demo")'), false);
  });

  it("no usa Probar gratis ni rutas prohibidas", () => {
    assert.equal(heroSource.includes("Probar gratis"), false);
    assertNoForbiddenNavigation(heroSource, "HeroSection");
  });
});

describe("PlanesSection — funnel público v3 (embudo demo)", () => {
  it("no muestra 'Ver clase gratuita' — sección Planes es informativa", () => {
    assert.equal(planesSource.includes("Ver clase gratuita"), false);
    assert.equal(planesSource.includes("PUBLIC_FREE_LESSON_PAGE"), false);
    assert.equal(planesSource.includes(`setPage(PUBLIC_FREE_LESSON_PAGE)`), false);
  });

  it("Semestral sigue disparando registro via onSelectSemestralPlan", () => {
    assert.equal(planesSource.includes("onSelectSemestralPlan"), true);
    assert.match(planesSource, /Semestral[\s\S]*onSelectSemestralPlan/);
  });

  it("no usa Probar gratis ni rutas prohibidas", () => {
    assert.equal(planesSource.includes("Probar gratis"), false);
    assertNoForbiddenNavigation(planesSource, "PlanesSection");
  });
});

describe("AcademiaPublicSection — landing T4A", () => {
  it("muestra propuesta de valor sin selector de instrumento", () => {
    assert.equal(academiaPublicSource.includes("Academia Gmusic"), true);
    assert.equal(academiaPublicSource.includes("Un camino guiado para aprender música paso a paso."), true);
    assert.equal(academiaPublicSource.includes("Probar mis 5 clases gratis"), false);
    assert.equal(academiaPublicSource.includes("resolveAcademiaPublicCta"), true);
    assert.equal(academiaPublicSource.includes("AcademiaInstrumentSelector"), false);
    assert.equal(academiaPublicSource.includes("Elige tu instrumento"), false);
    assert.equal(academiaPublicSource.includes('id="academia"'), true);
  });

  it("no navega a páginas legacy ni preview", () => {
    assertNoForbiddenNavigation(academiaPublicSource, "AcademiaPublicSection");
  });
});

describe("AcademiaOnboardingWizard — onboarding interno T4A", () => {
  it("paso 1 habla de elegir instrumento y paso 2 de punto de partida", () => {
    assert.equal(onboardingWizardSource.includes("Elige tu instrumento"), true);
    assert.equal(onboardingWizardSource.includes("Elige tu punto de partida"), true);
    assert.equal(onboardingWizardSource.includes("AcademiaInstrumentSelector"), true);
    assert.equal(onboardingWizardSource.includes("Cambiar instrumento"), true);
  });

  it("tiene CTA dinámico via getDemoUserState", () => {
    assert.equal(onboardingWizardSource.includes("getDemoUserState"), true);
    assert.equal(onboardingWizardSource.includes("cta.label"), true);
    assert.equal(onboardingWizardSource.includes("cta.destination"), true);
  });

  it("CTA inferior pasa por onboarding-quiz si el quiz no se completó", () => {
    assert.equal(onboardingWizardSource.includes("shouldShowTemperamentQuiz"), true);
    assert.equal(onboardingWizardSource.includes("isSubscribedStudent"), true);
    assert.equal(onboardingWizardSource.includes('"onboarding-quiz"'), true);
    assert.equal(onboardingWizardSource.includes("handleAcademiaCta"), true);
    assert.equal(onboardingWizardSource.includes("resolveDemoEntryPage"), true);
  });

  it("no navega a páginas legacy ni preview", () => {
    assertNoForbiddenNavigation(onboardingWizardSource, "AcademiaOnboardingWizard");
  });
});

describe("AcademiaInstrumentSelector — catálogo D-007", () => {
  it("solo guitarra habilitada en catálogo de instrumentos", () => {
    assert.equal(instrumentsDataSource.includes('"guitarra"'), true);
    assert.equal(instrumentsDataSource.includes('"teclado"'), true);
    assert.equal(instrumentsDataSource.includes('"canto"'), true);
    assert.equal(instrumentsDataSource.includes("available: true"), true);
    assert.equal(instrumentsDataSource.includes("available: false"), true);
    assert.equal(instrumentSelectorSource.includes("Próximamente"), true);
    assert.equal(instrumentSelectorSource.includes("Disponible"), true);
  });
});

describe("InteractiveLevelSelector — Academia 3x3 A2.2", () => {
  it("usa selector superior Nivel 1 · Básico, Nivel 2 · Intermedio y Nivel 3 · Avanzado", () => {
    assert.equal(selectorSource.includes("ACADEMIA_TIERS"), true);
    assert.equal(selectorSource.includes("selectorLabel"), true);
    assert.equal(selectorSource.includes("activeTierId"), true);
  });

  it("renderiza tres tarjetas según el nivel activo", () => {
    assert.equal(selectorSource.includes("getTracksForTier(activeTierId)"), true);
    assert.equal(selectorSource.includes("setActiveTierId"), true);
    assert.equal(selectorSource.includes("focusTitle"), true);
  });

  it("Fundamento Básico abre el quiz de onboarding o el camino demo", () => {
    assert.equal(selectorSource.includes("shouldShowTemperamentQuiz"), true);
    assert.equal(selectorSource.includes('"onboarding-quiz"'), true);
    assert.equal(selectorSource.includes('"mi-camino-demo"'), true);
    assert.equal(selectorSource.includes("isFreeClassTrack"), true);
    assert.equal(selectorSource.includes("resolveDemoEntryPage"), true);
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
  it("fundamento-preview y fundamento-path renderizan FreeFundamentoLessonPage", () => {
    assert.equal(appSource.includes("isPublicFreeLessonPage"), true);
    assert.equal(isPublicFreeLessonPage("fundamento-preview"), true);
    assert.equal(isPublicFreeLessonPage("fundamento-path"), true);
    assert.equal(isPublicFreeLessonPage("fundamento-free-lesson"), true);
    assert.match(
      appSource,
      /isPublicFreeLessonPage\(currentPage\)[\s\S]*FreeFundamentoLessonPage/
    );
  });

  it("no monta FundamentoPreviewPage ni PublicFundamentoPathPage", () => {
    assert.equal(appSource.includes("FundamentoPreviewPage"), false);
    assert.equal(appSource.includes("PublicFundamentoPathPage"), false);
    assert.equal(appSource.includes('currentPage === "fundamento-path"'), false);
  });
});

describe("App — flujo Semestral lineal", () => {
  it("Semestral abre registro obligatorio y luego checkout", () => {
    assert.equal(appSource.includes("handleSemestralPlanSelect"), true);
    assert.equal(appSource.includes("pendingSemestralCheckout"), true);
    assert.equal(appSource.includes("SEMESTRAL_CHECKOUT_COURSE"), true);
    assert.equal(appSource.includes("registrationOnly={pendingSemestralCheckout}"), true);
    assert.equal(appSource.includes('setCurrentPage("checkout")'), true);
    assert.equal(appSource.includes('handlePageChange("mi-estudio")'), true);
    assert.equal(appSource.includes('setCurrentPage("mi-estudio")'), false);
    assert.equal(appSource.includes("activateSemestralWithAccessVerification"), true);
    assert.equal(appSource.includes("isSemestralCheckoutCourse"), true);
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

  it("valida la respuesta esperada del desafío", () => {
    assert.equal(isExpectedFreeFundamentoAnswer("body"), true);
    assert.equal(isExpectedFreeFundamentoAnswer("neck"), false);
    assert.equal(isExpectedFreeFundamentoAnswer(null), false);
  });
});

describe("nextFreeFundamentoLessonPhase", () => {
  it("avanza video → challenge → success", () => {
    assert.equal(nextFreeFundamentoLessonPhase("video"), "challenge");
    assert.equal(nextFreeFundamentoLessonPhase("challenge"), "success");
    assert.equal(nextFreeFundamentoLessonPhase("success"), "success");
  });
});

describe("FreeFundamentoLessonPage", () => {
  it("monta consola interactiva a pantalla completa", () => {
    assert.equal(lessonSource.includes("height: \"100vh\""), true);
    assert.equal(lessonSource.includes("Postura básica"), false);
    assert.equal(lessonSource.includes("Partes principales"), false);
    assert.equal(lessonSource.includes("FREE_FUNDAMENTO_GUITAR_IMAGE_URL"), false);
  });

  it("reutiliza VideoPlayerLesson y MultipleChoiceExercise", () => {
    assert.equal(lessonSource.includes("VideoPlayerLesson"), true);
    assert.equal(lessonSource.includes("MultipleChoiceExercise"), true);
    assert.equal(lessonSource.includes("FreeFundamentoStationStepper"), true);
    assert.equal(lessonSource.includes("LessonRunnerShell"), false);
    assert.equal(lessonSource.includes("useLessonRunner"), false);
  });

  it("expone estaciones Video, Desafío y Éxito", () => {
    assert.equal(lessonSource.includes("FREE_FUNDAMENTO_STATIONS"), true);
    assert.equal(lessonSource.includes("FreeFundamentoStationStepper"), true);
    assert.equal(lessonSource.includes('phase === "video"'), true);
    assert.equal(lessonSource.includes('phase === "challenge"'), true);
    assert.equal(lessonSource.includes('phase === "success"'), true);
  });

  it("resuelve el desafío antes de avanzar", () => {
    assert.equal(lessonSource.includes("isExpectedFreeFundamentoAnswer"), true);
    assert.equal(lessonSource.includes("challengeResolved"), true);
    assert.equal(lessonSource.includes("playFreeFundamentoSuccessFeedback"), true);
    assert.equal(lessonSource.includes("disabled={!canContinue}"), true);
  });

  it("no califica con terminología de grading del runner privado", () => {
    assert.equal(lessonSource.includes("correct"), false);
    assert.equal(lessonSource.includes("accuracy"), false);
  });

  it("no muestra XP, racha ni semana completada", () => {
    assert.equal(lessonSource.includes("XP"), false);
    assert.equal(lessonSource.includes("racha"), false);
    assert.equal(lessonSource.includes("Semana completada"), false);
    assert.equal(lessonSource.includes("CofreVirtual"), false);
  });

  it("muestra CTA de planes al completar", () => {
    assert.equal(lessonSource.includes("¡Primera clase completada!"), true);
    assert.equal(lessonSource.includes("Ver planes"), true);
    assert.equal(lessonSource.includes('navigateToHomeSection(setPage, "planes")'), true);
  });
});

describe("App — rutas públicas del funnel A2.2", () => {
  it("registra fundamento-free-lesson sin DEV_LEGACY", () => {
    assert.equal(appSource.includes("isPublicFreeLessonPage(currentPage)"), true);
    assert.match(
      appSource,
      /isPublicFreeLessonPage\(currentPage\)[\s\S]*FreeFundamentoLessonPage/
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
        dispatchEvent() {
          return true;
        },
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
        dispatchEvent() {
          return true;
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

  it("emite evento de sección activa al desplazar", () => {
    let notifiedSection: string | null = null;

    const previousWindow = globalThis.window;
    const previousDocument = globalThis.document;

    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        pageYOffset: 0,
        scrollTo() {},
        dispatchEvent(event: Event) {
          if (event.type === ACTIVE_HOME_SECTION_EVENT) {
            notifiedSection = (event as CustomEvent<{ sectionId: string }>).detail.sectionId;
          }
          return true;
        },
      },
    });

    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        getElementById() {
          return {
            getBoundingClientRect() {
              return { top: 400 };
            },
          };
        },
      },
    });

    try {
      scrollToHomeSection("academia");
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

    assert.equal(notifiedSection, "academia");
  });
});

describe("Navbar active section sync", () => {
  it("escucha navegación programática y prioriza la sección más profunda en scroll", () => {
    assert.match(navbarSource, /ACTIVE_HOME_SECTION_EVENT/);
    assert.match(navbarSource, /notifyActiveHomeSection/);
    assert.match(navbarSource, /detectActiveHomeSection/);
    assert.match(navbarSource, /setActiveSection\(id\)/);
    assert.doesNotMatch(navbarSource, /rect\.bottom >= 150/);
  });
});
