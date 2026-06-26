import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertAuthSessionEstablished } from "./assert-auth-session";
import { GmusicApiError } from "./client";

describe("assertAuthSessionEstablished", () => {
  it("acepta registered_no_sub", () => {
    assert.doesNotThrow(() =>
      assertAuthSessionEstablished({
        type: "registered_no_sub",
        user: { id: "1", name: "A", email: "a@test.com" },
      })
    );
  });

  it("acepta authenticated", () => {
    assert.doesNotThrow(() =>
      assertAuthSessionEstablished({
        type: "authenticated",
        user: { id: "1", name: "A", email: "a@test.com" },
        subscription: {
          status: "ACTIVE",
          planId: "plus-semester",
          endsAt: null,
        },
      })
    );
  });

  it("rechaza anonymous con SESSION_NOT_ESTABLISHED", () => {
    assert.throws(
      () => assertAuthSessionEstablished({ type: "anonymous" }),
      (error: unknown) =>
        error instanceof GmusicApiError && error.code === "SESSION_NOT_ESTABLISHED"
    );
  });

  it("rechaza error con SESSION_REFRESH_FAILED", () => {
    assert.throws(
      () => assertAuthSessionEstablished({ type: "error", message: "falló" }),
      (error: unknown) =>
        error instanceof GmusicApiError && error.code === "SESSION_REFRESH_FAILED"
    );
  });
});
