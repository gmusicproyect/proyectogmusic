import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAnonymousSession,
  requiresAccountForPage,
  resolveDemoEntryPage,
  shouldBlockProtectedPage,
} from "./demo-auth-gate";

describe("demo-auth-gate", () => {
  it("anonymous visitors are gated to registro-cuenta on demo entry", () => {
    assert.equal(resolveDemoEntryPage("anonymous", "mi-camino-demo"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "onboarding-quiz"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "onboarding-academia"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("error", "mi-camino-demo"), "registro-cuenta");
  });

  it("anonymous visitors are gated on demo clases and free fundamento pages", () => {
    assert.equal(resolveDemoEntryPage("anonymous", "demo-clase-1"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "demo-clase-5"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "fundamento-free-lesson"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "fundamento-preview"), "registro-cuenta");
  });

  it("logged-in users reach demo entry pages", () => {
    assert.equal(resolveDemoEntryPage("registered_no_sub", "mi-camino-demo"), "mi-camino-demo");
    assert.equal(resolveDemoEntryPage("registered_no_sub", "onboarding-academia"), "onboarding-academia");
    assert.equal(resolveDemoEntryPage("authenticated", "onboarding-quiz"), "onboarding-quiz");
    assert.equal(resolveDemoEntryPage("registered_no_sub", "demo-clase-2"), "demo-clase-2");
  });

  it("non-demo destinations are unchanged for anonymous users", () => {
    assert.equal(resolveDemoEntryPage("anonymous", "inscripcion-gate"), "inscripcion-gate");
    assert.equal(resolveDemoEntryPage("anonymous", "home"), "home");
    assert.equal(resolveDemoEntryPage("anonymous", "login-cuenta"), "login-cuenta");
  });

  it("loading preserves protected target until session resolves (guard blocks render)", () => {
    assert.equal(resolveDemoEntryPage("loading", "mi-camino-demo"), "mi-camino-demo");
    assert.equal(resolveDemoEntryPage("loading", "demo-clase-1"), "demo-clase-1");
    assert.equal(shouldBlockProtectedPage("loading", "mi-camino-demo"), true);
  });

  it("isAnonymousSession covers anonymous and error", () => {
    assert.equal(isAnonymousSession("anonymous"), true);
    assert.equal(isAnonymousSession("error"), true);
    assert.equal(isAnonymousSession("registered_no_sub"), false);
    assert.equal(isAnonymousSession("authenticated"), false);
  });

  it("requiresAccountForPage covers funnel demo, clases and free fundamento", () => {
    assert.equal(requiresAccountForPage("mi-camino-demo"), true);
    assert.equal(requiresAccountForPage("onboarding-academia"), true);
    assert.equal(requiresAccountForPage("demo-clase-3"), true);
    assert.equal(requiresAccountForPage("fundamento-free-lesson"), true);
    assert.equal(requiresAccountForPage("home"), false);
    assert.equal(requiresAccountForPage("registro-cuenta"), false);
  });
});
