import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { ApiError } from "../lib/errors.js";
import { parseLinkOnboardingLeadBody } from "../lib/parseLinkOnboardingLeadBody.js";
import { prisma } from "../lib/prisma.js";
import { hasDatabase } from "./helpers/db.js";

const SESSION_ID = "test-session-link-lead-001";
const QUIZ_BODY = {
  session_id: SESSION_ID,
  calculated_temperament: "melancholic",
  scores: { sanguine: 1, choleric: 1, melancholic: 3, phlegmatic: 1 },
  is_tie: false,
  total_duration_ms: 8000,
  total_answer_changes: 1,
  questions_answered: 6,
  question_events: [
    { question_id: 1, selected_option: "c", temperament_tag: "melancholic", time_ms: 1000, answer_changes: 0 },
    { question_id: 2, selected_option: "c", temperament_tag: "melancholic", time_ms: 1200, answer_changes: 0 },
    { question_id: 3, selected_option: "a", temperament_tag: "sanguine", time_ms: 900, answer_changes: 0 },
    { question_id: 4, selected_option: "d", temperament_tag: "phlegmatic", time_ms: 1500, answer_changes: 0 },
    { question_id: 5, selected_option: "c", temperament_tag: "melancholic", time_ms: 1800, answer_changes: 0 },
    { question_id: 6, selected_option: "b", temperament_tag: "choleric", time_ms: 1100, answer_changes: 1 },
  ],
  instrument_slug: "guitarra",
  referrer_path: "/",
  completed_at: "2026-06-23T12:00:00.000Z",
};

describe("parseLinkOnboardingLeadBody", () => {
  it("acepta session_id y email válidos", () => {
    const parsed = parseLinkOnboardingLeadBody({
      session_id: SESSION_ID,
      email: "Lead@Example.com",
      plan_id: "plus-semester",
    });
    assert.equal(parsed.sessionId, SESSION_ID);
    assert.equal(parsed.email, "lead@example.com");
    assert.equal(parsed.selectedPlanId, "plus-semester");
  });

  it("rechaza email inválido", () => {
    assert.throws(
      () =>
        parseLinkOnboardingLeadBody({
          session_id: SESSION_ID,
          email: "no-es-email",
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});

describe("POST /api/v1/onboarding/link-lead", () => {
  const app = createApp();

  before(async () => {
    if (!hasDatabase) return;
    await prisma.onboardingAnalytics.deleteMany({
      where: { sessionId: SESSION_ID },
    });
    await request(app).post("/api/v1/onboarding/temperament-quiz").send(QUIZ_BODY).expect(201);
  });

  after(async () => {
    if (!hasDatabase) return;
    await prisma.onboardingAnalytics.deleteMany({
      where: { sessionId: SESSION_ID },
    });
  });

  it("vincula email al session_id del quiz", async (t) => {
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const response = await request(app)
      .post("/api/v1/onboarding/link-lead")
      .send({
        session_id: SESSION_ID,
        email: "juan.lead@gmusic.academy",
        plan_id: "plus-semester",
      })
      .expect(200);

    assert.equal(response.body.email, "juan.lead@gmusic.academy");
    assert.equal(response.body.calculated_temperament, "melancholic");

    const stored = await prisma.onboardingAnalytics.findUnique({
      where: { sessionId: SESSION_ID },
    });

    assert.equal(stored?.email, "juan.lead@gmusic.academy");
    assert.equal(stored?.selectedPlanId, "plus-semester");
    assert.ok(stored?.leadCapturedAt);
  });

  it("devuelve 404 si no existe el quiz para el session_id", async (t) => {
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    await request(app)
      .post("/api/v1/onboarding/link-lead")
      .send({
        session_id: "session-inexistente-xyz",
        email: "test@gmusic.academy",
      })
      .expect(404);
  });
});
