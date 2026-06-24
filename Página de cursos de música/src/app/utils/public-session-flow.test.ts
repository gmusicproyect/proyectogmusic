import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const navbarSource = readFileSync(join(root, "../components/music/Navbar.tsx"), "utf8");

describe("R3.3D — sesión pública y logout", () => {
  it("App comparte useAuth con Navbar y refresca tras checkout", () => {
    assert.equal(appSource.includes("useAuth"), true);
    assert.equal(appSource.includes("session={publicSession}"), true);
    assert.match(appSource, /activateSemestralWithAccessVerification[\s\S]*refreshPublicSession/);
    assert.equal(appSource.includes("postDevLogout"), true);
    assert.match(appSource, /postDevLogout[\s\S]*refreshPublicSession/);
  });

  it("Navbar anónimo muestra Alumno y Regístrate", () => {
    assert.equal(navbarSource.includes("Alumno"), true);
    assert.equal(navbarSource.includes("Regístrate"), true);
    assert.equal(navbarSource.includes("renderAnonymousAuth"), true);
  });

  it("Navbar autenticado muestra nombre, Mi Estudio y Cerrar sesión", () => {
    assert.equal(navbarSource.includes("Mi Estudio"), true);
    assert.equal(navbarSource.includes("Cerrar sesión"), true);
    assert.equal(navbarSource.includes('session.status === "authenticated"'), true);
    assert.equal(navbarSource.includes("Carlos"), false);
    assert.equal(navbarSource.includes("MOCK_USER"), false);
  });

  it("logout confirmado navega a home y no usa almacenamiento local", () => {
    assert.match(appSource, /sessionOutcome\.type !== "anonymous"/);
    assert.equal(appSource.includes('handlePageChange("home")'), true);
    assert.equal(appSource.includes('handlePageChange("fundamento-free-lesson")'), false);
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
