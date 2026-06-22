import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { ApiError } from "../lib/errors.js";
import { parseTemperamentQuizBody } from "../lib/parseTemperamentQuizBody.js";
import { prisma } from "../lib/prisma.js";
import { hasDatabase } from "./helpers/db.js";

const VALID_BODY = {
  session_id: "test-session-onboarding-001",
  calculated_temperament: "sanguine",
  scores: { sanguine: 3, choleric: 1, melancholic: 1, phlegmatic: 1 },
  is_tie: false,
  total_duration_ms: 7500,
  total_answer_changes: 2,
  questions_answered: 6,
  question_events: [
    { question_id: 1, selected_option: "a", temperament_tag: "sanguine", time_ms: 1000, answer_changes: 0 },
    { question_id: 2, selected_option: "b", temperament_tag: "choleric", time_ms: 1200, answer_changes: 1 },
    { question_id: 3, selected_option: "a", temperament_tag: "sanguine", time_ms: 900, answer_changes: 0 },
    { question_id: 4, selected_option: "d", temperament_tag: "phlegmatic", time_ms: 1500, answer_changes: 0 },
    { question_id: 5, selected_option: "c", temperament_tag: "melancholic", time_ms: 1800, answer_changes: 1 },
    { question_id: 6, selected_option: "a", temperament_tag: "sanguine", time_ms: 1100, answer_changes: 0 },
  ],
  instrument_slug: "guitarra",
  referrer_path: "/",
  completed_at: "2026-06-22T12:00:00.000Z",
};

describe("parseTemperamentQuizBody", () => {
  it("acepta payload válido del quiz", () => {
    const parsed = parseTemperamentQuizBody(VALID_BODY);
    assert.equal(parsed.sessionId, VALID_BODY.session_id);
    assert.equal(parsed.calculatedTemperament, "sanguine");
    assert.equal(parsed.questionEvents.length, 6);
  });

  it("rechaza session_id corto", () => {
    assert.throws(
      () => parseTemperamentQuizBody({ ...VALID_BODY, session_id: "abc" }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});

describe("POST /api/v1/onboarding/temperament-quiz", () => {
  const app = createApp();
  let createdId: string | null = null;

  before(async () => {
    if (!hasDatabase) return;
    await prisma.onboardingAnalytics.deleteMany({
      where: { sessionId: VALID_BODY.session_id },
    });
  });

  after(async () => {
    if (!hasDatabase) return;
    if (createdId) {
      await prisma.onboardingAnalytics.delete({ where: { id: createdId } });
    }
  });

  it("persiste onboarding_analytics en PostgreSQL", async (t) => {
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const response = await request(app)
      .post("/api/v1/onboarding/temperament-quiz")
      .send(VALID_BODY)
      .expect(201);

    createdId = response.body.id;
    assert.equal(response.body.session_id, VALID_BODY.session_id);
    assert.equal(response.body.calculated_temperament, "sanguine");

    const stored = await prisma.onboardingAnalytics.findUnique({
      where: { sessionId: VALID_BODY.session_id },
    });

    assert.ok(stored);
    assert.equal(stored?.totalDurationMs, 7500);
    assert.equal(stored?.instrumentSlug, "guitarra");
  });

  it("es idempotente por session_id", async (t) => {
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    await request(app)
      .post("/api/v1/onboarding/temperament-quiz")
      .send(VALID_BODY)
      .expect(201);

    const count = await prisma.onboardingAnalytics.count({
      where: { sessionId: VALID_BODY.session_id },
    });
    assert.equal(count, 1);
  });
});
