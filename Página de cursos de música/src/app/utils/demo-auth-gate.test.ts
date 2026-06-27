import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAnonymousSession, resolveDemoEntryPage } from "./demo-auth-gate";

describe("demo-auth-gate", () => {
  it("anonymous visitors are gated to registro-cuenta on demo entry", () => {
    assert.equal(resolveDemoEntryPage("anonymous", "mi-camino-demo"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "onboarding-quiz"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "onboarding-academia"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("error", "mi-camino-demo"), "registro-cuenta");
  });

  it("logged-in users reach demo entry pages", () => {
    assert.equal(resolveDemoEntryPage("registered_no_sub", "mi-camino-demo"), "mi-camino-demo");
    assert.equal(resolveDemoEntryPage("registered_no_sub", "onboarding-academia"), "onboarding-academia");
    assert.equal(resolveDemoEntryPage("authenticated", "onboarding-quiz"), "onboarding-quiz");
  });

  it("non-demo destinations are unchanged for anonymous users", () => {
    assert.equal(resolveDemoEntryPage("anonymous", "inscripcion-gate"), "inscripcion-gate");
    assert.equal(resolveDemoEntryPage("anonymous", "home"), "home");
  });

  it("loading preserves the target until session resolves", () => {
    assert.equal(resolveDemoEntryPage("loading", "mi-camino-demo"), "mi-camino-demo");
  });

  it("isAnonymousSession covers anonymous and error", () => {
    assert.equal(isAnonymousSession("anonymous"), true);
    assert.equal(isAnonymousSession("error"), true);
    assert.equal(isAnonymousSession("registered_no_sub"), false);
    assert.equal(isAnonymousSession("authenticated"), false);
  });
});
