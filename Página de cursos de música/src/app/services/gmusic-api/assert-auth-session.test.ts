import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GmusicApiError } from "./client";
import { assertAuthSessionEstablished } from "./assert-auth-session";

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

describe("T-UX-COPY-LOGIN — copy anonymous según contexto", () => {
  it("login anonymous no usa texto de registro", () => {
    assert.throws(
      () => assertAuthSessionEstablished({ type: "anonymous" }, "login"),
      (error: unknown) => {
        assert.ok(error instanceof GmusicApiError);
        assert.match(error.message, /Iniciaste sesión/);
        assert.doesNotMatch(error.message, /Tu cuenta se creó/);
        return true;
      }
    );
  });

  it("register (default) conserva el copy actual", () => {
    assert.throws(
      () => assertAuthSessionEstablished({ type: "anonymous" }),
      (error: unknown) => {
        assert.ok(error instanceof GmusicApiError);
        assert.match(error.message, /Tu cuenta se creó/);
        return true;
      }
    );
  });
});
