/**
 * PD-2 Persistencia Durable H1 — tests de lógica PURA (sin DB).
 *
 * Cubren helpers que no dependen de Prisma: naturalKey, rebuild de proyección
 * y policy de entitlements. Los tests de repos con DB llegan en PD-3 (integración
 * local/docker), fuera del alcance PD-2.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AccountTier } from "@prisma/client";
import {
  buildPracticeEventNaturalKeyH1,
  rebuildFtcProjectionFromEvents,
  type PracticeEventRowH1,
} from "../lib/practiceEventRepo.js";
import {
  assertStudentLearningAccess,
  evaluateStudentLearningAccess,
} from "../lib/entitlementsPolicyH1.js";
import { resolveEntitlementsH1, type AccessViewH1 } from "../lib/entitlementsH1.js";
import { ApiError } from "../lib/errors.js";

const USER = "user-pd2";
const UNIT = "ruta:guitarra-fundamentos:v1/m01/u01";
const CARD = (slot: 1 | 2 | 3 | 4 | 5) => `${UNIT}/c${slot}`;

function cardEvent(
  slot: 1 | 2 | 3 | 4 | 5,
  occurredAt: string
): PracticeEventRowH1 {
  return {
    id: `evt-card-${slot}`,
    userId: USER,
    eventType: "ftc_card_completed",
    occurredAt: new Date(occurredAt),
    sessionId: `sess-${slot}`,
    tarjetaId: CARD(slot),
    unidadId: UNIT,
    monthIndex: 1,
    slot,
    payload: { source: "practice_flow", binaryComplete: true },
    causationCommandId: null,
    naturalKey: `${USER}:card:${CARD(slot)}`,
  };
}

function unitEvent(occurredAt: string): PracticeEventRowH1 {
  return {
    id: "evt-unit",
    userId: USER,
    eventType: "unit_completed",
    occurredAt: new Date(occurredAt),
    sessionId: null,
    tarjetaId: null,
    unidadId: UNIT,
    monthIndex: 1,
    slot: null,
    payload: { source: "practice_flow" },
    causationCommandId: null,
    naturalKey: `${USER}:unit:${UNIT}`,
  };
}

function accessView(options: {
  planId?: string | null;
  tier?: AccountTier;
  status?: "ACTIVE" | "PAST_DUE" | "CANCELED";
  endsAt?: Date | null;
}): AccessViewH1 {
  const { planId = null, tier = AccountTier.DEMO, status, endsAt = null } = options;
  return resolveEntitlementsH1({
    user: { id: USER, accountTier: tier },
    subscriptions: status
      ? [{ id: "sub-1", status, planId: planId ?? "subscriber", endsAt }]
      : [],
  });
}

describe("PD-2 · buildPracticeEventNaturalKeyH1", () => {
  it("T-PD-NK-01 card → clave card determinista", () => {
    assert.equal(
      buildPracticeEventNaturalKeyH1({
        userId: USER,
        eventType: "ftc_card_completed",
        tarjetaId: CARD(1),
      }),
      `${USER}:card:${CARD(1)}`
    );
  });

  it("T-PD-NK-02 unit → clave unit determinista", () => {
    assert.equal(
      buildPracticeEventNaturalKeyH1({
        userId: USER,
        eventType: "unit_completed",
        unidadId: UNIT,
      }),
      `${USER}:unit:${UNIT}`
    );
  });

  it("T-PD-NK-03 sesión → clave session+type", () => {
    assert.equal(
      buildPracticeEventNaturalKeyH1({
        userId: USER,
        eventType: "practice_started",
        sessionId: "sess-9",
      }),
      `${USER}:session:sess-9:practice_started`
    );
  });

  it("T-PD-NK-04 sin datos suficientes → null", () => {
    assert.equal(
      buildPracticeEventNaturalKeyH1({
        userId: USER,
        eventType: "ftc_card_completed",
        tarjetaId: null,
      }),
      null
    );
    assert.equal(
      buildPracticeEventNaturalKeyH1({
        userId: USER,
        eventType: "practice_completed",
        sessionId: null,
      }),
      null
    );
  });
});

describe("PD-2 · rebuildFtcProjectionFromEvents", () => {
  it("T-PD-RB-01 deriva tarjetas, unidades y slots ordenados", () => {
    const snapshot = rebuildFtcProjectionFromEvents([
      cardEvent(2, "2026-07-10T10:00:00Z"),
      cardEvent(1, "2026-07-10T09:00:00Z"),
      unitEvent("2026-07-10T11:00:00Z"),
    ]);
    assert.deepEqual(snapshot.completedCardIds.sort(), [CARD(1), CARD(2)].sort());
    assert.deepEqual(snapshot.completedUnitIds, [UNIT]);
    assert.deepEqual(snapshot.slotsByUnit[UNIT], [1, 2]);
  });

  it("T-PD-RB-02 idempotente: replay del mismo evento no duplica", () => {
    const events = [
      cardEvent(1, "2026-07-10T09:00:00Z"),
      cardEvent(1, "2026-07-10T09:00:00Z"),
    ];
    const snapshot = rebuildFtcProjectionFromEvents(events);
    assert.deepEqual(snapshot.completedCardIds, [CARD(1)]);
    assert.deepEqual(snapshot.slotsByUnit[UNIT], [1]);
  });

  it("T-PD-RB-03 rebuild determinista: mismo input → mismo output", () => {
    const events = [
      cardEvent(3, "2026-07-10T12:00:00Z"),
      cardEvent(1, "2026-07-10T09:00:00Z"),
      cardEvent(2, "2026-07-10T10:00:00Z"),
    ];
    const a = rebuildFtcProjectionFromEvents(events);
    const b = rebuildFtcProjectionFromEvents([...events].reverse());
    assert.deepEqual(a.slotsByUnit[UNIT], b.slotsByUnit[UNIT]);
    assert.deepEqual(a.completedCardIds.sort(), b.completedCardIds.sort());
  });

  it("T-PD-RB-04 ignora eventos incompletos (sin slot/unidad)", () => {
    const broken: PracticeEventRowH1 = {
      ...cardEvent(1, "2026-07-10T09:00:00Z"),
      slot: null,
    };
    const snapshot = rebuildFtcProjectionFromEvents([broken]);
    assert.deepEqual(snapshot.completedCardIds, []);
    assert.deepEqual(snapshot.slotsByUnit, {});
  });
});

describe("PD-2 · entitlementsPolicyH1", () => {
  it("T-PD-POL-01 sin zona y requireZone → NO_ZONE", () => {
    const view = accessView({}); // demo, sin subscription ACTIVE
    const decision = evaluateStudentLearningAccess(view, { requireZone: true });
    assert.equal(decision.allowed, false);
    assert.equal(decision.allowed === false && decision.denial.reasonCode, "NO_ZONE");
  });

  it("T-PD-POL-02 demo grant satisface requireZone si allowDemoGrant", () => {
    const view = accessView({});
    const decision = evaluateStudentLearningAccess(view, {
      requireZone: true,
      allowDemoGrant: true,
    });
    assert.equal(decision.allowed, view.grants.canStartPractice);
  });

  it("T-PD-POL-03 mes fuera de monthsPlayable → MONTH_NOT_PLAYABLE", () => {
    const view = accessView({});
    const decision = evaluateStudentLearningAccess(view, { monthIndex: 12 });
    assert.equal(decision.allowed, false);
    assert.equal(
      decision.allowed === false && decision.denial.reasonCode,
      "MONTH_NOT_PLAYABLE"
    );
  });

  it("T-PD-POL-04 mes jugable → allowed", () => {
    const view = accessView({ status: "ACTIVE", planId: "subscriber" });
    const decision = evaluateStudentLearningAccess(view, {
      requireZone: true,
      monthIndex: 1,
    });
    assert.equal(decision.allowed, true);
  });

  it("T-PD-POL-05 assert lanza 403 ENTITLEMENT sin zona", () => {
    const view = accessView({});
    assert.throws(
      () => assertStudentLearningAccess(view, { requireZone: true }),
      (err: unknown) =>
        err instanceof ApiError && err.status === 403 && err.code === "ENTITLEMENT"
    );
  });

  it("T-PD-POL-06 monthIndex inválido → 400 VALIDATION_ERROR", () => {
    const view = accessView({ status: "ACTIVE", planId: "subscriber" });
    assert.throws(
      () => assertStudentLearningAccess(view, { monthIndex: 99 }),
      (err: unknown) =>
        err instanceof ApiError &&
        err.status === 400 &&
        err.code === "VALIDATION_ERROR"
    );
  });

  it("T-PD-POL-07 library read con tier basic → allowed", () => {
    const view = accessView({ status: "ACTIVE", planId: "subscriber" });
    const decision = evaluateStudentLearningAccess(view, { library: "read" });
    assert.equal(decision.allowed, true);
  });
});
