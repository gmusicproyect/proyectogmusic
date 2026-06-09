import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { loadAccessOnce } from "../services/gmusic-api/access-load";
import type { AccessResponse } from "../services/gmusic-api/types";
import { DashboardRequestManager } from "./dashboard-request";
import { applyAccessOutcome, type StudentAccessHookState } from "./student-access-request";

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
    endsAt: null,
  },
};

async function simulateHookRun(
  manager: DashboardRequestManager,
  fetchAccess: (options?: { signal?: AbortSignal }) => Promise<AccessResponse>
): Promise<StudentAccessHookState | null> {
  const { generation, signal } = manager.begin();
  const outcome = await loadAccessOnce(signal, { fetchAccess });
  return applyAccessOutcome(generation, manager, outcome);
}

describe("useStudentAccess — estados", () => {
  it("abort no muestra error", async () => {
    const controller = new AbortController();
    controller.abort();

    const outcome = await loadAccessOnce(controller.signal, {
      fetchAccess: async () => ALLOWED_RESPONSE,
    });
    const manager = new DashboardRequestManager();
    const nextState = applyAccessOutcome(1, manager, outcome);
    assert.equal(nextState, null);
  });

  it("allowed expone usuario y suscripción", async () => {
    const manager = new DashboardRequestManager();
    const state = await simulateHookRun(manager, async () => ALLOWED_RESPONSE);
    assert.equal(state?.status, "allowed");
    if (state?.status === "allowed") {
      assert.equal(state.user.name, "Juan Lizama");
      assert.equal(state.subscription.planId, "gmusic-semester-6-months");
    }
  });

  it("respuesta obsoleta no sobrescribe retry", async () => {
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
      return ALLOWED_RESPONSE;
    };

    const { generation: slowGeneration, signal: slowSignal } = manager.begin();
    const slowPromise = loadAccessOnce(slowSignal, { fetchAccess });

    const fastState = await simulateHookRun(manager, fetchAccess);
    assert.equal(fastState?.status, "allowed");

    resolveSlow(ALLOWED_RESPONSE);
    const slowOutcome = await slowPromise;
    const slowState = applyAccessOutcome(slowGeneration, manager, slowOutcome);
    assert.equal(slowState, null);
  });
});

describe("useStudentAccess — contrato de hook", () => {
  it("cancela solicitudes al desmontar y expone retry", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "useStudentAccess.ts"),
      "utf8"
    );

    assert.match(source, /manager\.dispose\(\)/);
    assert.match(source, /manager\.begin\(\)/);
    assert.match(source, /retry: load/);
    assert.equal(source.includes("localStorage"), false);
    assert.equal(source.includes("sessionStorage"), false);
  });
});
