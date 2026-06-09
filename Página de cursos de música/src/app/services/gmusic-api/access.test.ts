import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import type { AccessResponse } from "./types";

const ALLOWED_RESPONSE: AccessResponse = {
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Juan Lizama",
    email: "juan@gmusic.academy",
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

const DENIED_RESPONSE: AccessResponse = {
  user: {
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Carlos",
    email: "carlos@gmusic.academy",
  },
  access: {
    canAccessStudentZone: false,
    reason: "NO_ACTIVE_SUBSCRIPTION",
  },
  subscription: null,
};

const originalFetch = globalThis.fetch;
let assertValidAccessResponse: typeof import("./access").assertValidAccessResponse;
let fetchAccess: typeof import("./access").fetchAccess;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: {},
    configurable: true,
  });
  ({ assertValidAccessResponse, fetchAccess } = await import("./access"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("assertValidAccessResponse", () => {
  it("acepta respuesta permitida válida", () => {
    const parsed = assertValidAccessResponse(ALLOWED_RESPONSE);
    assert.equal(parsed.access.canAccessStudentZone, true);
    assert.equal(parsed.subscription?.planId, "gmusic-semester-6-months");
  });

  it("acepta respuesta denegada válida", () => {
    const parsed = assertValidAccessResponse(DENIED_RESPONSE);
    assert.equal(parsed.access.canAccessStudentZone, false);
    assert.equal(parsed.subscription, null);
  });

  it("rechaza respuesta malformada (fail closed)", () => {
    assert.throws(
      () => assertValidAccessResponse({ user: { id: "x" } }),
      (error: unknown) =>
        error instanceof Error &&
        error.message.match(/formato esperado|usuario válido|estado de acceso/i) !== null
    );
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...ALLOWED_RESPONSE,
          subscription: null,
        }),
      (error: unknown) =>
        error instanceof Error && /suscripción válida/i.test(error.message)
    );
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...DENIED_RESPONSE,
          subscription: ALLOWED_RESPONSE.subscription,
        }),
      (error: unknown) =>
        error instanceof Error && /inesperada/i.test(error.message)
    );
  });

  it("rechaza allowed + NO_ACTIVE_SUBSCRIPTION", () => {
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...ALLOWED_RESPONSE,
          access: {
            canAccessStudentZone: true,
            reason: "NO_ACTIVE_SUBSCRIPTION",
          },
        }),
      (error: unknown) =>
        error instanceof Error && /motivo declarado/i.test(error.message)
    );
  });

  it("rechaza denied + ACTIVE_SUBSCRIPTION", () => {
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...DENIED_RESPONSE,
          access: {
            canAccessStudentZone: false,
            reason: "ACTIVE_SUBSCRIPTION",
          },
        }),
      (error: unknown) =>
        error instanceof Error && /motivo declarado/i.test(error.message)
    );
  });

  it("rechaza allowed + subscription null", () => {
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...ALLOWED_RESPONSE,
          subscription: null,
        }),
      (error: unknown) =>
        error instanceof Error && /suscripción válida/i.test(error.message)
    );
  });

  it("rechaza denied + subscription presente", () => {
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...DENIED_RESPONSE,
          subscription: ALLOWED_RESPONSE.subscription,
        }),
      (error: unknown) =>
        error instanceof Error && /inesperada/i.test(error.message)
    );
  });

  it("rechaza endsAt inválido", () => {
    assert.throws(
      () =>
        assertValidAccessResponse({
          ...ALLOWED_RESPONSE,
          subscription: {
            ...ALLOWED_RESPONSE.subscription!,
            endsAt: "not-a-date",
          },
        }),
      (error: unknown) =>
        error instanceof Error && /suscripción válida/i.test(error.message)
    );
  });
});

describe("fetchAccess", () => {
  it("consulta GET /me/access y valida la respuesta", async () => {
    let capturedUrl = "";
    globalThis.fetch = (async (url) => {
      capturedUrl = String(url);
      return new Response(JSON.stringify(ALLOWED_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const response = await fetchAccess();
    assert.match(capturedUrl, /\/me\/access$/);
    assert.equal(response.user.name, "Juan Lizama");
  });
});
