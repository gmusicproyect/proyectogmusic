import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import request from "supertest";
import { createApp } from "../app.js";
import { ApiError } from "../lib/errors.js";
import {
  TUTOR_QUESTION_MAX_CHARS,
  parseTutorAskBody,
} from "../lib/parseTutorAskBody.js";
import { askTutor } from "../lib/tutorAsk.js";
import { createTutorRateLimit } from "../lib/tutorRateLimit.js";

describe("parseTutorAskBody", () => {
  it("acepta question string", () => {
    const parsed = parseTutorAskBody({ question: "¿Cómo funciona WhatsApp?" });
    assert.equal(parsed.question, "¿Cómo funciona WhatsApp?");
  });

  it("rechaza body sin question", () => {
    assert.throws(
      () => parseTutorAskBody({}),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });

  it("rechaza question no string", () => {
    assert.throws(
      () => parseTutorAskBody({ question: 42 }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });

  it("rechaza question demasiado larga", () => {
    assert.throws(
      () => parseTutorAskBody({ question: "x".repeat(TUTOR_QUESTION_MAX_CHARS + 1) }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});

describe("askTutor (unit)", () => {
  it("responde acceso Mi Camino con cita doc-access-subscription", () => {
    const out = askTutor("¿Necesito suscripción activa para entrar a Mi Camino?");
    assert.equal(out.status, "answered");
    assert.ok(out.citations.some((c) => c.id === "doc-access-subscription"));
    for (const c of out.citations) {
      assert.match(out.answer, new RegExp(`\\[${c.id}\\]`));
    }
    // Sin duplicar el excerpt del top en una viñeta aparte.
    assert.equal((out.answer.match(/Sin suscripc/g) ?? []).length, 1);
  });

  it("responde inscripción WhatsApp con cita", () => {
    const out = askTutor("¿Cómo funciona la inscripción por WhatsApp?");
    assert.equal(out.status, "answered");
    assert.ok(out.citations.some((c) => c.id === "doc-whatsapp-inscripcion"));
  });

  it("abstiene sin evidencia", () => {
    const out = askTutor("¿Cuál es el precio secreto del plan oculto en dólares?");
    assert.equal(out.status, "abstain");
    assert.equal(out.refusal_reason, "no_evidence");
    assert.equal(out.citations.length, 0);
  });

  it("abstiene pregunta vacía", () => {
    const out = askTutor("   ");
    assert.equal(out.status, "abstain");
    assert.equal(out.refusal_reason, "empty_question");
  });
});

describe("POST /api/v1/tutor/ask", () => {
  const app = createApp();

  it("200 answered con citas (contrato Paso 5)", async () => {
    const response = await request(app)
      .post("/api/v1/tutor/ask")
      .send({ question: "¿Necesito suscripción activa para entrar a Mi Camino?" })
      .expect(200);

    assert.equal(response.body.status, "answered");
    assert.equal(typeof response.body.answer, "string");
    assert.ok(Array.isArray(response.body.citations));
    assert.ok(response.body.citations.length >= 1);
    assert.equal(response.body.refusal_reason, null);
    assert.ok(
      response.body.citations.some(
        (c: { id: string }) => c.id === "doc-access-subscription"
      )
    );
  });

  it("200 abstain sin evidencia", async () => {
    const response = await request(app)
      .post("/api/v1/tutor/ask")
      .send({ question: "¿Cuál es el precio secreto del plan oculto en dólares?" })
      .expect(200);

    assert.equal(response.body.status, "abstain");
    assert.equal(response.body.refusal_reason, "no_evidence");
    assert.deepEqual(response.body.citations, []);
  });

  it("400 si falta question", async () => {
    const response = await request(app).post("/api/v1/tutor/ask").send({}).expect(400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });
});

describe("tutorRateLimit", () => {
  it("429 tras superar el máximo en la ventana", async () => {
    const limiter = createTutorRateLimit({
      windowMs: 60_000,
      max: 2,
      keyFromRequest: () => "test-client",
    });
    const app = express();
    app.use(express.json());
    app.post("/ask", limiter.middleware, (_req, res) => {
      res.status(200).json({ ok: true });
    });
    app.use(
      (
        err: unknown,
        _req: express.Request,
        res: express.Response,
        _next: express.NextFunction
      ) => {
        if (err instanceof ApiError) {
          return res.status(err.status).json({ error: { code: err.code, message: err.message } });
        }
        return res.status(500).json({ error: { code: "INTERNAL_ERROR" } });
      }
    );

    await request(app).post("/ask").send({}).expect(200);
    await request(app).post("/ask").send({}).expect(200);
    const blocked = await request(app).post("/ask").send({}).expect(429);
    assert.equal(blocked.body.error.code, "RATE_LIMITED");
  });
});
