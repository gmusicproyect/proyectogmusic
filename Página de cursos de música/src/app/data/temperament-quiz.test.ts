import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildQuizResult,
  calculateTemperament,
  scoreFromEvents,
  type QuestionEvent,
} from "../data/temperament-quiz";

describe("calculateTemperament", () => {
  it("elige el temperamento con mayor conteo", () => {
    const result = calculateTemperament({
      sanguine: 1,
      choleric: 3,
      melancholic: 1,
      phlegmatic: 1,
    });
    assert.equal(result.calculated_temperament, "choleric");
    assert.equal(result.is_tie, false);
  });

  it("desempata con prioridad sanguine > choleric > melancholic > phlegmatic", () => {
    const result = calculateTemperament({
      sanguine: 2,
      choleric: 2,
      melancholic: 1,
      phlegmatic: 1,
    });
    assert.equal(result.calculated_temperament, "sanguine");
    assert.equal(result.is_tie, true);
  });
});

describe("buildQuizResult", () => {
  it("arma telemetría completa con 6 respuestas", () => {
    const events: QuestionEvent[] = [
      { question_id: 1, selected_option: "a", temperament_tag: "sanguine", time_ms: 1000, answer_changes: 0 },
      { question_id: 2, selected_option: "b", temperament_tag: "choleric", time_ms: 1200, answer_changes: 1 },
      { question_id: 3, selected_option: "a", temperament_tag: "sanguine", time_ms: 900, answer_changes: 0 },
      { question_id: 4, selected_option: "d", temperament_tag: "phlegmatic", time_ms: 1500, answer_changes: 0 },
      { question_id: 5, selected_option: "c", temperament_tag: "melancholic", time_ms: 1800, answer_changes: 2 },
      { question_id: 6, selected_option: "a", temperament_tag: "sanguine", time_ms: 1100, answer_changes: 0 },
    ];

    const scores = scoreFromEvents(events);
    assert.deepEqual(scores, {
      sanguine: 3,
      choleric: 1,
      melancholic: 1,
      phlegmatic: 1,
    });

    const result = buildQuizResult({
      sessionId: "test-session",
      events,
      totalDurationMs: 7500,
      instrumentSlug: "guitarra",
    });

    assert.equal(result.calculated_temperament, "sanguine");
    assert.equal(result.total_duration_ms, 7500);
    assert.equal(result.total_answer_changes, 3);
    assert.equal(result.question_events.length, 6);
    assert.equal(result.instrument_slug, "guitarra");
  });
});
