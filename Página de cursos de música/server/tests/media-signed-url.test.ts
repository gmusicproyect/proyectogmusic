import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { SubscriptionStatus } from "@prisma/client";
import { createApp } from "../app.js";
import {
  assertUserSubscriptionsSnapshotsEqual,
  captureUserSubscriptionsSnapshot,
  getDevStudent,
  hasDatabase,
  restoreUserSubscriptionsSnapshot,
  type SubscriptionRowSnapshot,
} from "./helpers/db.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";

const PRIVATE_VIDEO_URL =
  "https://tosbwmqijmtxchvcgrkj.supabase.co/storage/v1/object/clases-video/pilot/foo.mp4";

const integration = hasDatabase ? describe : describe.skip;

integration("POST /api/v1/me/media/signed-url", () => {
  let studentId = "";
  let studentCookie = "";
  let subscriptionSnapshot: SubscriptionRowSnapshot[] = [];

  before(async () => {
    const student = await getDevStudent();
    studentId = student.id;
    studentCookie = await buildSessionCookieHeader(student.id);
    subscriptionSnapshot = await captureUserSubscriptionsSnapshot(studentId);
  });

  after(async () => {
    if (!studentId) return;
    await restoreUserSubscriptionsSnapshot(studentId, subscriptionSnapshot);
    const restored = await captureUserSubscriptionsSnapshot(studentId);
    assertUserSubscriptionsSnapshotsEqual(restored, subscriptionSnapshot);
  });

  it("rechaza sin sesión", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/v1/me/media/signed-url")
      .send({ materialUrl: PRIVATE_VIDEO_URL });
    assert.equal(res.status, 401);
  });

  it("rechaza material que no es bucket privado", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/v1/me/media/signed-url")
      .set("Cookie", studentCookie)
      .send({ materialUrl: "https://www.youtube.com/watch?v=abc12345678" });

    assert.equal(res.status, 400);
    assert.equal(res.body.error.code, "INVALID_STORAGE_URL");
  });

  it("rechaza sin suscripción activa", async () => {
    const { prisma } = await import("../lib/prisma.js");
    await prisma.subscription.deleteMany({ where: { userId: studentId } });

    const app = createApp();
    const res = await request(app)
      .post("/api/v1/me/media/signed-url")
      .set("Cookie", studentCookie)
      .send({ materialUrl: PRIVATE_VIDEO_URL });

    assert.equal(res.status, 403);
    assert.equal(res.body.error.code, "SUBSCRIPTION_REQUIRED");
  });

  it("firma material con suscripción activa cuando Storage está configurado", async (t) => {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      t.skip("Supabase no configurado en entorno de test");
      return;
    }

    const { prisma } = await import("../lib/prisma.js");
    await prisma.subscription.create({
      data: {
        userId: studentId,
        status: SubscriptionStatus.ACTIVE,
        planId: "plan-test-signed-url",
        endsAt: new Date("2027-01-01T00:00:00.000Z"),
      },
    });

    const app = createApp();
    const res = await request(app)
      .post("/api/v1/me/media/signed-url")
      .set("Cookie", studentCookie)
      .send({ materialUrl: PRIVATE_VIDEO_URL });

    assert.equal(res.status, 200);
    assert.match(res.body.signedUrl, /^https:\/\//);
    assert.equal(res.body.expiresIn, 3600);
  });
});

describe("POST /api/v1/me/media/signed-url (sin DB)", () => {
  it("rechaza sin sesión", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/api/v1/me/media/signed-url")
      .send({ materialUrl: PRIVATE_VIDEO_URL });
    assert.equal(res.status, 401);
  });
});
