import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  derivePathHeaderIdentity,
  deriveStudentInitials,
  deriveWelcomeHeaderSubtitle,
  deriveStreakChipCopy,
  NEUTRAL_STUDENT_NAME,
  resolveStudentDisplayName,
} from "../../utils/student-zone-identity";
import { navigateStudentZoneAware } from "../../utils/student-zone-routing";

const root = dirname(fileURLToPath(import.meta.url));
const headerSource = readFileSync(join(root, "GmusicInternalHeader.tsx"), "utf8");
const welcomeSource = readFileSync(join(root, "../../pages/GmusicWelcome.tsx"), "utf8");
const pathSource = readFileSync(join(root, "../../pages/GmusicPath.tsx"), "utf8");

describe("student-zone-identity", () => {
  it("usa fallback neutral cuando no hay nombre de API", () => {
    assert.equal(resolveStudentDisplayName(undefined), NEUTRAL_STUDENT_NAME);
    assert.equal(resolveStudentDisplayName("   "), NEUTRAL_STUDENT_NAME);
    assert.equal(resolveStudentDisplayName("…"), NEUTRAL_STUDENT_NAME);
  });

  it("conserva nombre de API cuando está disponible", () => {
    assert.equal(resolveStudentDisplayName("Juan Lizama"), "Juan Lizama");
  });

  it("deriva iniciales desde el nombre visible", () => {
    assert.equal(deriveStudentInitials("Juan Lizama"), "JL");
    assert.equal(deriveStudentInitials(NEUTRAL_STUDENT_NAME), "AG");
  });

  it("Welcome usa phaseLabel del dashboard como subtítulo", () => {
    assert.equal(
      deriveWelcomeHeaderSubtitle("Fundamento · Mes 1", false),
      "Fundamento · Mes 1"
    );
    assert.equal(deriveWelcomeHeaderSubtitle(undefined, true), "Conectando con tu estudio");
  });

  it("Path usa identidad neutral con subtítulo del badge", () => {
    assert.deepEqual(
      derivePathHeaderIdentity(
        { instrument: "Guitarra", month: "Mes 1", level: "Fundamento" },
        false
      ),
      {
        userName: NEUTRAL_STUDENT_NAME,
        userSubtitle: "Guitarra · Fundamento",
      }
    );
    assert.deepEqual(derivePathHeaderIdentity(undefined, true), {
      userName: NEUTRAL_STUDENT_NAME,
      userSubtitle: "Tu camino musical",
    });
  });

  it("racha 0 no usa copy Racha activa", () => {
    assert.doesNotMatch(deriveStreakChipCopy(0, false).label, /Racha activa/i);
  });
});

describe("GmusicInternalHeader — modal próximamente", () => {
  it("LOCKED_NAV_MODAL no suena a upsell de plan", () => {
    assert.equal(headerSource.includes("Disponible en el plan completo"), false);
    assert.match(headerSource, /Próximamente en tu academia/);
  });
});

describe("GmusicInternalHeader — Inicio e identidad (continuación)", () => {
  it("expone Inicio en escritorio y menú móvil con icono Home", () => {
    assert.equal(headerSource.includes('from "lucide-react"'), true);
    assert.equal(headerSource.includes("Home"), true);
    assert.match(headerSource, /hidden md:inline-flex[\s\S]*Inicio/);
    assert.match(headerSource, /md:hidden[\s\S]*Inicio/);
  });

  it("Inicio invoca navegación home", () => {
    assert.equal(headerSource.includes('setPage("home")'), true);
  });

  it("no depende de MOCK_USER ni muestra Carlos", () => {
    assert.equal(headerSource.includes("MOCK_USER"), false);
    assert.equal(headerSource.includes("Carlos"), false);
    assert.equal(headerSource.includes("getUserPathLabel"), false);
  });

  it("recibe userName y userSubtitle por props", () => {
    assert.match(headerSource, /userName:\s*string/);
    assert.match(headerSource, /userSubtitle:\s*string/);
    assert.equal(headerSource.includes("{userName}"), true);
    assert.equal(headerSource.includes("{userSubtitle}"), true);
  });
});

describe("GmusicWelcome — identidad API", () => {
  it("obtiene nombre desde dashboard y lo pasa al header", () => {
    assert.equal(welcomeSource.includes("resolveStudentDisplayName"), true);
    assert.equal(welcomeSource.includes("viewModel?.userName"), true);
    assert.equal(welcomeSource.includes("userName={headerUserName}"), true);
    assert.equal(welcomeSource.includes("MOCK_USER"), false);
  });

  it("usa StudentHeroPanel sin copy fake Semana 3", () => {
    assert.equal(welcomeSource.includes("StudentHeroPanel"), true);
    assert.equal(welcomeSource.includes("Semana 3"), false);
    assert.equal(welcomeSource.includes("StudioAtmosphere"), true);
  });
});

describe("GmusicPath — identidad compartida", () => {
  it("usa derivePathHeaderIdentity sin MOCK_USER", () => {
    assert.equal(pathSource.includes("derivePathHeaderIdentity"), true);
    assert.equal(pathSource.includes("MOCK_USER"), false);
    assert.equal(pathSource.includes("userName={headerIdentity.userName}"), true);
  });

  it("pasa nombre de sesión autenticada al header", () => {
    assert.equal(pathSource.includes("useAuth"), true);
    assert.match(pathSource, /session\.status === "authenticated"/);
    assert.equal(pathSource.includes("sessionStudentName"), true);
  });
});

describe("navigateStudentZoneAware — salida a Inicio", () => {
  function withMockLocation(pathname: string, run: () => void): string {
    let currentPath = pathname;
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
        pushState() {},
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

  it("desde /alumno navega a home y deja la URL en /", () => {
    let nextPage = "mi-estudio";
    const finalPath = withMockLocation("/alumno", () => {
      navigateStudentZoneAware("home", (page) => {
        nextPage = page;
      }, "mi-estudio");
    });

    assert.equal(nextPage, "home");
    assert.equal(finalPath, "/");
  });

  it("desde /mi-camino navega a home y deja la URL en /", () => {
    let nextPage = "mi-camino";
    const finalPath = withMockLocation("/mi-camino", () => {
      navigateStudentZoneAware("home", (page) => {
        nextPage = page;
      }, "mi-camino");
    });

    assert.equal(nextPage, "home");
    assert.equal(finalPath, "/");
  });
});
