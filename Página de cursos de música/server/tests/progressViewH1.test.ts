import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { AccountTier, Role, SubscriptionStatus } from "@prisma/client";
import {
  buildProgressViewH1,
  rebuildProgressViewH1,
  type ProgressViewH1,
} from "../lib/progressViewH1.js";
import { buildPathViewH1 } from "../lib/pathViewH1.js";
import type { LearnerContextH1 } from "../lib/learnerContextH1.js";
import {
  appendLearningEventH1,
  clearPracticeEventsH1,
} from "../lib/practiceEventsH1.js";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";

const PROFILE = "user-progreso";
const UNIT = "ruta:guitarra-fundamentos:v1/m01/u01";
const CARD = (slot: 1 | 2 | 3 | 4 | 5) =>
  `ruta:guitarra-fundamentos:v1/m01/u01/c${slot}`;

function context(overrides: Partial<LearnerContextH1> = {}): LearnerContextH1 {
  return {
    accountId: PROFILE,
    profileId: PROFILE,
    email: "progreso@gmusic.test",
    displayName: "Alumno Progreso",
    role: Role.STUDENT,
    accountTier: AccountTier.DEMO,
    instrument: "guitarra",
    currentMonth: 1,
    weeklyGoalMinutes: 90,
    activeRutaSlug: "guitarra-fundamentos",
    activeRutaVersion: 1,
    onboardingCompleted: true,
    firstUnitId: UNIT,
    nextCardId: CARD(1),
    learningGoal: "play_songs",
    ...overrides,
  };
}

function demoAccess() {
  return resolveEntitlementsH1({
    user: { id: PROFILE, accountTier: AccountTier.DEMO },
    subscriptions: [],
  });
}

function build(
  overrides: Partial<LearnerContextH1> = {},
  opts: { timezone?: string; now?: Date } = {}
): ProgressViewH1 {
  return buildProgressViewH1({
    context: context(overrides),
    access: demoAccess(),
    timezone: opts.timezone ?? "America/Santiago",
    now: opts.now,
  });
}

function completeCard(
  slot: 1 | 2 | 3 | 4 | 5,
  opts: { commandId?: string; occurredAt?: string } = {}
) {
  appendLearningEventH1({
    eventType: "ftc_card_completed",
    profileId: PROFILE,
    sessionId: `session-c${slot}`,
    tarjetaId: CARD(slot),
    unidadId: UNIT,
    monthIndex: 1,
    slot,
    payload: { source: "practice_flow", binaryComplete: true },
    causationCommandId: opts.commandId ?? `complete-c${slot}`,
    occurredAt: opts.occurredAt,
  });
}

function completeUnit(opts: { commandId?: string } = {}) {
  appendLearningEventH1({
    eventType: "unit_completed",
    profileId: PROFILE,
    sessionId: "session-unit",
    tarjetaId: CARD(5),
    unidadId: UNIT,
    monthIndex: 1,
    slot: 5,
    payload: { source: "practice_flow", binaryComplete: true },
    causationCommandId: opts.commandId ?? "complete-unit",
  });
}

function practiceCompleted(opts: {
  sessionId: string;
  minutes: number;
  occurredAt?: string;
  tarjetaId?: string;
  slot?: 1 | 2 | 3 | 4 | 5;
}) {
  appendLearningEventH1({
    eventType: "practice_completed",
    profileId: PROFILE,
    sessionId: opts.sessionId,
    tarjetaId: opts.tarjetaId ?? CARD(1),
    unidadId: UNIT,
    monthIndex: 1,
    slot: opts.slot ?? 1,
    payload: {
      source: "practice_flow",
      binaryComplete: true,
      effectiveMinutes: opts.minutes,
    },
    causationCommandId: `practice-complete-${opts.sessionId}`,
    occurredAt: opts.occurredAt,
  });
}

describe("P0-06 ProgressViewH1 / Mi Progreso backend", () => {
  beforeEach(() => clearPracticeEventsH1());

  it("T-PRG-01: profileId === userId", () => {
    const view = build();
    assert.equal(view.profileId, PROFILE);
    assert.equal(view.meta.eventSource, "memory_bridge_h1");
  });

  it("T-PRG-02: 0 eventos → métricas 0 + empty NO_PRACTICE", () => {
    const view = build();
    assert.equal(view.cardsCompleted, 0);
    assert.equal(view.unitsCompleted, 0);
    assert.equal(view.monthsCompleted, 0);
    assert.equal(view.minutesTotal, 0);
    assert.equal(view.minutesThisWeek, 0);
    assert.equal(view.streakDays, 0);
    assert.equal(view.lastCompletedCard, null);
    assert.equal(view.emptyState?.code, "NO_PRACTICE");
  });

  it("T-PRG-03: 1 ftc_card_completed → cardsCompleted=1", () => {
    completeCard(1);
    const view = build();
    assert.equal(view.cardsCompleted, 1);
    assert.equal(view.cardStatus[CARD(1)], "completed");
    assert.equal(view.lastCompletedCard?.tarjetaId, CARD(1));
    assert.equal(view.emptyState, null);
  });

  it("T-PRG-04: replay mismo evento → sigue 1", () => {
    completeCard(1, { commandId: "same-cmd" });
    completeCard(1, { commandId: "same-cmd" });
    const view = build();
    assert.equal(view.cardsCompleted, 1);
  });

  it("T-PRG-05: 5 cards + unit_completed → unitsCompleted=1 + month 100%", () => {
    for (const slot of [1, 2, 3, 4, 5] as const) completeCard(slot);
    completeUnit();
    const view = build();
    assert.equal(view.cardsCompleted, 5);
    assert.equal(view.unitsCompleted, 1);
    assert.equal(view.monthsCompleted, 1);
    assert.equal(view.monthProgressPct, 100);
    assert.equal(view.monthStatus[1], "completed");
  });

  it("T-PRG-06: practice_completed suma minutos; abandoned no", () => {
    practiceCompleted({ sessionId: "s-ok", minutes: 15 });
    appendLearningEventH1({
      eventType: "practice_abandoned",
      profileId: PROFILE,
      sessionId: "s-abandon",
      tarjetaId: CARD(1),
      unidadId: UNIT,
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow", effectiveMinutes: 40 },
      causationCommandId: "abandon-1",
    });
    const view = build();
    assert.equal(view.minutesTotal, 15);
  });

  it("T-PRG-07: weeklyGoal vs minutesThisWeek en TZ America/Santiago", () => {
    const now = new Date("2026-07-16T18:00:00.000Z"); // jueves Chile
    practiceCompleted({
      sessionId: "s-week",
      minutes: 30,
      occurredAt: "2026-07-15T15:00:00.000Z",
    });
    practiceCompleted({
      sessionId: "s-old",
      minutes: 50,
      occurredAt: "2026-07-06T15:00:00.000Z", // semana anterior
    });
    const view = build({}, { timezone: "America/Santiago", now });
    assert.equal(view.weeklyGoalMinutes, 90);
    assert.equal(view.minutesThisWeek, 30);
    assert.equal(view.minutesTotal, 80);
    assert.equal(view.meta.timezone, "America/Santiago");
  });

  it("T-PRG-08: nextPracticeHint === PathView.nextPractice", () => {
    completeCard(1);
    const progress = build();
    const path = buildPathViewH1({
      context: context(),
      access: demoAccess(),
    });
    assert.deepEqual(progress.nextPracticeHint, path.nextPractice);
    assert.equal(progress.nextPracticeHint?.tarjetaId, CARD(2));
  });

  it("T-PRG-09: rebuild desde eventos = mismo snapshot", () => {
    completeCard(1);
    practiceCompleted({ sessionId: "s1", minutes: 10 });
    const a = buildProgressViewH1({
      context: context(),
      access: demoAccess(),
      now: new Date("2026-07-16T20:00:00.000Z"),
    });
    const b = rebuildProgressViewH1({
      context: context(),
      access: demoAccess(),
      now: new Date("2026-07-16T20:00:00.000Z"),
    });
    assert.equal(a.cardsCompleted, b.cardsCompleted);
    assert.equal(a.minutesTotal, b.minutesTotal);
    assert.equal(a.monthProgressPct, b.monthProgressPct);
    assert.equal(a.routeProgressPct, b.routeProgressPct);
    assert.deepEqual(a.nextPracticeHint, b.nextPracticeHint);
    assert.deepEqual(a.cardStatus, b.cardStatus);
  });

  it("T-PRG-10: sin campos de score/audio en contrato MVP", () => {
    completeCard(1);
    const view = build();
    const json = JSON.stringify(view);
    assert.equal(json.includes("score"), false);
    assert.equal(json.includes("accuracy"), false);
    assert.equal(json.includes("pitch"), false);
    assert.equal(json.includes("audio"), false);
    assert.equal(json.includes("stars"), false);
    assert.equal(json.includes("community"), false);
    assert.equal(view.meta.eventSource, "memory_bridge_h1");
  });

  it("empty ONBOARDING cuando diagnóstico incompleto", () => {
    const view = build({
      onboardingCompleted: false,
      currentMonth: null,
      instrument: null,
    });
    assert.equal(view.emptyState?.code, "ONBOARDING");
    assert.equal(view.nextPracticeHint, null);
  });

  it("subscriber access no inventa progreso", () => {
    const access = resolveEntitlementsH1({
      user: { id: PROFILE, accountTier: AccountTier.DEMO },
      subscriptions: [
        {
          id: "sub-p",
          status: SubscriptionStatus.ACTIVE,
          planId: "gmusic-semester-6-months",
          endsAt: null,
        },
      ],
    });
    const view = buildProgressViewH1({
      context: context(),
      access,
    });
    assert.equal(view.cardsCompleted, 0);
    assert.equal(view.unitsCompleted, 0);
  });
});
