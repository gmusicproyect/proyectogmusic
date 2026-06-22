import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import type { TemperamentQuizResult } from "../data/temperament-quiz";
import { mapTemperamentQuizResultToApiBody } from "../services/gmusic-api/submit-temperament-quiz";

const storageSource = readFileSync(
  join(import.meta.dirname, "temperament-quiz-storage.ts"),
  "utf8"
);

const sampleResult: TemperamentQuizResult = {
  session_id: "session-12345678",
  calculated_temperament: "sanguine",
  scores: { sanguine: 2, choleric: 1, melancholic: 2, phlegmatic: 1 },
  is_tie: true,
  total_duration_ms: 5000,
  total_answer_changes: 1,
  question_events: [
    {
      question_id: 1,
      selected_option: "a",
      temperament_tag: "sanguine",
      time_ms: 800,
      answer_changes: 0,
    },
  ],
  completed_at: "2026-06-22T12:00:00.000Z",
  instrument_slug: "guitarra",
};

describe("mapTemperamentQuizResultToApiBody", () => {
  it("mapea snake_case para onboarding_analytics", () => {
    const body = mapTemperamentQuizResultToApiBody(sampleResult, {
      referrerPath: "/onboarding-quiz",
    });

    assert.equal(body.session_id, sampleResult.session_id);
    assert.equal(body.calculated_temperament, "sanguine");
    assert.equal(body.referrer_path, "/onboarding-quiz");
    assert.equal(body.questions_answered, 1);
  });
});

describe("temperament-quiz-storage — contrato de persistencia", () => {
  it("persiste vía API PostgreSQL con cola pending y flush", () => {
    assert.match(storageSource, /submitTemperamentQuiz/);
    assert.match(storageSource, /PENDING_SYNC_KEY/);
    assert.match(storageSource, /flushPendingTemperamentQuizSync/);
    assert.match(storageSource, /persistedToDatabase/);
    assert.match(storageSource, /onboarding\/temperament-quiz/);
  });
});
