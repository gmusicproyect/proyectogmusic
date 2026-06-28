import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const navbarSource = readFileSync(join(root, "../components/music/Navbar.tsx"), "utf8");
const registroSource = readFileSync(join(root, "../pages/RegistroCuentaPage.tsx"), "utf8");

describe("R3.3D — sesión pública y logout", () => {
  it("App comparte useAuth con Navbar y refresca tras checkout", () => {
    assert.equal(appSource.includes("useAuth"), true);
    assert.equal(appSource.includes("session={publicSession}"), true);
    assert.match(appSource, /activateSemestralWithAccessVerification[\s\S]*refreshPublicSession/);
    assert.equal(appSource.includes("authLogout"), true);
    assert.match(appSource, /authLogout[\s\S]*refreshPublicSession/);
    assert.equal(appSource.includes("postDevLogout"), false);
    assert.equal(appSource.includes("/auth/logout"), false);
  });

  it("Navbar anónimo muestra Iniciar sesión y Regístrate", () => {
    assert.equal(navbarSource.includes("Iniciar sesión"), true);
    assert.equal(navbarSource.includes("Regístrate"), true);
    assert.equal(navbarSource.includes("renderAnonymousAuth"), true);
    assert.equal(navbarSource.includes(">Alumno<"), false);
  });

  it("Navbar registered_no_sub muestra bienvenida en botón primario hacia el camino", () => {
    assert.equal(navbarSource.includes("renderRegisteredAuth"), true);
    assert.equal(navbarSource.includes('session.status === "registered_no_sub"'), true);
    assert.match(navbarSource, /Bienvenido, \{firstName\}/);
    assert.equal(navbarSource.includes("resolveAcademiaPublicCta"), true);
    assert.match(navbarSource, /cta\.destination/);
    assert.equal(navbarSource.includes("cta.label"), false);
  });

  it("Navbar autenticado muestra nombre, Mi academia y Cerrar sesión", () => {
    assert.equal(navbarSource.includes("Mi academia"), true);
    assert.equal(navbarSource.includes("Cerrar sesión"), true);
    assert.equal(navbarSource.includes('session.status === "authenticated"'), true);
    assert.equal(navbarSource.includes("Carlos"), false);
    assert.equal(navbarSource.includes("MOCK_USER"), false);
  });

  it("logout confirmado navega a home y no usa almacenamiento local", () => {
    assert.match(appSource, /sessionOutcome\.type !== "anonymous"/);
    assert.equal(appSource.includes('handlePageChange("home")'), true);
    assert.equal(appSource.includes('handlePageChange("fundamento-free-lesson")'), false);
    assert.equal(appSource.includes("Ruta no encontrada"), false);
    for (const source of [appSource, navbarSource]) {
      assert.equal(source.includes("localStorage"), false);
      assert.equal(source.includes("sessionStorage"), false);
    }
  });

  it("fallo de logout conserva sesión visible y permite reintentar", () => {
    assert.equal(appSource.includes("setLogoutError"), true);
    assert.equal(appSource.includes("shouldAcceptLogoutSubmission"), true);
    assert.equal(navbarSource.includes("logoutError"), true);
    assert.equal(navbarSource.includes("logoutProcessing"), true);
  });
});

describe("R3.3E — redirección suave home → Mi Estudio", () => {
  it("App declara useRef para hasAppliedAuthenticatedLandingRef", () => {
    assert.match(appSource, /hasAppliedAuthenticatedLandingRef/);
    assert.match(appSource, /useRef\(false\)/);
  });

  it("useEffect de redirección depende de session status y currentPage", () => {
    assert.match(
      appSource,
      /hasAppliedAuthenticatedLandingRef[\s\S]*publicSession\.status[\s\S]*mi-estudio/
    );
  });

  it("redirección usa handlePageChange, no setCurrentPage directamente", () => {
    assert.match(appSource, /handlePageChange\("mi-estudio"\)/);
  });

  it("no usa localStorage ni sessionStorage para el flag de redirección", () => {
    assert.equal(appSource.includes("localStorage"), false);
    assert.equal(appSource.includes("sessionStorage"), false);
  });
});

describe("PR2 — funnel demo requiere cuenta", () => {
  it("onboarding-quiz y demo-clase usan DemoAuthGuard", () => {
    assert.match(appSource, /currentPage === "onboarding-quiz"[\s\S]*DemoAuthGuard/);
    assert.match(appSource, /currentPage === "mi-camino-demo"[\s\S]*DemoAuthGuard/);
    assert.match(appSource, /demoLessonId !== null[\s\S]*DemoAuthGuard/);
  });

  it("FreeFundamentoLessonPage usa DemoAuthGuard", () => {
    assert.match(
      appSource,
      /isPublicFreeLessonPage\(currentPage\)[\s\S]*DemoAuthGuard[\s\S]*FreeFundamentoLessonPage/
    );
  });

  it("handlePageChange y sesión anónima redirigen páginas protegidas", () => {
    assert.equal(appSource.includes("resolveDemoEntryPage"), true);
    assert.equal(appSource.includes("requiresAccountForPage"), true);
    assert.equal(appSource.includes("isAnonymousSession"), true);
    assert.match(appSource, /navigateStudentZoneAware\("registro-cuenta"/);
  });

  it("initStudentZoneRouting aplica gate de sesión al popstate inicial", () => {
    assert.match(
      appSource,
      /initStudentZoneRouting\(applyRoutedPage[\s\S]*resolveDemoEntryPage\(publicSession\.status, page\)/
    );
  });

  it("App no pasa setCurrentPage sin gate a páginas con setPage", () => {
    assert.equal(appSource.includes("CommunityPage setPage={setCurrentPage}"), false);
    assert.equal(appSource.includes("ProbarPage setPage={setCurrentPage}"), false);
    assert.equal(appSource.includes("FreeFundamentoLessonPage setPage={handlePageChange}"), true);
  });

  it("Navbar auth anónimo usa login-cuenta y registro-cuenta", () => {
    assert.match(appSource, /onSignIn=\{\(\) => handlePageChange\("login-cuenta"\)/);
    assert.match(appSource, /onRegister=\{\(\) => handlePageChange\("registro-cuenta"\)/);
  });

  it("páginas de auth quedan fuera de Navbar y MusicPlayer", () => {
    assert.equal(appSource.includes('"registro-cuenta"'), true);
    assert.equal(appSource.includes('"login-cuenta"'), true);
    assert.equal(appSource.includes('"registro-exito"'), true);
  });

  it("registro-exito muestra mensaje de regalo y redirige al onboarding", () => {
    assert.match(
      registroSource,
      /Gracias por inscribirte, te regalamos las primeras 5 clases/
    );
    assert.match(registroSource, /setPage\("onboarding-quiz"\)/);
    assert.match(registroSource, /isLoggedIn/);
    assert.match(registroSource, /setTimeout/);
  });
});
