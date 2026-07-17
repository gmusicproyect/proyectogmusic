import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { getDevStudentSessionCookie } from "./helpers/authSession.js";
import { getDevStudent, hasDatabase } from "./helpers/db.js";
import { clearProfileProjectionH1 } from "../lib/profileProjectionH1Store.js";
import { prisma } from "../lib/prisma.js";

const integration = hasDatabase ? describe : describe.skip;

const beginnerBody = {
  instrument: "guitarra",
  learningGoal: "play_songs",
  experienceLevel: "beginner",
  weeklyGoalMinutes: 90,
};

integration("P0-02 H1 /api/v1/me/onboarding", () => {
  afterEach(async () => {
    const student = await getDevStudent();
    clearProfileProjectionH1(student.id);
  });

  it("T-OB-01/06: complete beginner → month=1 + onboardingCompleted", async () => {
    const student = await getDevStudent();
    const cookie = await getDevStudentSessionCookie();
    const app = createApp();

    const complete = await request(app)
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send(beginnerBody);

    assert.equal(complete.status, 200);
    assert.equal(complete.body.result.currentMonth, 1);
    assert.equal(
      complete.body.result.firstUnitId,
      "ruta:guitarra-fundamentos:v1/m01/u01"
    );
    assert.equal(complete.body.context.onboardingCompleted, true);
    assert.equal(complete.body.context.instrument, "guitarra");
    assert.equal(complete.body.context.profileId, student.id);

    const me = await request(app).get("/api/v1/me").set("Cookie", cookie);
    assert.equal(me.status, 200);
    assert.equal(me.body.context.onboardingCompleted, true);
    assert.equal(me.body.context.currentMonth, 1);
  });

  it("T-OB-02: some + confirma M2 → month=2; sin confirmar → 1", async () => {
    const cookie = await getDevStudentSessionCookie();
    const app = createApp();
    const student = await getDevStudent();

    const without = await request(app)
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send({
        instrument: "guitarra",
        learningGoal: "solid_basics",
        experienceLevel: "some",
        weeklyGoalMinutes: 60,
        confirmedMonth: 2,
        confirmPlacement: false,
      });
    assert.equal(without.status, 200);
    assert.equal(without.body.result.currentMonth, 1);
    clearProfileProjectionH1(student.id);

    const withConfirm = await request(app)
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send({
        instrument: "guitarra",
        learningGoal: "solid_basics",
        experienceLevel: "some",
        weeklyGoalMinutes: 60,
        confirmedMonth: 2,
        confirmPlacement: true,
      });
    assert.equal(withConfirm.status, 200);
    assert.equal(withConfirm.body.result.currentMonth, 2);
    assert.equal(
      withConfirm.body.result.firstUnitId,
      "ruta:guitarra-fundamentos:v1/m02/u01"
    );
  });

  it("T-OB-03: confirmedMonth>3 → 400", async () => {
    const cookie = await getDevStudentSessionCookie();
    const response = await request(createApp())
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send({
        instrument: "guitarra",
        learningGoal: "technique",
        experienceLevel: "comfortable",
        weeklyGoalMinutes: 120,
        confirmedMonth: 4,
        confirmPlacement: true,
      });
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("T-OB-04: teclado → 400 needs_review path", async () => {
    const cookie = await getDevStudentSessionCookie();
    const student = await getDevStudent();
    const response = await request(createApp())
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send({
        instrument: "teclado",
        learningGoal: "play_songs",
        experienceLevel: "beginner",
        weeklyGoalMinutes: 30,
      });
    assert.equal(response.status, 400);
    const state = await request(createApp())
      .get("/api/v1/me/onboarding")
      .set("Cookie", cookie);
    assert.equal(state.body.status, "needs_review");
    assert.equal(state.body.context.profileId, student.id);
  });

  it("T-OB-05: profileId ≠ userId → 403", async () => {
    const cookie = await getDevStudentSessionCookie();
    const response = await request(createApp())
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send({ ...beginnerBody, profileId: "otro-perfil" });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("T-OB-07: GET /me/path recibe month + unit del resultado", async () => {
    const cookie = await getDevStudentSessionCookie();
    const app = createApp();
    await request(app)
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send(beginnerBody)
      .expect(200);

    const path = await request(app).get("/api/v1/me/path").set("Cookie", cookie);
    assert.equal(path.status, 200);
    assert.equal(path.body.onboarding.completed, true);
    assert.equal(path.body.onboarding.currentMonth, 1);
    assert.equal(
      path.body.onboarding.firstUnitId,
      "ruta:guitarra-fundamentos:v1/m01/u01"
    );
    assert.equal(path.body.learnerContext.onboardingCompleted, true);
  });

  it("T-OB-08: complete no crea filas de progreso", async () => {
    const student = await getDevStudent();
    const cookie = await getDevStudentSessionCookie();
    const before = await prisma.userProgress.count({ where: { userId: student.id } });

    await request(createApp())
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send(beginnerBody)
      .expect(200);

    const after = await prisma.userProgress.count({ where: { userId: student.id } });
    assert.equal(after, before);
  });

  it("T-OB-09: PUT parcial in_progress no duplica; resume OK", async () => {
    const cookie = await getDevStudentSessionCookie();
    const app = createApp();

    const put1 = await request(app)
      .put("/api/v1/me/onboarding")
      .set("Cookie", cookie)
      .send({ instrument: "guitarra", step: 1 });
    assert.equal(put1.status, 200);
    assert.equal(put1.body.status, "in_progress");

    const put2 = await request(app)
      .put("/api/v1/me/onboarding")
      .set("Cookie", cookie)
      .send({ learningGoal: "technique", step: 2 });
    assert.equal(put2.status, 200);
    assert.equal(put2.body.status, "in_progress");
    assert.equal(put2.body.partialAnswers.instrument, "guitarra");
    assert.equal(put2.body.partialAnswers.learningGoal, "technique");

    const get = await request(app).get("/api/v1/me/onboarding").set("Cookie", cookie);
    assert.equal(get.body.status, "in_progress");
    assert.equal(get.body.context.onboardingCompleted, false);
  });

  it("T-OB-10: schema sin Profile (smoke contrato)", async () => {
    // Regresión documental: complete no exige modelo Profile.
    const cookie = await getDevStudentSessionCookie();
    const response = await request(createApp())
      .post("/api/v1/me/onboarding/complete")
      .set("Cookie", cookie)
      .send(beginnerBody);
    assert.equal(response.status, 200);
    assert.ok(response.body.context.profileId);
    assert.equal(response.body.context.profileId, response.body.context.accountId);
  });
});
