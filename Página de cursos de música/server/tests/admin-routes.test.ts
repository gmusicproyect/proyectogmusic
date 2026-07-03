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

  it("PUT slot acepta guidePdfUrl https", async (t) => {
    if (!hasDatabase || !dbReady || !createdModuleId) {
      t.skip("DATABASE_URL no disponible o bloque QA no creado");
      return;
    }

    const save = await request(app)
      .put(`/api/v1/admin/modules/${createdModuleId}/slots/1`)
      .set("Cookie", adminCookie)
      .send({
        title: "Etapa 1",
        guidePdfUrl: "https://cdn.example.com/am-diagram.pdf",
        completionCriteria: "Marcar como visto",
      });
    assert.equal(save.status, 200);
    assert.equal(save.body.node.guidePdfUrl, "https://cdn.example.com/am-diagram.pdf");
  });

  it("DELETE /admin/modules elimina borrador y rechaza publicados", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const createResponse = await request(app)
      .post("/api/v1/admin/modules")
      .set("Cookie", adminCookie)
      .send({ title: "Bloque QA Delete" });

    assert.equal(createResponse.status, 201);
    const draftModuleId = createResponse.body.module.id as string;

    const deleteDraft = await request(app)
      .delete(`/api/v1/admin/modules/${draftModuleId}`)
      .set("Cookie", adminCookie);
    assert.equal(deleteDraft.status, 200);
    assert.equal(deleteDraft.body.deleted, true);

    const missing = await request(app)
      .get(`/api/v1/admin/modules/${draftModuleId}`)
      .set("Cookie", adminCookie);
    assert.equal(missing.status, 404);

    const publishedModule = await prisma.module.findFirst({
      where: { title: "Fundamentos", status: PublishStatus.PUBLISHED },
      select: { id: true },
    });

    if (!publishedModule) {
      t.skip("Sin módulo publicado seed");
      return;
    }

    const deletePublished = await request(app)
      .delete(`/api/v1/admin/modules/${publishedModule.id}`)
      .set("Cookie", adminCookie);
    assert.equal(deletePublished.status, 409);
    assert.equal(deletePublished.body.error.code, "MODULE_NOT_DELETABLE");
  });

  it("GET /admin/nodes/:nodeId/attempts requiere ADMIN", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const firstNode = await prisma.pathNode.findFirst({
      where: { module: { title: "Fundamentos" } },
      select: { id: true },
    });

    if (!firstNode) {
      t.skip("Sin nodo seed para intentos");
      return;
    }

    const anon = await request(app).get(`/api/v1/admin/nodes/${firstNode.id}/attempts`);
    assert.equal(anon.status, 401);

    const student = await request(app)
      .get(`/api/v1/admin/nodes/${firstNode.id}/attempts`)
      .set("Cookie", studentCookie);
    assert.equal(student.status, 403);

    const admin = await request(app)
      .get(`/api/v1/admin/nodes/${firstNode.id}/attempts`)
      .set("Cookie", adminCookie);
    assert.equal(admin.status, 200);
    assert.ok(admin.body.summary);
    assert.ok(Array.isArray(admin.body.attempts));
  });
});
