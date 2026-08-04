import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CLASE_GRATUITA_MAP_PAGE,
  claseGratuitaLessonPage,
} from "./clase-gratuita-routing";
import { resolveDemoEntryPage, shouldBlockProtectedPage } from "./demo-auth-gate";

describe("anonymous-gate-navigation", () => {
  const protectedPages = [
    CLASE_GRATUITA_MAP_PAGE,
    "onboarding-quiz",
    "onboarding-academia",
    claseGratuitaLessonPage(1),
    claseGratuitaLessonPage(4),
  ] as const;

  it("anonymous always redirected to registro-cuenta for protected pages", () => {
    for (const page of protectedPages) {
      assert.equal(resolveDemoEntryPage("anonymous", page), "registro-cuenta");
    }
  });

  it("registered_no_sub keeps protected demo targets", () => {
    assert.equal(resolveDemoEntryPage("registered_no_sub", CLASE_GRATUITA_MAP_PAGE), CLASE_GRATUITA_MAP_PAGE);
    assert.equal(resolveDemoEntryPage("registered_no_sub", claseGratuitaLessonPage(2)), claseGratuitaLessonPage(2));
  });

  it("loading blocks protected pages", () => {
    assert.equal(shouldBlockProtectedPage("loading", CLASE_GRATUITA_MAP_PAGE), true);
  });
});
