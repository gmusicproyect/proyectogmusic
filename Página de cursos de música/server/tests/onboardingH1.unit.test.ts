import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildOnboardingResultH1,
  resolveCurrentMonthH1,
  suggestMonthH1,
  stubFirstUnitId,
} from "../lib/onboardingH1.js";
import { ApiError } from "../lib/errors.js";

describe("P0-02 onboarding mapping H1 (unit)", () => {
  it("T-OB-01: beginner → currentMonth=1, firstUnit=m1-u1", () => {
    const result = buildOnboardingResultH1("user-1", {
      instrument: "guitarra",
      learningGoal: "play_songs",
      experienceLevel: "beginner",
      weeklyGoalMinutes: 90,
    });
    assert.equal(result.currentMonth, 1);
    assert.equal(result.firstUnitId, stubFirstUnitId(1));
    assert.equal(
      result.firstUnitId,
      "ruta:guitarra-fundamentos:v1/m01/u01"
    );
    assert.equal(result.activeRutaSlug, "guitarra-fundamentos");
    assert.equal(result.onboardingStatus, "completed");
  });

  it("T-OB-02: some sin confirmar → M1; con confirmPlacement → M2", () => {
    assert.equal(suggestMonthH1("some", false), 1);
    assert.equal(suggestMonthH1("some", true), 2);
    assert.equal(
      resolveCurrentMonthH1({
        experienceLevel: "some",
        confirmedMonth: 2,
        confirmPlacement: false,
      }),
      1
    );
    assert.equal(
      resolveCurrentMonthH1({
        experienceLevel: "some",
        confirmedMonth: 2,
        confirmPlacement: true,
      }),
      2
    );
  });

  it("T-OB-03: comfortable no puede set month>3", () => {
    assert.throws(
      () =>
        resolveCurrentMonthH1({
          experienceLevel: "comfortable",
          confirmedMonth: 4,
          confirmPlacement: true,
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400
    );
  });

  it("T-OB-04 unit: teclado no completa", () => {
    assert.throws(
      () =>
        buildOnboardingResultH1("user-1", {
          instrument: "teclado",
          learningGoal: "technique",
          experienceLevel: "beginner",
          weeklyGoalMinutes: 60,
        }),
      (err: unknown) => err instanceof ApiError && err.status === 400
    );
  });
});
