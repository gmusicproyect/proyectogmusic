import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { PublishStatus } from "@prisma/client";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";
import { getDevStudentSessionCookie } from "./helpers/authSession.js";
import { hasDatabase } from "./helpers/db.js";

describe("admin routes", () => {
  const app = createApp();
  let adminCookie = "";
  let studentCookie = "";
  let createdModuleId: string | null = null;
  let dbReady = false;

  before(async () => {
    if (!hasDatabase) return;
    try {
      const admin = await prisma.user.findUniqueOrThrow({
        where: { email: "admin@gmusic.academy" },
      });
      adminCookie = await buildSessionCookieHeader(admin.id);
      studentCookie = await getDevStudentSessionCookie();
      dbReady = true;
    } catch {
      dbReady = false;
    }
  });

  after(async () => {
    if (!hasDatabase || !createdModuleId) return;
    await prisma.pathNode.deleteMany({ where: { moduleId: createdModuleId } }).catch(() => {});
    await prisma.module.delete({ where: { id: createdModuleId } }).catch(() => {});
  });

  it("GET /admin/modules requiere rol ADMIN", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const anon = await request(app).get("/api/v1/admin/modules");
    assert.equal(anon.status, 401);

    const student = await request(app)
      .get("/api/v1/admin/modules")
      .set("Cookie", studentCookie);
    assert.equal(student.status, 403);

    const admin = await request(app)
      .get("/api/v1/admin/modules")
      .set("Cookie", adminCookie);
    assert.equal(admin.status, 200);
    assert.ok(Array.isArray(admin.body.modules));
  });

  it("POST /admin/modules crea bloque con 5 slots y publicación validada", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const createResponse = await request(app)
      .post("/api/v1/admin/modules")
      .set("Cookie", adminCookie)
      .send({ title: "Bloque QA Admin" });

    assert.equal(createResponse.status, 201);
    createdModuleId = createResponse.body.module.id as string;
    assert.equal(createResponse.body.module.nodes.length, 5);

    const publishBlocked = await request(app)
      .post(`/api/v1/admin/modules/${createdModuleId}/publish`)
      .set("Cookie", adminCookie);
    assert.equal(publishBlocked.status, 400);

    for (let slot = 1; slot <= 5; slot += 1) {
      const save = await request(app)
        .put(`/api/v1/admin/modules/${createdModuleId}/slots/${slot}`)
        .set("Cookie", adminCookie)
        .send({
          title: `Etapa ${slot}`,
          guideText: "Guía de prueba",
          completionCriteria: "Marcar como visto",
          ctaLabel: "Continuar",
        });
      assert.equal(save.status, 200);
    }

    const publish = await request(app)
      .post(`/api/v1/admin/modules/${createdModuleId}/publish`)
      .set("Cookie", adminCookie);
    assert.equal(publish.status, 200);
    assert.equal(publish.body.module.status, PublishStatus.PUBLISHED);
    assert.equal(publish.body.canPublish, true);
  });
});
