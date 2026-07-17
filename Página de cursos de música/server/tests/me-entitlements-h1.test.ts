import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { getDevStudentSessionCookie } from "./helpers/authSession.js";
import { getDevStudent, getNodeIdsByStatus, hasDatabase } from "./helpers/db.js";

const integration = hasDatabase ? describe : describe.skip;

integration("P0-07 StartPractice entitlement gate", () => {
  it("T-ENT-03 runtime: monthIndex=5 → 403 ENTITLEMENT", async () => {
    const student = await getDevStudent();
    const { active } = await getNodeIdsByStatus(student.id);
    assert.ok(active, "se requiere un nodo active en el path publicado");

    const cookie = await getDevStudentSessionCookie();
    const response = await request(createApp())
      .post("/api/v1/lesson-sessions")
      .set("Cookie", cookie)
      .send({ nodeId: active, monthIndex: 5 });

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "ENTITLEMENT");
  });

  it("GET /me/access expone entitlements H1 (community/premium OFF)", async () => {
    const student = await getDevStudent();
    const cookie = await getDevStudentSessionCookie();
    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", cookie);

    assert.equal(response.status, 200);
    assert.equal(response.body.entitlements.profileId, student.id);
    assert.equal(response.body.entitlements.accountId, student.id);
    assert.equal(response.body.entitlements.grants.communityAccess, false);
    assert.notEqual(response.body.entitlements.grants.libraryTier, "premium");
    assert.ok(Array.isArray(response.body.entitlements.grants.monthsPlayable));
  });
});
