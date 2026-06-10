import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAcceptCheckoutSubmission } from "./checkout-submission";

describe("shouldAcceptCheckoutSubmission", () => {
  it("rechaza envíos mientras hay uno en curso", () => {
    assert.equal(shouldAcceptCheckoutSubmission(true, false), false);
    assert.equal(shouldAcceptCheckoutSubmission(false, true), false);
    assert.equal(shouldAcceptCheckoutSubmission(true, true), false);
  });

  it("acepta envío cuando no hay procesamiento activo", () => {
    assert.equal(shouldAcceptCheckoutSubmission(false, false), true);
  });
});
