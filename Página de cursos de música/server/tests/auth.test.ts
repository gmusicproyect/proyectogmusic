import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import { SESSION_COOKIE_NAME } from "../lib/jwtSession.js";
import {
  captureUserEmailTestSnapshot,
  hasDatabase,
  restoreUserEmailTestSnapshot,
  type UserEmailTestSnapshot,
} from "./helpers/db.js";

const integration = hasDatabase ? describe : describe.skip;
const TEST_EMAIL = `auth-pr1-${Date.now()}@gmusic.test`;

integration("POST /api/v1/auth/register + login", () => {
  const app = createApp();
  let snapshot: UserEmailTestSnapshot;

  before(async () => {
    snapshot = await captureUserEmailTestSnapshot(TEST_EMAIL);
  });

  after(async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, snapshot);
  });

  it("register → 201 + cookie gmusic_session", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Alumno Demo",
      email: TEST_EMAIL,
      phone: "56912345678",
      password: "demo-pass-123",
    });

    assert.equal(response.status, 201);
    assert.equal(response.body.user.email, TEST_EMAIL);
    const setCookie = response.headers["set-cookie"];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    assert.ok(cookies.some((value: string) => value.startsWith(`${SESSION_COOKIE_NAME}=`)));
  });

  it("register duplicado → 409 EMAIL_TAKEN", async () => {
    const response = await request(app).post("/api/v1/auth/register").send({
      name: "Otro",
      email: TEST_EMAIL,
      phone: "56987654321",
      password: "demo-pass-123",
    });

    assert.equal(response.status, 409);
    assert.equal(response.body.error.code, "EMAIL_TAKEN");
  });

  it("login válido → 200 + cookie", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: TEST_EMAIL,
      password: "demo-pass-123",
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, TEST_EMAIL);
  });

  it("login inválido → 401 INVALID_CREDENTIALS", async () => {
    const response = await request(app).post("/api/v1/auth/login").send({
      email: TEST_EMAIL,
      password: "wrong-password",
    });

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "INVALID_CREDENTIALS");
  });

  it("GET /me/access con cookie de register → registered_no_sub", async () => {
    const email = `access-${Date.now()}@gmusic.test`;
    const register = await request(app).post("/api/v1/auth/register").send({
      name: "Acceso Demo",
      email,
      phone: "56911112222",
      password: "demo-pass-123",
    });

    assert.equal(register.status, 201);
    const setCookie = register.headers["set-cookie"];
    const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
    const sessionCookie = cookies.find((value: string) => value.startsWith(`${SESSION_COOKIE_NAME}=`));
    assert.ok(sessionCookie);

    const access = await request(app)
      .get("/api/v1/me/access")
      .set("Cookie", sessionCookie!.split(";")[0] ?? "");

    assert.equal(access.status, 200);
    assert.equal(access.body.access.canAccessStudentZone, false);
    assert.equal(access.body.subscription, null);
  });
});
