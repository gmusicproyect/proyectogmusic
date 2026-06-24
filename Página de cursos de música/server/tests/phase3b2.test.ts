import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { assertResponseHasNoSecrets } from "../lib/exercisePublic.js";
import { parseCompleteSessionBody, parseSessionIdParam } from "../lib/validation.js";
import { ApiError } from "../lib/errors.js";
import { buildAttemptsPayload } from "./helpers/attempts.js";
import {
  assertCompleteTestDbSnapshotsEqual,
  captureCompleteTestDbSnapshot,
  countAttemptsForSession,
  countXpEventsForSession,
  createStartedSession,
  deleteStudentSessionsForNode,
  deleteStreakEventForDate,
  getDevStudent,
  getNodeExercises,
  getNodeIdsByStatus,
  getOtherStudentUserId,
  getTodayStreak,
  hasDatabase,
  markNodeCompleted,
  restoreCompleteTestDbSnapshot,
  seedYesterdayStreak,
  setSessionStartedAt,
  SESSION_TTL_MS,
  type CompleteTestDbSnapshot,
} from "./helpers/db.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";

const integration = hasDatabase ? describe : describe.skip;

integration("restoreCompleteTestDbSnapshot", () => {
  let studentId = "";
  let activeNodeId = "";

  before(async () => {
    const student = await getDevStudent();
    studentId = student.id;
    const nodes = await getNodeIdsByStatus(studentId);
    activeNodeId = nodes.active ?? "";
    assert.ok(activeNodeId, "Se requiere un nodo active en el seed");
  });

  after(async () => {
    await prismaDisconnect();
  });

  it("restaura sesiones e intentos preexistentes con igualdad exacta", async () => {
    await deleteStudentSessionsForNode(studentId, activeNodeId);
    const baseline = await captureCompleteTestDbSnapshot(studentId, activeNodeId);

    const exercises = await getNodeExercises(activeNodeId);
    assert.ok(exercises[0], "Se requiere al menos un ejercicio en el nodo");

    const { prisma } = await import("../lib/prisma.js");
    const { SessionStatus } = await import("@prisma/client");

    const session = await prisma.lessonSession.create({
      data: {
        userId: studentId,
        nodeId: activeNodeId,
        status: SessionStatus.COMPLETED,
        accuracy: 0.5,
        xpEarned: 50,
        streakUpdated: false,
        startedAt: new Date("2026-06-01T10:00:00.000Z"),
        completedAt: new Date("2026-06-01T10:15:00.000Z"),
      },
    });

    await prisma.exerciseAttempt.create({
      data: {
        sessionId: session.id,
        microExerciseId: exercises[0].id,
        isCorrect: true,
        selectedAnswer: "a",
        responseTimeMs: 900,
        createdAt: new Date("2026-06-01T10:05:00.000Z"),
      },
    });

    const snapshot = await captureCompleteTestDbSnapshot(studentId, activeNodeId);

    await prisma.lessonSession.create({
      data: {
        userId: studentId,
        nodeId: activeNodeId,
        status: SessionStatus.STARTED,
      },
    });
    await markNodeCompleted(studentId, activeNodeId);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, snapshot);

    const restored = await captureCompleteTestDbSnapshot(studentId, activeNodeId);
    assertCompleteTestDbSnapshotsEqual(restored, snapshot);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, baseline);
  });
});

describe("parseCompleteSessionBody", () => {
  it("rechaza body inválido, campos prohibidos e intentos duplicados", () => {
    assert.throws(
      () => parseCompleteSessionBody({ attempts: [] }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );

    assert.throws(
      () =>
        parseCompleteSessionBody({
          accuracy: 1,
          attempts: [
            {
              microExerciseId: "550e8400-e29b-41d4-a716-446655440000",
              selectedAnswer: "a",
              responseTimeMs: 100,
            },
          ],
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );

    assert.throws(
      () =>
        parseCompleteSessionBody({
          attempts: [
            {
              microExerciseId: "550e8400-e29b-41d4-a716-446655440000",
              selectedAnswer: "a",
              responseTimeMs: 100,
              isCorrect: true,
            },
          ],
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );

    assert.throws(
      () =>
        parseCompleteSessionBody({
          attempts: [
            {
              microExerciseId: "550e8400-e29b-41d4-a716-446655440000",
              selectedAnswer: "a",
              responseTimeMs: 100,
            },
            {
              microExerciseId: "550e8400-e29b-41d4-a716-446655440000",
              selectedAnswer: "b",
              responseTimeMs: 200,
            },
          ],
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});

describe("parseSessionIdParam", () => {
  it("rechaza session id inválido", () => {
    assert.throws(
      () => parseSessionIdParam("not-a-uuid"),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});

integration("POST /api/v1/lesson-sessions/:id/complete", () => {
  const app = createApp();
  let studentId = "";
  let studentTimezone = "";
  let activeNodeId = "";
  let lockedNodeId = "";
  let originalDb: CompleteTestDbSnapshot | null = null;

  let studentCookie = "";

  before(async () => {
    const student = await getDevStudent();
    studentId = student.id;
    studentCookie = await buildSessionCookieHeader(studentId);
    studentTimezone = student.timezone;
    const nodes = await getNodeIdsByStatus(studentId);
    activeNodeId = nodes.active ?? "";
    lockedNodeId = nodes.locked ?? "";
    assert.ok(activeNodeId, "Se requiere un nodo active en el seed");
    assert.ok(lockedNodeId, "Se requiere un nodo locked en el seed");
    originalDb = await captureCompleteTestDbSnapshot(studentId, activeNodeId);
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb);
  });

  after(async () => {
    if (originalDb) {
      await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb);
      const finalDb = await captureCompleteTestDbSnapshot(studentId, activeNodeId);
      assertCompleteTestDbSnapshotsEqual(finalDb, originalDb);
    }
    await prismaDisconnect();
  });

  async function startSession(nodeId = activeNodeId): Promise<string> {
    await deleteStudentSessionsForNode(studentId, nodeId);
    const response = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", studentCookie)
      .send({ nodeId });
    assert.equal(response.status, 201);
    return response.body.sessionId as string;
  }

  function completePost(sessionId: string) {
    return request(app)
      .post(`/api/v1/lesson-sessions/${sessionId}/complete`)
      .set("Cookie", studentCookie);
  }

  it("rechaza sesión inexistente", async () => {
    const response = await completePost("550e8400-e29b-41d4-a716-446655440099")
      .send({
        attempts: [
          {
            microExerciseId: "550e8400-e29b-41d4-a716-446655440001",
            selectedAnswer: "a",
            responseTimeMs: 100,
          },
        ],
      });

    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "SESSION_NOT_FOUND");
  });

  it("rechaza sesión de otro alumno", async () => {
    const otherUserId = await getOtherStudentUserId(studentId);
    assert.ok(otherUserId, "Se requiere otro usuario para probar FORBIDDEN");

    const foreignSession = await createStartedSession(otherUserId, activeNodeId);
    const exercises = await getNodeExercises(activeNodeId);
    const attempts = buildAttemptsPayload(exercises, "all-correct");

    const response = await completePost(foreignSession.id)
      .send({ attempts });

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");

    const { prisma } = await import("../lib/prisma.js");
    await prisma.lessonSession.delete({ where: { id: foreignSession.id } });
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("rechaza sesión vencida con SESSION_EXPIRED", async () => {
    const sessionId = await startSession();
    await setSessionStartedAt(sessionId, new Date(Date.now() - SESSION_TTL_MS - 60_000));

    const exercises = await getNodeExercises(activeNodeId);
    const response = await completePost(sessionId)
      .send({ attempts: buildAttemptsPayload(exercises, "all-correct") });

    assert.equal(response.status, 410);
    assert.equal(response.body.error.code, "SESSION_EXPIRED");

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("rechaza intentos que no pertenecen al nodo", async () => {
    const sessionId = await startSession();
    const foreignExercises = await getNodeExercises(lockedNodeId);
    assert.ok(foreignExercises[0], "Se requiere ejercicio en nodo locked");

    const response = await completePost(sessionId)
      .send({
        attempts: [
          {
            microExerciseId: foreignExercises[0].id,
            selectedAnswer: "a",
            responseTimeMs: 500,
          },
        ],
      });

    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "INVALID_ATTEMPT");

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("calcula respuestas correctas e incorrectas en servidor", async () => {
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
    const sessionId = await startSession();
    const exercises = await getNodeExercises(activeNodeId);

    const response = await completePost(sessionId)
      .send({ attempts: buildAttemptsPayload(exercises, "partial-pass") });

    assert.equal(response.status, 200);
    assert.equal(response.body.alreadyProcessed, false);
    assert.equal(response.body.attemptsSummary.length, exercises.length);
    assert.equal(response.body.attemptsSummary.filter((item: { isCorrect: boolean }) => item.isCorrect).length, 1);
    assert.equal(response.body.accuracy, 0.5);
    assert.doesNotThrow(() => assertResponseHasNoSecrets(response.body));

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("aprobación >= 70% completa progreso", async () => {
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
    const sessionId = await startSession();
    const exercises = await getNodeExercises(activeNodeId);

    const response = await completePost(sessionId)
      .send({ attempts: buildAttemptsPayload(exercises, "all-correct") });

    assert.equal(response.status, 200);
    assert.equal(response.body.nodeCompleted, true);
    assert.equal(response.body.accuracy, 1);
    assert.equal(response.body.xpEarned, 100);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("fallo < 70% no completa progreso ni actualiza racha", async () => {
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
    const today = await getTodayStreak(studentId, studentTimezone);
    assert.equal(today, null);

    const sessionId = await startSession();
    const exercises = await getNodeExercises(activeNodeId);

    const response = await completePost(sessionId)
      .send({ attempts: buildAttemptsPayload(exercises, "all-wrong") });

    assert.equal(response.status, 200);
    assert.equal(response.body.nodeCompleted, false);
    assert.equal(response.body.streakUpdated, false);
    assert.ok(response.body.accuracy < 0.7);

    const streakAfter = await getTodayStreak(studentId, studentTimezone);
    assert.equal(streakAfter, null);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("continúa racha usando timezone del alumno (hoy/ayer)", async () => {
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
    const todayDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: studentTimezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    await deleteStreakEventForDate(studentId, todayDate);
    await seedYesterdayStreak(studentId, studentTimezone, 3);

    const sessionId = await startSession();
    const exercises = await getNodeExercises(activeNodeId);

    const response = await completePost(sessionId)
      .send({ attempts: buildAttemptsPayload(exercises, "all-correct") });

    assert.equal(response.status, 200);
    assert.equal(response.body.streakUpdated, true);
    assert.equal(response.body.currentStreak, 4);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("es idempotente en solicitudes secuenciales", async () => {
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
    const sessionId = await startSession();
    const exercises = await getNodeExercises(activeNodeId);
    const payload = { attempts: buildAttemptsPayload(exercises, "all-correct") };

    const first = await completePost(sessionId)
      .send(payload);

    const second = await completePost(sessionId)
      .send(payload);

    assert.equal(first.status, 200);
    assert.equal(first.body.alreadyProcessed, false);
    assert.ok(first.body.attemptsSummary);

    assert.equal(second.status, 200);
    assert.equal(second.body.alreadyProcessed, true);
    assert.equal(second.body.attemptsSummary, undefined);

    assert.equal(await countXpEventsForSession(sessionId), 1);
    assert.equal(await countAttemptsForSession(sessionId), exercises.length);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });

  it("es idempotente bajo concurrencia", async () => {
    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
    const sessionId = await startSession();
    const exercises = await getNodeExercises(activeNodeId);
    const payload = { attempts: buildAttemptsPayload(exercises, "all-correct") };

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        completePost(sessionId).send(payload)
      )
    );

    assert.equal(responses.filter((response) => response.body.alreadyProcessed === false).length, 1);
    assert.equal(responses.filter((response) => response.body.alreadyProcessed === true).length, 9);
    assert.equal(new Set(responses.map((response) => response.body.sessionId)).size, 1);
    assert.equal(await countXpEventsForSession(sessionId), 1);
    assert.equal(await countAttemptsForSession(sessionId), exercises.length);

    await restoreCompleteTestDbSnapshot(studentId, activeNodeId, originalDb!);
  });
});

describe("devStudentAuth in production (complete session)", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  before(() => {
    process.env.NODE_ENV = "production";
  });

  after(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("rechaza POST complete con 401 UNAUTHORIZED", async () => {
    const response = await request(createApp())
      .post("/api/v1/lesson-sessions/550e8400-e29b-41d4-a716-446655440000/complete")
      .send({
        attempts: [
          {
            microExerciseId: "550e8400-e29b-41d4-a716-446655440001",
            selectedAnswer: "a",
            responseTimeMs: 100,
          },
        ],
      });

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });
});

async function prismaDisconnect() {
  const { prisma } = await import("../lib/prisma.js");
  await prisma.$disconnect();
}
