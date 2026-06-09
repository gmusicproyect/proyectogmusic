import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadLessonSessionOnce } from "./lesson-session-load";
import type { LessonSessionStartResult } from "./types";
import { GmusicApiError } from "./client";

const NODE_ID = "550e8400-e29b-41d4-a716-446655440001";

const BASE_RESULT: LessonSessionStartResult = {
  kind: "created",
  session: {
    sessionId: "550e8400-e29b-41d4-a716-446655440010",
    nodeId: NODE_ID,
    status: "STARTED",
    startedAt: "2026-06-08T15:00:00.000Z",
    expiresAt: "2026-06-08T18:00:00.000Z",
    exercises: [],
  },
};

describe("loadLessonSessionOnce", () => {
  it("solicitud abortada no produce error visual", async () => {
    const controller = new AbortController();
    controller.abort();

    const outcome = await loadLessonSessionOnce(NODE_ID, controller.signal, {
      createLessonSession: async () => BASE_RESULT,
    });

    assert.equal(outcome.type, "aborted");
  });

  it("retry exitoso reemplaza estado error", async () => {
    let attempts = 0;
    const createLessonSession = async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new GmusicApiError("Servicio no disponible", 503, "INTERNAL_ERROR");
      }
      return BASE_RESULT;
    };

    const first = await loadLessonSessionOnce(NODE_ID, new AbortController().signal, {
      createLessonSession,
    });
    assert.equal(first.type, "error");

    const second = await loadLessonSessionOnce(NODE_ID, new AbortController().signal, {
      createLessonSession,
    });
    assert.equal(second.type, "success");
    if (second.type === "success") {
      assert.equal(second.result.kind, "created");
    }
  });

  it("INVALID_NODE devuelve mensaje útil para la UI", async () => {
    const outcome = await loadLessonSessionOnce(NODE_ID, new AbortController().signal, {
      createLessonSession: async () => {
        throw new GmusicApiError(
          "El nodo no está disponible para iniciar una sesión de práctica.",
          400,
          "INVALID_NODE"
        );
      },
    });

    assert.equal(outcome.type, "error");
    if (outcome.type === "error") {
      assert.match(outcome.message, /no está disponible/i);
      assert.match(outcome.message, /camino/i);
    }
  });

  it("serialización del resultado no contiene campos secretos", async () => {
    const outcome = await loadLessonSessionOnce(NODE_ID, new AbortController().signal, {
      createLessonSession: async () => BASE_RESULT,
    });

    assert.equal(outcome.type, "success");
    if (outcome.type === "success") {
      const serialized = JSON.stringify(outcome.result);
      assert.equal(serialized.includes("secureAnswer"), false);
      assert.equal(serialized.includes("correctOptionId"), false);
      assert.equal(serialized.includes("explanationAfterAnswer"), false);
      assert.equal(serialized.includes("isCorrect"), false);
      assert.equal(serialized.includes("accuracy"), false);
      assert.equal(serialized.includes("xpEarned"), false);
    }
  });
});

describe("respuestas obsoletas de sesión", () => {
  it("respuesta antigua no sobrescribe retry exitoso", async () => {
    const manager = await import("../../hooks/dashboard-request").then(
      (m) => new m.DashboardRequestManager()
    );

    let resolveSlow!: (value: LessonSessionStartResult) => void;
    let callCount = 0;

    const createLessonSession = async (
      _nodeId: string,
      options?: { signal?: AbortSignal }
    ) => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise<LessonSessionStartResult>((resolve, reject) => {
          options?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
          resolveSlow = resolve;
        });
      }
      return { ...BASE_RESULT, kind: "reused" as const };
    };

    const deps = { createLessonSession };

    const { generation: slowGeneration, signal: slowSignal } = manager.begin();
    const slowPromise = loadLessonSessionOnce(NODE_ID, slowSignal, deps);

    const { generation: fastGeneration, signal: fastSignal } = manager.begin();
    const fastOutcome = await loadLessonSessionOnce(NODE_ID, fastSignal, deps);

    assert.equal(fastOutcome.type, "success");
    assert.equal(manager.isCurrent(fastGeneration), true);
    assert.equal(manager.isCurrent(slowGeneration), false);
    if (fastOutcome.type === "success") {
      assert.equal(fastOutcome.result.kind, "reused");
    }

    resolveSlow({ ...BASE_RESULT, kind: "created" });
    const slowOutcome = await slowPromise;
    assert.equal(slowOutcome.type, "aborted");

    const appliedFast = manager.isCurrent(fastGeneration)
      ? fastOutcome.type === "success"
        ? fastOutcome.result
        : null
      : null;

    assert.notEqual(appliedFast, null);
    assert.equal(appliedFast?.kind, "reused");
  });
});

describe("useStartLessonSession contract via load + manager", () => {
  it("abort al iniciar nueva solicitud invalida la anterior", async () => {
    const manager = await import("../../hooks/dashboard-request").then(
      (m) => new m.DashboardRequestManager()
    );

    let slowAborted = false;
    const createLessonSession = async (
      _nodeId: string,
      options?: { signal?: AbortSignal }
    ) => {
      await new Promise<void>((resolve, reject) => {
        options?.signal?.addEventListener("abort", () => {
          slowAborted = true;
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
        setTimeout(resolve, 50);
      });
      return BASE_RESULT;
    };

    const { signal: slowSignal } = manager.begin();
    const slowPromise = loadLessonSessionOnce(NODE_ID, slowSignal, { createLessonSession });

    const { generation: fastGeneration, signal: fastSignal } = manager.begin();
    const fastOutcome = await loadLessonSessionOnce(NODE_ID, fastSignal, { createLessonSession });

    const slowOutcome = await slowPromise;

    assert.equal(slowAborted, true);
    assert.equal(slowOutcome.type, "aborted");
    assert.equal(fastOutcome.type, "success");
    assert.equal(manager.isCurrent(fastGeneration), true);
  });
});
