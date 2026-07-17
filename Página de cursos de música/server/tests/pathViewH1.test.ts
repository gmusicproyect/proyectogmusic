import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { AccountTier, Role, SubscriptionStatus } from "@prisma/client";
import {
  buildPathViewH1,
  type PathViewH1,
} from "../lib/pathViewH1.js";
import type { LearnerContextH1 } from "../lib/learnerContextH1.js";
import {
  appendLearningEventH1,
  clearPracticeEventsH1,
} from "../lib/practiceEventsH1.js";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";

function context(overrides: Partial<LearnerContextH1> = {}): LearnerContextH1 {
  return {
    accountId: "user-camino",
    profileId: "user-camino",
    email: "camino@gmusic.test",
    displayName: "Alumno Camino",
    role: Role.STUDENT,
    accountTier: AccountTier.DEMO,
    instrument: "guitarra",
    currentMonth: 1,
    weeklyGoalMinutes: 90,
    activeRutaSlug: "guitarra-fundamentos",
    activeRutaVersion: 1,
    onboardingCompleted: true,
    firstUnitId: "ruta:guitarra-fundamentos:v1/m01/u01",
    nextCardId: "ruta:guitarra-fundamentos:v1/m01/u01/c1",
    learningGoal: "play_songs",
    ...overrides,
  };
}

function demoAccess() {
  return resolveEntitlementsH1({
    user: { id: "user-camino", accountTier: AccountTier.DEMO },
    subscriptions: [],
  });
}

function subscriberAccess() {
  return resolveEntitlementsH1({
    user: { id: "user-camino", accountTier: AccountTier.DEMO },
    subscriptions: [
      {
        id: "sub-camino",
        status: SubscriptionStatus.ACTIVE,
        planId: "gmusic-semester-6-months",
        endsAt: null,
      },
    ],
  });
}

function build(overrides: Partial<LearnerContextH1> = {}): PathViewH1 {
  return buildPathViewH1({
    context: context(overrides),
    access: demoAccess(),
  });
}

describe("P0-04 PathViewH1 / Mi Camino backend", () => {
  beforeEach(() => clearPracticeEventsH1());

  it("T-CAM-01: path.profileId === userId", () => {
    const view = build();
    assert.equal(view.profileId, "user-camino");
    assert.equal(view.months.length, 12);
  });

  it("T-CAM-02: sin onboarding → blocker ONBOARDING", () => {
    const view = buildPathViewH1({
      context: context({
        onboardingCompleted: false,
        currentMonth: null,
        instrument: null,
      }),
      access: demoAccess(),
    });
    assert.equal(view.nextPractice, null);
    assert.equal(view.blockers[0].code, "ONBOARDING");
  });

  it("T-CAM-03: fresh M1 → nextPractice = U1 c1 Fundamento", () => {
    const view = build();
    assert.equal(
      view.nextPractice?.tarjetaId,
      "ruta:guitarra-fundamentos:v1/m01/u01/c1"
    );
    assert.equal(view.nextPractice?.slot, 1);
    assert.equal(view.nextPractice?.typeName, "Fundamento");
    assert.equal(view.nextPractice?.ctaLabel, "Empezar");
    assert.equal(view.cards[0].status, "recommended");
  });

  it("T-CAM-04: c1 completed → next = c2 Forma", () => {
    appendLearningEventH1({
      eventType: "ftc_card_completed",
      profileId: "user-camino",
      sessionId: "session-c1",
      tarjetaId: "ruta:guitarra-fundamentos:v1/m01/u01/c1",
      unidadId: "ruta:guitarra-fundamentos:v1/m01/u01",
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: "complete-c1",
    });
    const view = build();
    assert.equal(view.cards[0].status, "completed");
    assert.equal(
      view.nextPractice?.tarjetaId,
      "ruta:guitarra-fundamentos:v1/m01/u01/c2"
    );
    assert.equal(view.nextPractice?.typeName, "Forma");
  });

  it("T-CAM-05: c2 locked si c1 incomplete (order)", () => {
    const view = build();
    const c2 = view.cards[1];
    assert.equal(c2.status, "locked");
    assert.equal(c2.blocker?.code, "CARD_ORDER");
  });

  it("T-CAM-06: mes sin grant → ENTITLEMENT blocker", () => {
    const view = buildPathViewH1({
      context: context({ currentMonth: 5 }),
      access: subscriberAccess(),
    });
    assert.equal(view.nextPractice, null);
    assert.equal(view.blockers.some((blocker) => blocker.code === "ENTITLEMENT"), true);
  });

  it("T-CAM-07: M3 summary con grant → DEPTH_SUMMARY", () => {
    const access = demoAccess();
    access.grants.monthsPlayable.push(3);
    const view = buildPathViewH1({
      context: context({ currentMonth: 3 }),
      access,
    });
    assert.equal(view.nextPractice, null);
    assert.equal(view.blockers.some((blocker) => blocker.code === "DEPTH_SUMMARY"), true);
  });

  it("T-CAM-08: session started → CTA Continuar", () => {
    appendLearningEventH1({
      eventType: "practice_started",
      profileId: "user-camino",
      sessionId: "session-open",
      tarjetaId: "ruta:guitarra-fundamentos:v1/m01/u01/c1",
      unidadId: "ruta:guitarra-fundamentos:v1/m01/u01",
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow" },
      causationCommandId: "start-c1",
    });
    const view = build();
    assert.equal(view.cards[0].status, "active");
    assert.equal(view.nextPractice?.ctaLabel, "Continuar");
  });

  it("T-CAM-09: sin evento backend, cliente no puede forjar completed", () => {
    const view = build();
    assert.equal(view.cards.some((card) => card.status === "completed"), false);
  });

  it("T-CAM-10: response sin community link", () => {
    const view = build();
    assert.deepEqual(Object.keys(view.links).sort(), ["library", "progress"]);
    assert.equal("community" in view.links, false);
  });
});
