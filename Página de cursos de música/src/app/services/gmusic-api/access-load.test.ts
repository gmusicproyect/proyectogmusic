import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadAccessOnce } from "./access-load";
import type { AccessResponse } from "./types";
import { GmusicApiError } from "./client";
import { DashboardRequestManager } from "../../hooks/dashboard-request";
import { applyAccessOutcome } from "../../hooks/student-access-request";

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

describe("loadAccessOnce", () => {
  it("solicitud abortada no produce error visual", async () => {
    const controller = new AbortController();
    controller.abort();

    const outcome = await loadAccessOnce(controller.signal, {
      fetchAccess: async () => ALLOWED_RESPONSE,
    });

    assert.equal(outcome.type, "aborted");
  });

  it("acceso permitido incluye usuario y suscripción", async () => {
    const outcome = await loadAccessOnce(new AbortController().signal, {
      fetchAccess: async () => ALLOWED_RESPONSE,
    });

    assert.equal(outcome.type, "allowed");
    if (outcome.type === "allowed") {
      assert.equal(outcome.user.email, "juan@gmusic.academy");
      assert.equal(outcome.subscription.planId, "gmusic-semester-6-months");
    }
  });

  it("acceso denegado incluye motivo", async () => {
    const outcome = await loadAccessOnce(new AbortController().signal, {
      fetchAccess: async () => DENIED_RESPONSE,
    });

    assert.equal(outcome.type, "denied");
    if (outcome.type === "denied") {
      assert.equal(outcome.reason, "NO_ACTIVE_SUBSCRIPTION");
    }
  });

  it("respuesta malformada falla cerrada", async () => {
    const outcome = await loadAccessOnce(new AbortController().signal, {
      fetchAccess: async () => {
        throw new GmusicApiError(
          "La respuesta de acceso no tiene el formato esperado.",
          200,
          "INVALID_RESPONSE"
        );
      },
    });

    assert.equal(outcome.type, "error");
    if (outcome.type === "error") {
      assert.match(outcome.message, /formato esperado/i);
    }
  });

  it("retry exitoso reemplaza estado error", async () => {
    let attempts = 0;
    const fetchAccess = async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new GmusicApiError("Servicio no disponible", 503, "INTERNAL_ERROR");
      }
      return ALLOWED_RESPONSE;
    };

    const first = await loadAccessOnce(new AbortController().signal, { fetchAccess });
    assert.equal(first.type, "error");

    const second = await loadAccessOnce(new AbortController().signal, { fetchAccess });
    assert.equal(second.type, "allowed");
    assert.equal(attempts, 2);
  });
});

describe("respuestas obsoletas de acceso", () => {
  it("respuesta antigua no sobrescribe retry exitoso", async () => {
    const manager = new DashboardRequestManager();
    let resolveSlow!: (value: AccessResponse) => void;
    let callCount = 0;

    const fetchAccess = async ({ signal }: { signal?: AbortSignal } = {}) => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise<AccessResponse>((resolve, reject) => {
          signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
          resolveSlow = resolve;
        });
      }
      return DENIED_RESPONSE;
    };

    const deps = { fetchAccess };

    const { generation: slowGeneration, signal: slowSignal } = manager.begin();
    const slowPromise = loadAccessOnce(slowSignal, deps);

    const { generation: fastGeneration, signal: fastSignal } = manager.begin();
    const fastOutcome = await loadAccessOnce(fastSignal, deps);

    assert.equal(fastOutcome.type, "denied");
    assert.equal(manager.isCurrent(fastGeneration), true);
    assert.equal(manager.isCurrent(slowGeneration), false);

    resolveSlow(ALLOWED_RESPONSE);
    const slowOutcome = await slowPromise;
    assert.equal(slowOutcome.type, "aborted");

    const appliedFast = manager.isCurrent(fastGeneration)
      ? applyAccessOutcome(fastGeneration, manager, fastOutcome)
      : null;

    assert.notEqual(appliedFast, null);
    assert.equal(appliedFast?.status, "denied");
  });
});
