import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { assertResponseHasNoSecrets, sanitizeContentPayload } from "../lib/exercisePublic.js";
import { SESSION_TTL_MS } from "../lib/sessionTtl.js";
import { parseLessonSessionBody } from "../lib/validation.js";
import { ApiError } from "../lib/errors.js";
import {
  assertUserProgressSnapshotsEqual,
  captureUserProgressSnapshot,
  countStartedSessions,
  deleteStudentSessionsForNode,
  getDevStudent,
  getNodeIdsByStatus,
  getSessionStatus,
  hasDatabase,
  markNodeCompleted,
  restoreUserProgressSnapshot,
  setSessionStartedAt,
  type UserProgressSnapshot,
} from "./helpers/db.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";

describe("sanitizeContentPayload", () => {
  it("elimina secretos anidados en objetos y arrays sin mutar el original", () => {
    const original = {
      correctOptionId: "root-secret",
      options: [
        { id: "a", text: "A", correctOptionId: "nested-secret" },
        {
          id: "b",
          text: "B",
          hints: [{ explanationAfterAnswer: "deep-secret" }],
        },
      ],
      metadata: {
        explanationAfterAnswer: "another-secret",
        nested: { correctOptionId: "deeper-secret" },
      },
    };

    const sanitized = sanitizeContentPayload(original);

    assert.equal(original.correctOptionId, "root-secret");
    assert.equal(
      (original.options[1] as { hints: Array<{ explanationAfterAnswer: string }> }).hints[0]
        .explanationAfterAnswer,
      "deep-secret"
    );
    assert.notEqual(sanitized, original);
    assert.doesNotThrow(() => assertResponseHasNoSecrets({ contentPayload: sanitized }));

    const sanitizedJson = JSON.stringify(sanitized);
    assert.ok(sanitizedJson.includes('"options"'));
    assert.ok(sanitizedJson.includes('"id":"a"'));
    assert.equal(sanitizedJson.includes("correctOptionId"), false);
    assert.equal(sanitizedJson.includes("explanationAfterAnswer"), false);
  });
});

describe("parseLessonSessionBody", () => {
  it("rechaza body inválido", () => {
    assert.throws(
      () => parseLessonSessionBody({}),
      (error: unknown) =>
        error instanceof ApiError &&
        error.code === "VALIDATION_ERROR" &&
        error.status === 400
    );

    assert.throws(
      () => parseLessonSessionBody({ nodeId: "not-a-uuid" }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});

const integration = hasDatabase ? describe : describe.skip;

integration("POST /api/v1/lesson-sessions", () => {
  const app = createApp();
  let activeNodeId = "";
  let lockedNodeId = "";
  let studentId = "";
  let originalUserProgress: UserProgressSnapshot | null = null;

  let studentCookie = "";

  before(async () => {
    const student = await getDevStudent();
    studentId = student.id;
    studentCookie = await buildSessionCookieHeader(studentId);
    const nodes = await getNodeIdsByStatus(studentId);
    activeNodeId = nodes.active ?? "";
    lockedNodeId = nodes.locked ?? "";
    assert.ok(activeNodeId, "Se requiere un nodo active en el seed");
    assert.ok(lockedNodeId, "Se requiere un nodo locked en el seed");
    originalUserProgress = await captureUserProgressSnapshot(studentId, activeNodeId);
    await deleteStudentSessionsForNode(studentId, activeNodeId);
  });

  after(async () => {
    if (activeNodeId && studentId && originalUserProgress) {
      await deleteStudentSessionsForNode(studentId, activeNodeId);
      await restoreUserProgressSnapshot(studentId, activeNodeId, originalUserProgress);

      const finalUserProgress = await captureUserProgressSnapshot(studentId, activeNodeId);
      assertUserProgressSnapshotsEqual(finalUserProgress, originalUserProgress);
    }
    await prismaDisconnect();
  });

  it("rechaza nodo locked", async () => {
    const response = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: lockedNodeId });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "INVALID_NODE");
  });

  it("rechaza nodo completed", async () => {
    assert.ok(originalUserProgress, "Snapshot de UserProgress requerido");

    await markNodeCompleted(studentId, activeNodeId);

    const response = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "INVALID_NODE");

    await restoreUserProgressSnapshot(studentId, activeNodeId, originalUserProgress);
  });

  it("permite nodo active y devuelve 201", async () => {
    await deleteStudentSessionsForNode(studentId, activeNodeId);

    const response = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(response.status, 201);
    assert.equal(response.body.status, "STARTED");
    assert.equal(response.body.nodeId, activeNodeId);
    assert.ok(response.body.sessionId);
    assert.ok(Array.isArray(response.body.exercises));
    assert.ok(response.body.exercises.length > 0);

    const expiresAt = new Date(response.body.expiresAt).getTime();
    const startedAt = new Date(response.body.startedAt).getTime();
    assert.equal(expiresAt - startedAt, SESSION_TTL_MS);
  });

  it("reutiliza sesión válida sin duplicar (200)", async () => {
    await deleteStudentSessionsForNode(studentId, activeNodeId);

    const first = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(first.status, 201);

    const second = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(second.status, 200);
    assert.equal(second.body.sessionId, first.body.sessionId);

    const startedCount = await countStartedSessions(studentId, activeNodeId);
    assert.equal(startedCount, 1);
  });

  it("abandona sesión vencida y crea una nueva (201)", async () => {
    await deleteStudentSessionsForNode(studentId, activeNodeId);

    const first = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(first.status, 201);
    const expiredStartedAt = new Date(Date.now() - SESSION_TTL_MS - 60_000);
    await setSessionStartedAt(first.body.sessionId, expiredStartedAt);

    const second = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(second.status, 201);
    assert.notEqual(second.body.sessionId, first.body.sessionId);

    const oldSession = await getSessionStatus(first.body.sessionId);
    assert.equal(oldSession.status, "ABANDONED");
  });

  it("no expone secretos en la respuesta", async () => {
    await deleteStudentSessionsForNode(studentId, activeNodeId);

    const response = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId: activeNodeId });

    assert.equal(response.status, 201);
    assert.doesNotThrow(() => assertResponseHasNoSecrets(response.body));
  });

  it("serializa creaciones concurrentes en una sola sesión STARTED", async () => {
    await deleteStudentSessionsForNode(studentId, activeNodeId);

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        request(app)
          .post("/api/v1/lesson-sessions")
          .set("Cookie", studentCookie)
          .send({ nodeId: activeNodeId })
      )
    );

    const sessionIds = responses.map((response) => response.body.sessionId as string);
    assert.equal(new Set(sessionIds).size, 1);

    const statusCodes = responses.map((response) => response.status);
    assert.equal(statusCodes.filter((status) => status === 201).length, 1);
    assert.equal(statusCodes.filter((status) => status === 200).length, 9);

    const startedCount = await countStartedSessions(studentId, activeNodeId);
    assert.equal(startedCount, 1);
  });
});

describe("devStudentAuth in production (lesson-sessions)", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  before(() => {
    process.env.NODE_ENV = "production";
  });

  after(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("rechaza POST /api/v1/lesson-sessions con 401 UNAUTHORIZED", async () => {
    const response = await request(createApp())
      .post("/api/v1/lesson-sessions")
      .send({ nodeId: "550e8400-e29b-41d4-a716-446655440000" });

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });
});

async function prismaDisconnect() {
  const { prisma } = await import("../lib/prisma.js");
  await prisma.$disconnect();
}
