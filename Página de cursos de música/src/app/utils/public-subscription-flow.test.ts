import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSemestralCheckoutPlan,
  isSemestralCheckoutCourse,
  SEMESTRAL_CHECKOUT_COURSE,
} from "./public-subscription-flow";

describe("public-subscription-flow — Semestral", () => {
  it("detecta el curso de checkout Semestral por helper tipado", () => {
    assert.equal(isSemestralCheckoutCourse(SEMESTRAL_CHECKOUT_COURSE), true);
    assert.equal(isSemestralCheckoutCourse({ id: 9001 }), true);
    assert.equal(isSemestralCheckoutCourse({ id: 42 }), false);
  });

  it("expone plan Semestral con duración 6 meses y precio del curso", () => {
    const plan = getSemestralCheckoutPlan();
    assert.equal(plan.name, "Semestral");
    assert.equal(plan.duration, "6 meses");
    assert.equal(plan.price, SEMESTRAL_CHECKOUT_COURSE.price);
  });
});
