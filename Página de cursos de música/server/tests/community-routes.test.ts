import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { getDevStudentSessionCookie } from "./helpers/authSession.js";
import { getDevStudent, hasDatabase } from "./helpers/db.js";

describe("community routes", () => {
  const app = createApp();
  let userId: string;
  let sessionCookie = "";
  let createdPostId: string | null = null;
  let dbReady = false;

  before(async () => {
    if (!hasDatabase) return;
    try {
      const student = await getDevStudent();
      userId = student.id;
      sessionCookie = await getDevStudentSessionCookie();
      await prisma.communityPost.deleteMany({ where: { userId } });
      await prisma.communityEnrollment.upsert({
        where: { userId },
        update: {
          instrument: "Guitarra",
          academicTierId: "basico",
          programLabel: "Guitarra Básico",
          currentLessonNumber: 3,
          currentLessonTitle: "Acordes abiertos",
        },
        create: {
          userId,
          instrument: "Guitarra",
          academicTierId: "basico",
          programLabel: "Guitarra Básico",
          currentLessonNumber: 3,
          currentLessonTitle: "Acordes abiertos",
        },
      });
      dbReady = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("community_posts") && !message.includes("community_enrollments")) {
        throw error;
      }
    }
  });

  after(async () => {
    if (!hasDatabase) return;
    if (createdPostId) {
      await prisma.communityPost.delete({ where: { id: createdPostId } }).catch(() => {});
    }
  });

  function authedGet(path: string) {
    return request(app).get(path).set("Cookie", sessionCookie);
  }

  function authedPost(path: string) {
    return request(app).post(path).set("Cookie", sessionCookie);
  }

  function authedPut(path: string) {
    return request(app).put(path).set("Cookie", sessionCookie);
  }

  it("GET /community/posts requiere enrollment y devuelve lista", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL o migraciones de comunidad no disponibles");
      return;
    }

    const response = await authedGet("/api/v1/community/posts");
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.posts));
  });

  it("POST /community/posts persiste publicación en sector del enrollment", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL o migraciones de comunidad no disponibles");
      return;
    }

    const response = await authedPost("/api/v1/community/posts").send({
      post_type: "question",
      content: "¿Cómo mantener el pulso al cambiar de acorde?",
      topic_label: "Ritmo",
    });

    assert.equal(response.status, 201);
    createdPostId = response.body.post.id;
    assert.equal(response.body.post.level, "BASIC");
    assert.equal(response.body.post.instrument, "Guitarra");
    assert.match(response.body.post.content, /pulso/);

    const stored = await prisma.communityPost.findUnique({
      where: { id: createdPostId! },
    });
    assert.ok(stored);
    assert.equal(stored.level, "BASIC");
  });

  it("POST /community/posts rechaza level del cliente distinto al enrollment", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL o migraciones de comunidad no disponibles");
      return;
    }

    const response = await authedPost("/api/v1/community/posts").send({
      post_type: "progress",
      content: "Práctica de rasgueo",
      level: "ADVANCED",
    });

    assert.equal(response.status, 403);
  });

  it("POST /community/posts sin sesión responde 401", async () => {
    const response = await request(app)
      .post("/api/v1/community/posts")
      .send({ post_type: "question", content: "Hola" });

    assert.equal(response.status, 401);
  });

  it("PUT /community/enrollment persiste sector académico", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL o migraciones de comunidad no disponibles");
      return;
    }

    const response = await authedPut("/api/v1/community/enrollment").send({
      instrument: "Guitarra",
      academic_tier_id: "intermedio",
      current_lesson_number: 7,
      current_lesson_title: "Barras",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.enrollment.community_level, "INTERMEDIATE");
    assert.equal(response.body.enrollment.program_label, "Guitarra Intermedio");
    assert.equal(response.body.enrollment.current_lesson_number, 7);

    const stored = await prisma.communityEnrollment.findUnique({ where: { userId } });
    assert.ok(stored);
    assert.equal(stored.academicTierId, "intermedio");
  });

  it("GET /community/enrollment devuelve inscripción activa", async (t) => {
    if (!hasDatabase || !dbReady) {
      t.skip("DATABASE_URL o migraciones de comunidad no disponibles");
      return;
    }

    const response = await authedGet("/api/v1/community/enrollment");
    assert.equal(response.status, 200);
    assert.equal(response.body.enrollment.instrument, "Guitarra");
    assert.ok(response.body.enrollment.program_label);
  });
});
