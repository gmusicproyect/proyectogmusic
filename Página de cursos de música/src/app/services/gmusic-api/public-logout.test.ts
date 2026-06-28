import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, before, describe, it } from "node:test";
import { GmusicApiError } from "./client";

const originalFetch = globalThis.fetch;
let logoutAccount: typeof import("./auth").logoutAccount;
let performPublicLogout: typeof import("./public-logout").performPublicLogout;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: { DEV: true },
    configurable: true,
  });
  ({ logoutAccount } = await import("./auth"));
  ({ performPublicLogout } = await import("./public-logout"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("logoutAccount", () => {
  it("usa POST /auth/logout con credentials e ignora 204", async () => {
    let url = "";
    let init: RequestInit | undefined;

    globalThis.fetch = (async (input, options) => {
      url = String(input);
      init = options;
      return new Response(null, { status: 204 });
    }) as typeof fetch;

    await assert.doesNotReject(() => logoutAccount());
    assert.match(url, /\/auth\/logout$/);
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "include");
  });

  it("propaga mensaje del backend en 404", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Ruta no encontrada." } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await assert.rejects(
      () => logoutAccount(),
      (error: unknown) =>
        error instanceof GmusicApiError &&
        error.status === 404 &&
        error.message === "Ruta no encontrada."
    );
  });
});

describe("performPublicLogout", () => {
  it("no llama /dev/logout cuando /auth/logout falla", async () => {
    const urls: string[] = [];

    globalThis.fetch = (async (input) => {
      urls.push(String(input));
      return new Response(JSON.stringify({ error: { message: "Ruta no encontrada." } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    await assert.rejects(() => performPublicLogout());
    assert.equal(urls.length, 1);
    assert.match(urls[0], /\/auth\/logout$/);
  });

  it("usa /auth/logout como endpoint principal (no /dev/logout solo)", async () => {
    const source = readFileSync(
      new URL("./public-logout.ts", import.meta.url),
      "utf8"
    );
    assert.match(source, /logoutAccount\(\)/);
    assert.match(source, /postDevLogout/);
    assert.doesNotMatch(source, /await postDevLogout\(\)[\s\S]*await logoutAccount/);
  });
});
