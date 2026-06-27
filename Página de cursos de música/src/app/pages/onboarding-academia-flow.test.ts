import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const quizSource = readFileSync(join(root, "TemperamentQuizPage.tsx"), "utf8");
const appSource = readFileSync(join(root, "../App.tsx"), "utf8");
const onboardingPageSource = readFileSync(join(root, "OnboardingAcademiaPage.tsx"), "utf8");

describe("TemperamentQuizPage — post-quiz hacia onboarding-academia", () => {
  it("tras completar o saltar el quiz navega a onboarding-academia, no al demo directo", () => {
    assert.match(quizSource, /setPage\("onboarding-academia"\)/);
    assert.equal(quizSource.includes('navigateToHomeSection(setPage, "academia")'), false);
    assert.equal(quizSource.includes('setPage("mi-camino-demo")'), false);
  });
});

describe("OnboardingAcademiaPage — flujo interno T4A", () => {
  it("monta el wizard de instrumento y nivel", () => {
    assert.match(onboardingPageSource, /AcademiaOnboardingWizard/);
    assert.match(onboardingPageSource, /fondoacademia\.png/);
  });

  it("App expone onboarding-academia con guard de sesión", () => {
    assert.match(appSource, /currentPage === "onboarding-academia"/);
    assert.match(appSource, /DemoAuthGuard[\s\S]*OnboardingAcademiaPage/);
    assert.match(appSource, /"onboarding-academia"/);
  });
});
