import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import { GmusicApiError } from "./client";
import { shouldAcceptLogoutSubmission } from "./public-logout";

const originalFetch = globalThis.fetch;
let postDevLogout: typeof import("./dev-logout").postDevLogout;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: {},
    configurable: true,
  });
  ({ postDevLogout } = await import("./dev-logout"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("postDevLogout", () => {
  it("acepta HTTP 204 sin parsear JSON", async () => {
    let bodyRead = false;
    globalThis.fetch = (async () =>
      new Response(null, {
        status: 204,
      })) as typeof fetch;

    await assert.doesNotReject(() => postDevLogout());
    assert.equal(bodyRead, false);
  });

  it("rechaza respuestas de error HTTP", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "No encontrado" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await assert.rejects(
      () => postDevLogout(),
      (error: unknown) => error instanceof GmusicApiError && error.status === 404
    );
  });
});

describe("shouldAcceptLogoutSubmission", () => {
  it("bloquea doble envío mientras hay uno en curso", () => {
    assert.equal(shouldAcceptLogoutSubmission(true), false);
    assert.equal(shouldAcceptLogoutSubmission(false), true);
  });
});
