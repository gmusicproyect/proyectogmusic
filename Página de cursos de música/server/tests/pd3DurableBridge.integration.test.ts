/**
 * PD-3 — integración durable (requiere Postgres local + GMUSIC_H1_DURABLE=1).
 * Sin flag / sin DB → suite skipped.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { AccountTier, Role } from "@prisma/client";
import { isH1DurableEnabled } from "../lib/h1DurableFlag.js";
import {
  appendLearningEvent,
  getPracticeProjection,
  listLearningEvents,
} from "../lib/practiceEventsBridge.js";
import {
  getProfileProjection,
  upsertProfileProjection,
  clearProfileProjection,
} from "../lib/learnerProjectionBridge.js";
import { resolveLearnerContext } from "../lib/learnerContextH1.js";
import { buildProgressViewH1Async } from "../lib/progressViewH1.js";
import { buildPathViewH1Async } from "../lib/pathViewH1.js";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";
import { prisma } from "../lib/prisma.js";
import { hasDatabase } from "./helpers/db.js";

const durableOn = isH1DurableEnabled();
const suite = hasDatabase && durableOn ? describe : describe.skip;

suite("PD-3 Persistencia Durable H1 (GMUSIC_H1_DURABLE=1)", () => {
  let userId = "";

  before(async () => {
    assert.equal(isH1DurableEnabled(), true, "flag debe estar ON");
    const user = await prisma.user.create({
      data: {
        email: `pd3-${randomUUID()}@gmusic.test`,
        name: "Alumno PD-3",
        role: Role.STUDENT,
        accountTier: AccountTier.DEMO,
      },
    });
    userId = user.id;
  });

  after(async () => {
    if (!userId) return;
    await prisma.practiceEvent.deleteMany({ where: { userId } });
    await prisma.ftcProgressProjection.deleteMany({ where: { userId } });
    await prisma.learnerProjectionH1.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  it("T-PD3-01: onboarding durable sobrevive a clear de memoria", async () => {
    await upsertProfileProjection(userId, {
      onboardingStatus: "completed",
      result: {
        profileId: userId,
        instrument: "guitarra",
        learningGoal: "play_songs",
        experienceLevel: "beginner",
        weeklyGoalMinutes: 90,
        activeRutaSlug: "guitarra-fundamentos",
        activeRutaVersion: 1,
        currentMonth: 1,
        firstUnitId: "ruta:guitarra-fundamentos:v1/m01/u01",
        nextCardId: "ruta:guitarra-fundamentos:v1/m01/u01/c1",
        onboardingStatus: "completed",
        onboardingCompletedAt: new Date().toISOString(),
        answersRaw: {
          instrument: "guitarra",
          learningGoal: "play_songs",
          experienceLevel: "beginner",
          weeklyGoalMinutes: 90,
        },
      },
      partialAnswers: null,
      learningGoalOverride: null,
      weeklyGoalMinutesOverride: null,
    });

    // Simula reinicio de proceso: limpia solo memoria, DB queda.
    const { clearAllProfileProjectionsH1 } = await import(
      "../lib/profileProjectionH1Store.js"
    );
    clearAllProfileProjectionsH1();

    const fromDb = await getProfileProjection(userId);
    assert.ok(fromDb);
    assert.equal(fromDb?.onboardingStatus, "completed");
    assert.equal(fromDb?.result?.currentMonth, 1);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const ctx = await resolveLearnerContext(user);
    assert.equal(ctx.onboardingCompleted, true);
    assert.equal(ctx.currentMonth, 1);
  });

  it("T-PD3-02: append evento + proyección durable + meta.eventSource=db", async () => {
    const unit = "ruta:guitarra-fundamentos:v1/m01/u01";
    const card = `${unit}/c1`;
    const first = await appendLearningEvent({
      eventId: `pd3-card-${randomUUID()}`,
      eventType: "ftc_card_completed",
      profileId: userId,
      sessionId: `sess-${randomUUID()}`,
      tarjetaId: card,
      unidadId: unit,
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: `cmd-${randomUUID()}`,
    });
    assert.equal(first.inserted, true);

    const retry = await appendLearningEvent({
      eventId: first.event.eventId,
      eventType: "ftc_card_completed",
      profileId: userId,
      sessionId: first.event.sessionId,
      tarjetaId: card,
      unidadId: unit,
      monthIndex: 1,
      slot: 1,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: first.event.causationCommandId,
    });
    assert.equal(retry.inserted, false);

    const projection = await getPracticeProjection(userId);
    assert.deepEqual(projection.completedCards, [card]);
    assert.deepEqual(projection.completedSlotsByUnit[unit], [1]);

    const dbCount = await prisma.practiceEvent.count({ where: { userId } });
    assert.ok(dbCount >= 1);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const context = await resolveLearnerContext(user);
    const access = resolveEntitlementsH1({
      user,
      subscriptions: [],
    });
    const progress = await buildProgressViewH1Async({ context, access });
    const path = await buildPathViewH1Async({ context, access });
    assert.equal(progress.meta.eventSource, "db");
    assert.equal(path.meta.eventSource, "db");
    assert.ok(progress.cardsCompleted >= 1);

    const events = await listLearningEvents(userId);
    assert.ok(events.some((e) => e.tarjetaId === card));
  });

  it("T-PD3-03: clearProfileProjection borra fila durable", async () => {
    await clearProfileProjection(userId);
    const gone = await getProfileProjection(userId);
    assert.equal(gone, null);
  });
});
