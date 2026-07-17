import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, describe, it } from "node:test";
import { AccountTier, Role } from "@prisma/client";
import request from "supertest";
import { createApp } from "../app.js";
import {
  clearPracticeEventsH1,
  getPracticeProjectionH1,
  listLearningEventsH1,
} from "../lib/practiceEventsH1.js";
import { prisma } from "../lib/prisma.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";
import {
  getNodeIdsByStatus,
  hasDatabase,
} from "./helpers/db.js";

const integration = hasDatabase ? describe : describe.skip;

integration("P0-05 Sesión + Eventos H1 API", () => {
  let userId = "";
  let nodeId = "";
  let cookie = "";

  before(async () => {
    const student = await prisma.user.create({
      data: {
        email: `p005-${randomUUID()}@gmusic.test`,
        name: "Alumno temporal P0-05",
        role: Role.STUDENT,
        accountTier: AccountTier.DEMO,
      },
    });
    userId = student.id;
    const nodes = await getNodeIdsByStatus(student.id);
    assert.ok(nodes.active, "se requiere un nodo active");
    nodeId = nodes.active;
    cookie = await buildSessionCookieHeader(student.id);
    clearPracticeEventsH1();
  });

  after(async () => {
    clearPracticeEventsH1();
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
  });

  it("T-SES-01…05/08/10: lifecycle binario e idempotente", async () => {
    const app = createApp();
    const startBody = {
      nodeId,
      monthIndex: 1,
      profileId: userId,
      tarjetaId: "ruta:guitarra-fundamentos:v1/m01/u01/c1",
      unidadId: "ruta:guitarra-fundamentos:v1/m01/u01",
      slot: 1,
      clientRequestId: "start-p005-1",
      eventId: "event-start-p005-1",
    };

    // T-SES-08: otro profileId no inicia.
    const forbidden = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", cookie)
      .send({ ...startBody, profileId: "other-profile" });
    assert.equal(forbidden.status, 403);

    // T-SES-09: Entitlements aprobados siguen bloqueando M5.
    const denied = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", cookie)
      .send({ ...startBody, monthIndex: 5, clientRequestId: "start-denied" });
    assert.equal(denied.status, 403);
    assert.equal(denied.body.error.code, "ENTITLEMENT");

    // T-SES-01.
    const started = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", cookie)
      .send(startBody);
    assert.equal(started.status, 201);
    assert.equal(started.body.status, "STARTED");
    assert.equal(started.body.practiceEvent.eventType, "practice_started");
    const sessionId = started.body.sessionId as string;

    const progress = await request(app)
      .post(`/api/v1/lesson-sessions/${sessionId}/progress`)
      .set("Cookie", cookie)
      .send({
        profileId: userId,
        checklist: ["Leí el objetivo", "Practiqué el gesto"],
        selfDeclared: true,
      });
    assert.equal(progress.status, 200);
    assert.equal(progress.body.status, "STARTED");
    assert.equal(progress.body.checklist.length, 2);

    // T-SES-02.
    const completeBody = {
      profileId: userId,
      binaryComplete: true,
      effectiveMinutes: 8,
      clientRequestId: "complete-p005-1",
      eventId: "event-complete-p005-1",
    };
    const completed = await request(app)
      .post(`/api/v1/lesson-sessions/${sessionId}/complete`)
      .set("Cookie", cookie)
      .send(completeBody);
    assert.equal(completed.status, 200);
    assert.equal(completed.body.status, "COMPLETED");
    assert.equal(completed.body.binaryComplete, true);
    assert.equal(completed.body.cardCompleted, true);
    assert.equal(completed.body.alreadyProcessed, false);
    assert.equal(
      completed.body.events.some(
        (event: { eventType: string }) => event.eventType === "practice_completed"
      ),
      true
    );
    assert.equal(
      completed.body.events.some(
        (event: { eventType: string }) => event.eventType === "ftc_card_completed"
      ),
      true
    );

    // T-SES-04: reenvío no duplica eventos/progreso.
    const duplicate = await request(app)
      .post(`/api/v1/lesson-sessions/${sessionId}/complete`)
      .set("Cookie", cookie)
      .send(completeBody);
    assert.equal(duplicate.status, 200);
    assert.equal(duplicate.body.alreadyProcessed, true);
    assert.equal(duplicate.body.cardCompleted, false);

    const cardEvents = listLearningEventsH1(userId).filter(
      (event) => event.eventType === "ftc_card_completed"
    );
    assert.equal(cardEvents.length, 1);
    const progressRows = await prisma.userProgress.count({
      where: { userId, nodeId },
    });
    assert.equal(progressRows, 1);

    // T-SES-10: proyección compartida avanza la tarjeta.
    assert.deepEqual(getPracticeProjectionH1(userId).completedCards, [
      startBody.tarjetaId,
    ]);

    // T-SES-05: retry crea sesión nueva, sin segundo card completed.
    const retry = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", cookie)
      .send({
        ...startBody,
        retry: true,
        clientRequestId: "start-p005-retry",
        eventId: "event-start-p005-retry",
      });
    assert.equal(retry.status, 201);
    assert.notEqual(retry.body.sessionId, sessionId);

    const retryCompleted = await request(app)
      .post(`/api/v1/lesson-sessions/${retry.body.sessionId}/complete`)
      .set("Cookie", cookie)
      .send({
        profileId: userId,
        binaryComplete: true,
        clientRequestId: "complete-p005-retry",
        eventId: "event-complete-p005-retry",
      });
    assert.equal(retryCompleted.status, 200);
    assert.equal(retryCompleted.body.cardCompleted, false);
    assert.equal(
      listLearningEventsH1(userId).filter(
        (event) => event.eventType === "ftc_card_completed"
      ).length,
      1
    );

    // T-SES-03: otra retry puede abandonarse sin completar tarjeta.
    const abandonStart = await request(app)
      .post("/api/v1/lesson-sessions")
      .set("Cookie", cookie)
      .send({
        ...startBody,
        retry: true,
        clientRequestId: "start-p005-abandon",
        eventId: "event-start-p005-abandon",
      });
    assert.equal(abandonStart.status, 201);
    const abandoned = await request(app)
      .post(`/api/v1/lesson-sessions/${abandonStart.body.sessionId}/abandon`)
      .set("Cookie", cookie)
      .send({
        profileId: userId,
        clientRequestId: "abandon-p005-1",
        eventId: "event-abandon-p005-1",
      });
    assert.equal(abandoned.status, 200);
    assert.equal(abandoned.body.status, "ABANDONED");
    assert.equal(abandoned.body.event.eventType, "practice_abandoned");
    assert.equal(
      listLearningEventsH1(userId).filter(
        (event) => event.eventType === "ftc_card_completed"
      ).length,
      1
    );
  });
});
