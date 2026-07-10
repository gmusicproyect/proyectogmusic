import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { loadLessonSessionOnce } from "../services/gmusic-api/lesson-session-load";
import type { StartLessonSessionHookState } from "./useStartLessonSession";
import { DashboardRequestManager } from "./dashboard-request";
import type { LessonSessionStartResult } from "../services/gmusic-api/types";
import { GmusicApiError } from "../services/gmusic-api/client";

const NODE_A = "550e8400-e29b-41d4-a716-446655440001";
const NODE_B = "550e8400-e29b-41d4-a716-446655440002";

const SUCCESS_RESULT: LessonSessionStartResult = {
  kind: "created",
  session: {
    sessionId: "550e8400-e29b-41d4-a716-446655440010",
    nodeId: NODE_A,
    status: "STARTED",
    startedAt: "2026-06-08T15:00:00.000Z",
    expiresAt: "2026-06-08T18:00:00.000Z",
    exercises: [],
  },
};

async function simulateHookRun(
  nodeId: string,
  requestGeneration: number,
  manager: DashboardRequestManager,
  createLessonSession: (
    nodeId: string,
    options?: { signal?: AbortSignal }
  ) => Promise<LessonSessionStartResult>
): Promise<StartLessonSessionHookState | null> {
  const { generation, signal } = manager.begin();
  const outcome = await loadLessonSessionOnce(nodeId, signal, { createLessonSession });
  if (!manager.isCurrent(generation)) return null;

  if (outcome.type === "aborted") return null;
  if (outcome.type === "success") {
    return { status: "success", nodeId, requestGeneration, result: outcome.result };
  }
  return { status: "error", nodeId, requestGeneration, message: outcome.message };
}

describe("useStartLessonSession — estados con nodeId", () => {
  it("loading, success y error incluyen nodeId solicitado", async () => {
    const manager = new DashboardRequestManager();
    let generation = 0;

    const success = await simulateHookRun(NODE_A, ++generation, manager, async () => SUCCESS_RESULT);
    assert.equal(success?.status, "success");
    if (success?.status === "success") {
      assert.equal(success.nodeId, NODE_A);
      assert.equal(success.requestGeneration, 1);
    }

    const error = await simulateHookRun(NODE_B, ++generation, manager, async () => {
      throw new GmusicApiError("No disponible", 400, "INVALID_NODE");
    });
    assert.equal(error?.status, "error");
    if (error?.status === "error") {
      assert.equal(error.nodeId, NODE_B);
      assert.equal(error.requestGeneration, 2);
      assert.match(error.message, /no está disponible/i);
    }
  });

  it("retry conserva el nodeId del último intento", async () => {
    let lastRequestedNodeId: string | null = null;
    let attempts = 0;
    let generation = 0;

    const createLessonSession = async (nodeId: string) => {
      lastRequestedNodeId = nodeId;
      attempts += 1;
      if (attempts === 1) {
        throw new GmusicApiError("Servicio no disponible", 503, "INTERNAL_ERROR");
      }
      return { ...SUCCESS_RESULT, session: { ...SUCCESS_RESULT.session, nodeId } };
    };

    const manager = new DashboardRequestManager();
    const lastNodeIdRef = { current: NODE_A as string | null };

    const run = async (nodeId: string) => {
      lastNodeIdRef.current = nodeId;
      return simulateHookRun(nodeId, ++generation, manager, createLessonSession);
    };

    const first = await run(NODE_A);
    assert.equal(first?.status, "error");
    if (first?.status === "error") assert.equal(first.nodeId, NODE_A);

    const retriedNodeId = lastNodeIdRef.current;
    assert.equal(retriedNodeId, NODE_A);

    const second = await run(retriedNodeId!);
    assert.equal(second?.status, "success");
    assert.equal(lastRequestedNodeId, NODE_A);
    assert.equal(attempts, 2);
    if (second?.status === "success") {
      assert.equal(second.requestGeneration, 2);
    }
  });

  it("respuesta obsoleta de nodo A no sobrescribe solicitud de nodo B", async () => {
    const manager = new DashboardRequestManager();
    let resolveSlow!: (value: LessonSessionStartResult) => void;
    let callCount = 0;
    let generation = 0;

    const createLessonSession = async (
      nodeId: string,
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
      return {
        ...SUCCESS_RESULT,
        kind: "reused" as const,
        session: { ...SUCCESS_RESULT.session, nodeId: NODE_B },
      };
    };

    const slowPromise = simulateHookRun(NODE_A, ++generation, manager, createLessonSession);
    const fastOutcome = await simulateHookRun(NODE_B, ++generation, manager, createLessonSession);

    assert.equal(fastOutcome?.status, "success");
    if (fastOutcome?.status === "success") {
      assert.equal(fastOutcome.nodeId, NODE_B);
    }

    resolveSlow({ ...SUCCESS_RESULT, session: { ...SUCCESS_RESULT.session, nodeId: NODE_A } });
    const slowOutcome = await slowPromise;
    assert.equal(slowOutcome, null);
  });
});

describe("useStartLessonSession — contrato de tipos", () => {
  it("expone nodeId y requestGeneration en estados activos", () => {
    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "useStartLessonSession.ts"),
      "utf8"
    );

    assert.match(source, /status: "loading"/);
    assert.match(source, /requestGeneration/);
    assert.match(source, /status: "success"/);
    assert.match(source, /result: outcome\.result/);
    assert.match(source, /status: "error"/);
    assert.match(source, /outcome\.type === "aborted"/);
    assert.match(source, /setState\(\{ status: "idle" \}\)/);
    assert.match(source, /requestGenerationRef/);
    assert.match(source, /reset/);
  });
});
