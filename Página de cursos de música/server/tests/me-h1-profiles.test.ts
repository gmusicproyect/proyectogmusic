import assert from "node:assert/strict";
import { describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { hasDatabase } from "./helpers/db.js";
import { authedGet, getDevStudentSessionCookie } from "./helpers/authSession.js";
import { getDevStudent } from "./helpers/db.js";

const integration = hasDatabase ? describe : describe.skip;

integration("P0-01 H1 /api/v1/me context + profiles", () => {
  it("T-H1-06: sin auth → 401 en GET /me", async () => {
    const response = await request(createApp()).get("/api/v1/me");
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("T-H1-02/runtime: GET /me expone context con profileId = userId", async () => {
    const student = await getDevStudent();
    const response = await authedGet("/api/v1/me");
    assert.equal(response.status, 200);
    assert.equal(response.body.context.profileId, student.id);
    assert.equal(response.body.context.accountId, student.id);
    assert.equal(response.body.context.email, student.email);
    assert.equal(response.body.context.displayName, student.name);
    assert.equal(response.body.context.onboardingCompleted, false);
  });

  it("T-H1-03: GET /me/profiles → length 1 e id === userId", async () => {
    const student = await getDevStudent();
    const response = await authedGet("/api/v1/me/profiles");
    assert.equal(response.status, 200);
    assert.equal(response.body.profiles.length, 1);
    assert.equal(response.body.profiles[0].id, student.id);
    assert.equal(response.body.profiles[0].accountId, student.id);
  });

  it("T-H1-04: GET /me/profiles/:otherId → 403", async () => {
    const response = await authedGet("/api/v1/me/profiles/not-the-session-user");
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("GET /me/profiles/:self → 200", async () => {
    const student = await getDevStudent();
    const response = await authedGet(`/api/v1/me/profiles/${student.id}`);
    assert.equal(response.status, 200);
    assert.equal(response.body.profile.id, student.id);
  });

  it("T-H1-05: POST /me/profiles → 405 METHOD_NOT_ALLOWED", async () => {
    const cookie = await getDevStudentSessionCookie();
    const response = await request(createApp())
      .post("/api/v1/me/profiles")
      .set("Cookie", cookie)
      .send({ displayName: "Segundo perfil" });
    assert.equal(response.status, 405);
    assert.equal(response.body.error.code, "METHOD_NOT_ALLOWED");
  });

  it("POST activate self → 200 no-op; other → 403", async () => {
    const student = await getDevStudent();
    const cookie = await getDevStudentSessionCookie();
    const app = createApp();

    const ok = await request(app)
      .post(`/api/v1/me/profiles/${student.id}/activate`)
      .set("Cookie", cookie)
      .send({});
    assert.equal(ok.status, 200);
    assert.equal(ok.body.activated, true);
    assert.equal(ok.body.profile.id, student.id);

    const denied = await request(app)
      .post("/api/v1/me/profiles/other/activate")
      .set("Cookie", cookie)
      .send({});
    assert.equal(denied.status, 403);
  });

  it("T-H1-07: Camino/access stubs reciben mismo sujeto (access 200)", async () => {
    const cookie = await getDevStudentSessionCookie();
    const app = createApp();
    const [me, access] = await Promise.all([
      request(app).get("/api/v1/me").set("Cookie", cookie),
      request(app).get("/api/v1/me/access").set("Cookie", cookie),
    ]);
    assert.equal(me.status, 200);
    assert.equal(access.status, 200);
    assert.equal(me.body.context.profileId, (await getDevStudent()).id);
  });
});
