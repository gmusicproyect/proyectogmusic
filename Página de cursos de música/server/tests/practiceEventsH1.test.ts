import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { ApiError } from "../lib/errors.js";
import {
  appendLearningEventH1,
  assertFtcSequenceH1,
  clearPracticeEventsH1,
  getPracticeProjectionH1,
  listLearningEventsH1,
} from "../lib/practiceEventsH1.js";

describe("P0-05 EventoAprendizaje H1", () => {
  beforeEach(() => clearPracticeEventsH1());

  it("T-SES-04: mismo eventId/clientRequestId no duplica", () => {
    const base = {
      eventType: "ftc_card_completed" as const,
      profileId: "user-1",
      sessionId: "session-1",
      tarjetaId: "u1/c1",
      unidadId: "u1",
      monthIndex: 1,
      slot: 1 as const,
      payload: { source: "practice_flow" as const, binaryComplete: true },
      causationCommandId: "complete-1",
    };
    const first = appendLearningEventH1({ ...base, eventId: "event-1" });
    const byEventId = appendLearningEventH1({ ...base, eventId: "event-1" });
    const byCommand = appendLearningEventH1({ ...base, eventId: "event-2" });

    assert.equal(first.inserted, true);
    assert.equal(byEventId.inserted, false);
    assert.equal(byCommand.inserted, false);
    assert.equal(listLearningEventsH1("user-1").length, 1);
  });

  it("T-SES-05: otra sesión no emite segundo ftc_card_completed", () => {
    const first = appendLearningEventH1({
      eventType: "ftc_card_completed",
      profileId: "user-1",
      sessionId: "session-1",
      tarjetaId: "u1/c1",
      unidadId: "u1",
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: "complete-1",
    });
    const retry = appendLearningEventH1({
      eventType: "ftc_card_completed",
      profileId: "user-1",
      sessionId: "session-2",
      tarjetaId: "u1/c1",
      unidadId: "u1",
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: "complete-2",
    });

    assert.equal(first.inserted, true);
    assert.equal(retry.inserted, false);
    assert.deepEqual(getPracticeProjectionH1("user-1").completedCards, ["u1/c1"]);
  });

  it("T-SES-06: slot2 sin slot1 → 409", () => {
    assert.throws(
      () => assertFtcSequenceH1("user-1", "u1", 2),
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 409 &&
        error.code === "VALIDATION_ERROR"
    );
  });

  it("T-SES-07: 5 cards → unit_completed una vez", () => {
    for (const slot of [1, 2, 3, 4, 5] as const) {
      appendLearningEventH1({
        eventType: "ftc_card_completed",
        profileId: "user-1",
        sessionId: `session-${slot}`,
        tarjetaId: `u1/c${slot}`,
        unidadId: "u1",
        monthIndex: 1,
        slot,
        payload: { source: "practice_flow", binaryComplete: true },
        causationCommandId: `complete-${slot}`,
      });
    }
    const projection = getPracticeProjectionH1("user-1");
    assert.deepEqual(projection.completedSlotsByUnit.u1, [1, 2, 3, 4, 5]);

    const first = appendLearningEventH1({
      eventType: "unit_completed",
      profileId: "user-1",
      sessionId: "session-5",
      tarjetaId: "u1/c5",
      unidadId: "u1",
      monthIndex: 1,
      slot: 5,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: "unit-1",
    });
    const duplicate = appendLearningEventH1({
      eventType: "unit_completed",
      profileId: "user-1",
      sessionId: "session-6",
      tarjetaId: "u1/c5",
      unidadId: "u1",
      monthIndex: 1,
      slot: 5,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: "unit-2",
    });
    assert.equal(first.inserted, true);
    assert.equal(duplicate.inserted, false);
    assert.deepEqual(getPracticeProjectionH1("user-1").completedUnits, ["u1"]);
  });

  it("T-SES-11: eventos MVP no contienen score/audio", () => {
    appendLearningEventH1({
      eventType: "practice_completed",
      profileId: "user-1",
      sessionId: "session-1",
      tarjetaId: "u1/c1",
      unidadId: "u1",
      monthIndex: 1,
      slot: 1,
      payload: {
        source: "practice_flow",
        binaryComplete: true,
        effectiveMinutes: 8,
      },
      causationCommandId: "complete-1",
    });
    const serialized = JSON.stringify(listLearningEventsH1("user-1")).toLowerCase();
    for (const forbidden of ["score", "accuracy", "pitch", "audio", "stars"]) {
      assert.equal(serialized.includes(forbidden), false);
    }
  });
});
