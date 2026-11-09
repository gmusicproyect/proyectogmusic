import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { askTutor } from "../lib/tutorAsk.js";
import {
  clearTutorAuditForTests,
  readTutorAudit,
  recordTutorAsk,
  setTutorAuditPathForTests,
} from "../lib/tutorAudit.js";

describe("tutorAudit (Paso 9)", () => {
  const dir = mkdtempSync(join(tmpdir(), "tutor-audit-"));
  const auditFile = join(dir, "tutor-audit.jsonl");

  before(() => {
    setTutorAuditPathForTests(auditFile);
    clearTutorAuditForTests();
  });

  after(() => {
    setTutorAuditPathForTests(null);
    rmSync(dir, { recursive: true, force: true });
  });

  it("persiste answered y abstain y lee en orden reciente", () => {
    clearTutorAuditForTests();
    const answered = askTutor("¿Necesito suscripción activa para entrar a Mi Camino?");
    recordTutorAsk(answered);
    const abstain = askTutor("¿Cuál es el precio secreto del plan oculto en dólares?");
    recordTutorAsk(abstain);

    const events = readTutorAudit({ limit: 10 });
    assert.equal(events.length, 2);
    assert.equal(events[0]?.status, "abstain");
    assert.equal(events[1]?.status, "answered");
    assert.ok(events[1]?.citation_ids.includes("doc-access-subscription"));
  });

  it("POST /tutor/ask escribe audit y GET admin exige auth", async () => {
    clearTutorAuditForTests();
    const app = createApp();

    await request(app)
      .post("/api/v1/tutor/ask")
      .send({ question: "¿Cómo funciona la inscripción por WhatsApp?" })
      .expect(200);

    const events = readTutorAudit({ limit: 5 });
    assert.ok(events.some((e) => e.status === "answered"));

    const denied = await request(app).get("/api/v1/admin/tutor/evidence").expect(401);
    assert.equal(denied.body.error.code, "UNAUTHORIZED");
  });
});
