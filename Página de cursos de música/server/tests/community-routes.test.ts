import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { authedGet, authedPost } from "./helpers/authSession.js";
import { getDevStudent, hasDatabase } from "./helpers/db.js";

describe("community routes", () => {
  const app = createApp();
  let userId: string;
  let createdPostId: string | null = null;

  before(async () => {
    if (!hasDatabase) return;
    const student = await getDevStudent();
    userId = student.id;
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
  });

  after(async () => {
    if (!hasDatabase) return;
    if (createdPostId) {
      await prisma.communityPost.delete({ where: { id: createdPostId } }).catch(() => {});
    }
  });

  it("GET /community/posts requiere enrollment y devuelve lista", async (t) => {
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const response = await (await authedGet("/api/v1/community/posts", app)).expect(200);
    assert.ok(Array.isArray(response.body.posts));
  });

  it("POST /community/posts persiste publicación en sector del enrollment", async (t) => {
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const response = await (
      await authedPost("/api/v1/community/posts", app)
    )
      .send({
        post_type: "question",
        content: "¿Cómo mantener el pulso al cambiar de acorde?",
        topic_label: "Ritmo",
      })
      .expect(201);

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
    if (!hasDatabase) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    await (
      await authedPost("/api/v1/community/posts", app)
    )
      .send({
        post_type: "progress",
        content: "Práctica de rasgueo",
        level: "ADVANCED",
      })
      .expect(403);
  });

  it("POST /community/posts sin sesión responde 401", async () => {
    await request(app)
      .post("/api/v1/community/posts")
      .send({ post_type: "question", content: "Hola" })
      .expect(401);
  });
});
