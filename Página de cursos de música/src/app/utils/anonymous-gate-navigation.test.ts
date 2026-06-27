import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAnonymousSession,
  requiresAccountForPage,
  resolveDemoEntryPage,
  shouldBlockProtectedPage,
} from "./demo-auth-gate";

const PROTECTED_ENTRY_POINTS = [
  "mi-camino-demo",
  "onboarding-quiz",
  "onboarding-academia",
  "demo-clase-1",
  "demo-clase-4",
  "fundamento-free-lesson",
  "fundamento-preview",
  "fundamento-path",
] as const;

describe("anonymous click → registro-cuenta (criterio QA)", () => {
  for (const page of PROTECTED_ENTRY_POINTS) {
    it(`anonymous + ${page} → registro-cuenta`, () => {
      assert.equal(requiresAccountForPage(page), true);
      assert.equal(resolveDemoEntryPage("anonymous", page), "registro-cuenta");
      assert.equal(shouldBlockProtectedPage("anonymous", page), true);
    });
  }

  it("registered_no_sub conserva destinos demo", () => {
    assert.equal(resolveDemoEntryPage("registered_no_sub", "mi-camino-demo"), "mi-camino-demo");
    assert.equal(resolveDemoEntryPage("registered_no_sub", "demo-clase-2"), "demo-clase-2");
  });

  it("loading bloquea render de páginas protegidas", () => {
    assert.equal(shouldBlockProtectedPage("loading", "mi-camino-demo"), true);
    assert.equal(isAnonymousSession("loading"), false);
  });
});

describe("resolveDemoEntryPage — destinos públicos sin cambio", () => {
  it("home y registro no se alteran para anonymous", () => {
    assert.equal(resolveDemoEntryPage("anonymous", "home"), "home");
    assert.equal(resolveDemoEntryPage("anonymous", "registro-cuenta"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "login-cuenta"), "login-cuenta");
  });
});
