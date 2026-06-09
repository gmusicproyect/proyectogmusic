import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import type { LessonSessionResponse } from "./types";

const NODE_ID = "550e8400-e29b-41d4-a716-446655440001";
const SESSION_RESPONSE: LessonSessionResponse = {
  sessionId: "550e8400-e29b-41d4-a716-446655440010",
  nodeId: NODE_ID,
  status: "STARTED",
  startedAt: "2026-06-08T15:00:00.000Z",
  expiresAt: "2026-06-08T18:00:00.000Z",
  exercises: [
    {
      id: "550e8400-e29b-41d4-a716-446655440020",
      type: "IDENTIFY_NOTE",
      difficulty: 1,
      instruction: "Identifica la nota.",
      contentPayload: {
        options: [
          { id: "a", text: "Mi" },
          { id: "b", text: "La" },
        ],
      },
    },
  ],
};

const originalFetch = globalThis.fetch;
let createLessonSession: typeof import("./lesson-session").createLessonSession;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: {},
    configurable: true,
  });
  ({ createLessonSession } = await import("./lesson-session"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetchWithStatus(status: number, body: unknown = SESSION_RESPONSE) {
  let capturedUrl = "";
  let capturedInit: RequestInit | undefined;

  globalThis.fetch = (async (url, init) => {
    capturedUrl = String(url);
    capturedInit = init;
    return new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  return {
    get capturedUrl() {
      return capturedUrl;
    },
    get capturedInit() {
      return capturedInit;
    },
  };
}

describe("createLessonSession", () => {
  it("envía POST con nodeId en el body y headers JSON", async () => {
    const mock = mockFetchWithStatus(201);

    await createLessonSession(NODE_ID);

    assert.match(mock.capturedUrl, /\/lesson-sessions$/);
    assert.equal(mock.capturedInit?.method, "POST");
    assert.equal(
      (mock.capturedInit?.headers as Record<string, string>)["Content-Type"],
      "application/json"
    );
    assert.equal(
      (mock.capturedInit?.headers as Record<string, string>).Accept,
      "application/json"
    );
    assert.deepEqual(JSON.parse(String(mock.capturedInit?.body)), { nodeId: NODE_ID });
  });

  it("devuelve kind created cuando la API responde 201", async () => {
    mockFetchWithStatus(201);

    const result = await createLessonSession(NODE_ID);

    assert.equal(result.kind, "created");
    assert.equal(result.session.sessionId, SESSION_RESPONSE.sessionId);
    assert.equal(result.session.exercises.length, 1);
  });

  it("devuelve kind reused cuando la API responde 200", async () => {
    mockFetchWithStatus(200);

    const result = await createLessonSession(NODE_ID);

    assert.equal(result.kind, "reused");
    assert.equal(result.session.nodeId, NODE_ID);
  });

  it("rechaza status exitoso inesperado con UNEXPECTED_API_RESPONSE", async () => {
    mockFetchWithStatus(202);

    await assert.rejects(
      () => createLessonSession(NODE_ID),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.name, "GmusicApiError");
        assert.equal((error as { code: string }).code, "UNEXPECTED_API_RESPONSE");
        assert.equal((error as { status: number }).status, 202);
        return true;
      }
    );
  });

  it("propaga GmusicApiError en respuestas de error", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "nodeId inválido",
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )) as typeof fetch;

    await assert.rejects(
      () => createLessonSession("not-a-uuid"),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.name, "GmusicApiError");
        assert.equal((error as { code: string }).code, "VALIDATION_ERROR");
        return true;
      }
    );
  });

  it("respeta AbortSignal", async () => {
    const controller = new AbortController();
    controller.abort();

    globalThis.fetch = (async (_url, init) => {
      if (init?.signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
      }
      return new Response(JSON.stringify(SESSION_RESPONSE), { status: 201 });
    }) as typeof fetch;

    await assert.rejects(
      () => createLessonSession(NODE_ID, { signal: controller.signal }),
      (error: unknown) => error instanceof DOMException && error.name === "AbortError"
    );
  });
});

describe("seguridad del resultado de sesión", () => {
  it("acepta una respuesta limpia", async () => {
    mockFetchWithStatus(201);

    const result = await createLessonSession(NODE_ID);
    const serialized = JSON.stringify(result);

    assert.equal(result.kind, "created");
    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
    assert.equal(serialized.includes("explanationAfterAnswer"), false);
    assert.equal(serialized.includes("isCorrect"), false);
    assert.equal(serialized.includes("accuracy"), false);
    assert.equal(serialized.includes("xpEarned"), false);
  });

  it("rechaza campos prohibidos anidados con UNSAFE_API_RESPONSE", async () => {
    const unsafeResponse = {
      ...SESSION_RESPONSE,
      exercises: [
        {
          ...SESSION_RESPONSE.exercises[0],
          contentPayload: {
            options: [{ id: "a", text: "Mi" }],
            meta: {
              secureAnswer: {
                correctOptionId: "a",
                explanationAfterAnswer: "secreto",
              },
            },
          },
        },
      ],
    };

    mockFetchWithStatus(201, unsafeResponse);

    await assert.rejects(
      () => createLessonSession(NODE_ID),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.equal(error.name, "GmusicApiError");
        assert.equal((error as { code: string }).code, "UNSAFE_API_RESPONSE");
        assert.equal((error as { status: number }).status, 201);
        return true;
      }
    );
  });
});
