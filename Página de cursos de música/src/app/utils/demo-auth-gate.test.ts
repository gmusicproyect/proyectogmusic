import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAnonymousSession,
  requiresAccountForPage,
  resolveDemoEntryPage,
  shouldBlockProtectedPage,
} from "./demo-auth-gate";
import {
  CLASE_GRATUITA_MAP_PAGE,
  claseGratuitaLessonPage,
} from "./clase-gratuita-routing";

describe("demo-auth-gate", () => {
  it("anonymous visitors are gated on quiz + clase gratuita pages", () => {
    assert.equal(resolveDemoEntryPage("anonymous", CLASE_GRATUITA_MAP_PAGE), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("error", CLASE_GRATUITA_MAP_PAGE), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", "onboarding-quiz"), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", claseGratuitaLessonPage(1)), "registro-cuenta");
    assert.equal(resolveDemoEntryPage("anonymous", claseGratuitaLessonPage(5)), "registro-cuenta");
  });

  it("registered_no_sub keeps target demo pages", () => {
    assert.equal(resolveDemoEntryPage("registered_no_sub", CLASE_GRATUITA_MAP_PAGE), CLASE_GRATUITA_MAP_PAGE);
    assert.equal(resolveDemoEntryPage("registered_no_sub", "onboarding-quiz"), "onboarding-quiz");
    assert.equal(resolveDemoEntryPage("registered_no_sub", claseGratuitaLessonPage(2)), claseGratuitaLessonPage(2));
  });

  it("loading blocks protected pages at render time", () => {
    assert.equal(resolveDemoEntryPage("loading", CLASE_GRATUITA_MAP_PAGE), CLASE_GRATUITA_MAP_PAGE);
    assert.equal(resolveDemoEntryPage("loading", claseGratuitaLessonPage(1)), claseGratuitaLessonPage(1));
    assert.equal(shouldBlockProtectedPage("loading", CLASE_GRATUITA_MAP_PAGE), true);
  });

  it("requiresAccountForPage covers funnel entry and lessons", () => {
    assert.equal(requiresAccountForPage(CLASE_GRATUITA_MAP_PAGE), true);
    assert.equal(requiresAccountForPage("onboarding-quiz"), true);
    assert.equal(requiresAccountForPage(claseGratuitaLessonPage(3)), true);
    assert.equal(requiresAccountForPage("home"), false);
  });

  it("isAnonymousSession groups anonymous and error", () => {
    assert.equal(isAnonymousSession("anonymous"), true);
    assert.equal(isAnonymousSession("error"), true);
    assert.equal(isAnonymousSession("registered_no_sub"), false);
  });
});
