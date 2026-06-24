import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import type { AccessResponse } from "./types";

const ALLOWED_RESPONSE: AccessResponse = {
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Ana Semestral",
    email: "ana.semestral@gmusic.academy",
  },
  access: {
    canAccessStudentZone: true,
    reason: "ACTIVE_SUBSCRIPTION",
  },
  subscription: {
    status: "ACTIVE",
    planId: "gmusic-semester-6-months",
    endsAt: "2026-12-09T22:01:13.367Z",
  },
};

const originalFetch = globalThis.fetch;
let loadPublicStudentSessionOnce: typeof import("./public-student-session").loadPublicStudentSessionOnce;
let mapPublicStudentSessionOutcome: typeof import("./public-student-session").mapPublicStudentSessionOutcome;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: {},
    configurable: true,
  });
  ({ loadPublicStudentSessionOnce, mapPublicStudentSessionOutcome } = await import(
    "./public-student-session"
  ));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("loadPublicStudentSessionOnce", () => {
  it("interpreta 401 como visitante anónimo", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { code: "UNAUTHORIZED", message: "Sesión cerrada." } }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    const outcome = await loadPublicStudentSessionOnce(new AbortController().signal);
    assert.equal(outcome.type, "anonymous");
    assert.equal(mapPublicStudentSessionOutcome(outcome)?.status, "anonymous");
  });

  it("interpreta 200 permitido como authenticated", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify(ALLOWED_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    const outcome = await loadPublicStudentSessionOnce(new AbortController().signal);
    assert.equal(outcome.type, "authenticated");
    if (outcome.type === "authenticated") {
      assert.equal(outcome.user.email, "ana.semestral@gmusic.academy");
    }
  });

  it("interpreta 200 denegado como registered_no_sub", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          ...ALLOWED_RESPONSE,
          access: { canAccessStudentZone: false, reason: "NO_ACTIVE_SUBSCRIPTION" },
          subscription: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )) as typeof fetch;

    const outcome = await loadPublicStudentSessionOnce(new AbortController().signal);
    assert.equal(outcome.type, "registered_no_sub");
    assert.equal(mapPublicStudentSessionOutcome(outcome)?.status, "registered_no_sub");
  });

  it("interpreta errores distintos de 401 como error recuperable", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Fallo" } }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    const outcome = await loadPublicStudentSessionOnce(new AbortController().signal);
    assert.equal(outcome.type, "error");
  });
});
