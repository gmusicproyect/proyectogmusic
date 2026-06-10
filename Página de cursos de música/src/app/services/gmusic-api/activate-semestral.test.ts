import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import type { AccessResponse } from "./types";

const VALID_ACTIVATION = {
  user: {
    id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Ana Semestral",
    email: "ana.semestral@gmusic.academy",
  },
  subscription: {
    status: "ACTIVE",
    planId: "gmusic-semester-6-months",
    endsAt: "2026-12-09T22:01:13.367Z",
  },
  access: {
    canAccessStudentZone: true,
    reason: "ACTIVE_SUBSCRIPTION",
  },
};

const ALLOWED_ACCESS: AccessResponse = {
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

const DENIED_ACCESS: AccessResponse = {
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
let assertValidActivateSemestralResponse: typeof import("./activate-semestral").assertValidActivateSemestralResponse;
let assertSemestralActivationVerified: typeof import("./activate-semestral").assertSemestralActivationVerified;
let activateSemestralWithAccessVerification: typeof import("./activate-semestral").activateSemestralWithAccessVerification;
let GmusicApiError: typeof import("./client").GmusicApiError;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: {},
    configurable: true,
  });
  ({
    assertValidActivateSemestralResponse,
    assertSemestralActivationVerified,
    activateSemestralWithAccessVerification,
  } = await import("./activate-semestral"));
  ({ GmusicApiError } = await import("./client"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchWithAccess(access: AccessResponse, activation = VALID_ACTIVATION) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/dev/activate-semestral")) {
      assert.equal(init?.method, "POST");
      return new Response(JSON.stringify(activation), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.endsWith("/me/access")) {
      return new Response(JSON.stringify(access), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    throw new Error(`fetch inesperado: ${url}`);
  }) as typeof fetch;
}

describe("assertValidActivateSemestralResponse", () => {
  it("acepta payload semestral válido", () => {
    const parsed = assertValidActivateSemestralResponse(VALID_ACTIVATION);
    assert.equal(parsed.user.email, "ana.semestral@gmusic.academy");
    assert.equal(parsed.subscription.planId, "gmusic-semester-6-months");
  });

  it("rechaza payload incompleto fail-closed", () => {
    assert.throws(
      () => assertValidActivateSemestralResponse({ user: VALID_ACTIVATION.user }),
      GmusicApiError
    );
    assert.throws(
      () =>
        assertValidActivateSemestralResponse({
          ...VALID_ACTIVATION,
          subscription: { ...VALID_ACTIVATION.subscription, planId: "other-plan" },
        }),
      /plan semestral/i
    );
  });
});

describe("assertSemestralActivationVerified", () => {
  it("acepta activación y acceso coherentes", () => {
    assert.doesNotThrow(() =>
      assertSemestralActivationVerified(
        "Ana.Semestral@gmusic.academy",
        assertValidActivateSemestralResponse(VALID_ACTIVATION),
        ALLOWED_ACCESS
      )
    );
  });

  it("falla si el email de activación difiere", () => {
    assert.throws(
      () =>
        assertSemestralActivationVerified(
          "ana.semestral@gmusic.academy",
          assertValidActivateSemestralResponse({
            ...VALID_ACTIVATION,
            user: { ...VALID_ACTIVATION.user, email: "otro@gmusic.academy" },
          }),
          ALLOWED_ACCESS
        ),
      /activación no coincide/i
    );
  });

  it("falla si el email de acceso difiere", () => {
    assert.throws(
      () =>
        assertSemestralActivationVerified(
          "ana.semestral@gmusic.academy",
          assertValidActivateSemestralResponse(VALID_ACTIVATION),
          {
            ...ALLOWED_ACCESS,
            user: { ...ALLOWED_ACCESS.user, email: "otro@gmusic.academy" },
          }
        ),
      /sesión verificada no coincide/i
    );
  });

  it("falla si el id difiere", () => {
    assert.throws(
      () =>
        assertSemestralActivationVerified(
          "ana.semestral@gmusic.academy",
          assertValidActivateSemestralResponse(VALID_ACTIVATION),
          {
            ...ALLOWED_ACCESS,
            user: { ...ALLOWED_ACCESS.user, id: "other-id" },
          }
        ),
      /usuario activado/i
    );
  });

  it("falla si el plan de acceso difiere", () => {
    assert.throws(
      () =>
        assertSemestralActivationVerified(
          "ana.semestral@gmusic.academy",
          assertValidActivateSemestralResponse(VALID_ACTIVATION),
          {
            ...ALLOWED_ACCESS,
            subscription: {
              status: "ACTIVE",
              planId: "other-plan",
              endsAt: ALLOWED_ACCESS.subscription!.endsAt,
            },
          }
        ),
      /plan semestral activo/i
    );
  });

  it("falla si el acceso está denegado", () => {
    assert.throws(
      () =>
        assertSemestralActivationVerified(
          "ana.semestral@gmusic.academy",
          assertValidActivateSemestralResponse(VALID_ACTIVATION),
          {
            ...ALLOWED_ACCESS,
            access: {
              canAccessStudentZone: false,
              reason: "NO_ACTIVE_SUBSCRIPTION",
            },
            subscription: {
              status: "ACTIVE",
              planId: "gmusic-semester-6-months",
              endsAt: ALLOWED_ACCESS.subscription!.endsAt,
            },
          }
        ),
      /no otorgó acceso/i
    );
  });
});

describe("activateSemestralWithAccessVerification", () => {
  it("activa y confirma acceso cuando /me/access coincide", async () => {
    let activateCalls = 0;
    let accessCalls = 0;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/dev/activate-semestral")) {
        activateCalls += 1;
        assert.equal(init?.method, "POST");
        const body = JSON.parse(String(init?.body));
        assert.equal(body.planId, "gmusic-semester-6-months");
        assert.equal(body.email, "ana.semestral@gmusic.academy");
        return new Response(JSON.stringify(VALID_ACTIVATION), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (url.endsWith("/me/access")) {
        accessCalls += 1;
        return new Response(JSON.stringify(ALLOWED_ACCESS), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`fetch inesperado: ${url}`);
    }) as typeof fetch;

    const result = await activateSemestralWithAccessVerification({
      name: "Ana Semestral",
      email: "Ana.Semestral@gmusic.academy",
    });

    assert.equal(activateCalls, 1);
    assert.equal(accessCalls, 1);
    assert.equal(result.access.access.canAccessStudentZone, true);
  });

  it("falla si la activación responde error HTTP", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "No encontrado" } }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await assert.rejects(
      () =>
        activateSemestralWithAccessVerification({
          name: "Ana",
          email: "ana@gmusic.academy",
        }),
      (error: unknown) => error instanceof GmusicApiError && error.status === 404
    );
  });

  it("falla si /me/access niega acceso tras activación", async () => {
    mockFetchWithAccess({
      ...ALLOWED_ACCESS,
      access: {
        canAccessStudentZone: false,
        reason: "NO_ACTIVE_SUBSCRIPTION",
      },
      subscription: null,
    });

    await assert.rejects(
      () =>
        activateSemestralWithAccessVerification({
          name: "Ana Semestral",
          email: "ana.semestral@gmusic.academy",
        }),
      /plan semestral activo/i
    );
  });

  it("falla cerrado si el email verificado en acceso no coincide", async () => {
    mockFetchWithAccess({
      ...ALLOWED_ACCESS,
      user: { ...ALLOWED_ACCESS.user, email: "otro@gmusic.academy" },
    });

    await assert.rejects(
      () =>
        activateSemestralWithAccessVerification({
          name: "Ana Semestral",
          email: "ana.semestral@gmusic.academy",
        }),
      /no coincide/i
    );
  });
});
