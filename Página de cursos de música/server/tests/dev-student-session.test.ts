import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import {
  buildDevStudentCookieHeaderValue,
  buildDevStudentLoggedOutCookieHeaderValue,
  buildDevStudentLoggedOutSessionCookie,
  buildDevStudentSessionCookie,
  DEV_STUDENT_COOKIE_NAME,
  DEV_STUDENT_COOKIE_PATH,
  DEV_STUDENT_SESSION_LOGGED_OUT_BODY,
  parseCookieHeader,
  resolveDevStudentSession,
  signDevStudentCookiePayload,
  signDevStudentSessionPayload,
  verifyDevStudentCookiePayload,
  verifyDevStudentSessionPayload,
} from "../lib/devStudentCookie.js";
import {
  DEV_ACTIVATION_PLACEHOLDER,
  isDevActivationKeyConfigured,
} from "../lib/devActivationGate.js";
import { SEMESTRAL_PLAN_ID } from "../lib/parseActivateSemestralBody.js";
import {
  assertUserEmailTestSnapshotsEqual,
  captureUserEmailTestSnapshot,
  hasDatabase,
  restoreUserEmailTestSnapshot,
  type UserEmailTestSnapshot,
} from "./helpers/db.js";
import { buildSessionCookieHeader } from "./helpers/authSession.js";
import { prisma } from "../lib/prisma.js";
import { SESSION_COOKIE_NAME } from "../lib/jwtSession.js";

const DEV_ACTIVATION_HEADER = "X-Gmusic-Dev-Activation-Key";
const TEST_DEV_KEY = "test-dev-activation-key-valid-long";
const SESSION_TEST_EMAIL = "dev-student-session-test@gmusic.academy";
const SESSION_TEST_EMAIL_B = "dev-student-session-b-test@gmusic.academy";
const ADMIN_EMAIL = "admin@gmusic.academy";
const GUARDIAN_EMAIL = "apoderado@gmusic.academy";

const ACTIVATE_BODY = {
  name: "Session Test Alumno",
  email: SESSION_TEST_EMAIL,
  planId: SEMESTRAL_PLAN_ID,
} as const;

const ACTIVATE_BODY_B = {
  name: "Session Test Alumno B",
  email: SESSION_TEST_EMAIL_B,
  planId: SEMESTRAL_PLAN_ID,
} as const;

function signedLoggedOutCookie(signingKey = TEST_DEV_KEY): string {
  return `${DEV_STUDENT_COOKIE_NAME}=${buildDevStudentLoggedOutCookieHeaderValue(signingKey)}`;
}

describe("devStudentCookie — firma HMAC", () => {
  const previousDevKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;

  before(() => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
  });

  after(() => {
    if (previousDevKey === undefined) {
      delete process.env.GMUSIC_DEV_ACTIVATION_KEY;
    } else {
      process.env.GMUSIC_DEV_ACTIVATION_KEY = previousDevKey;
    }
  });

  it("firma y verifica email normalizado + HMAC-SHA256", () => {
    const payload = signDevStudentSessionPayload(
      { kind: "student", email: "Juan@GMUSIC.academy" },
      TEST_DEV_KEY
    );
    assert.match(payload, /^student:juan@gmusic\.academy\.[a-f0-9]{64}$/);
    const verified = verifyDevStudentSessionPayload(payload, TEST_DEV_KEY);
    assert.deepEqual(verified, { kind: "student", email: "juan@gmusic.academy" });
  });

  it("firma y verifica estado logged_out", () => {
    const payload = signDevStudentSessionPayload({ kind: "logged_out" }, TEST_DEV_KEY);
    assert.match(payload, /^logged_out\.[a-f0-9]{64}$/);
    assert.deepEqual(verifyDevStudentSessionPayload(payload, TEST_DEV_KEY), {
      kind: "logged_out",
    });
  });

  it("rechaza payload manipulado, firma inválida o formato incorrecto", () => {
    const payload = signDevStudentCookiePayload("juan@gmusic.academy", TEST_DEV_KEY);
    const [emailPart] = payload.split(".");
    const tampered = `${emailPart}x.${payload.slice(emailPart.length + 1)}`;

    assert.equal(verifyDevStudentCookiePayload(tampered, TEST_DEV_KEY), null);
    assert.equal(verifyDevStudentCookiePayload("not-an-email.deadbeef", TEST_DEV_KEY), null);
    assert.equal(verifyDevStudentCookiePayload("", TEST_DEV_KEY), null);
    assert.equal(
      verifyDevStudentCookiePayload(`${"a".repeat(300)}.${"b".repeat(64)}`, TEST_DEV_KEY),
      null
    );
  });

  it("resuelve fallback cuando no hay cookie de sesión", () => {
    const resolution = resolveDevStudentSession("other=value");
    assert.equal(resolution.kind, "fallback");
  });

  it("marca cookie inválida sin usar fallback", () => {
    const resolution = resolveDevStudentSession(`${DEV_STUDENT_COOKIE_NAME}=invalid`);
    assert.equal(resolution.kind, "invalid_cookie");
  });

  it("resuelve logged_out firmado sin fallback", () => {
    const resolution = resolveDevStudentSession(signedLoggedOutCookie());
    assert.equal(resolution.kind, "logged_out");
  });
});

describe("buildDevStudentSessionCookie", () => {
  const previousDevKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;

  before(() => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
  });

  after(() => {
    if (previousDevKey === undefined) {
      delete process.env.GMUSIC_DEV_ACTIVATION_KEY;
    } else {
      process.env.GMUSIC_DEV_ACTIVATION_KEY = previousDevKey;
    }
  });

  it("incluye HttpOnly, SameSite=Strict, Path y Max-Age esperados", () => {
    const cookie = buildDevStudentSessionCookie("juan@gmusic.academy");
    assert.match(cookie, /^gmusic_dev_student_email=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    assert.match(cookie, new RegExp(`Path=${DEV_STUDENT_COOKIE_PATH}`));
    assert.match(cookie, /Max-Age=28800/);
    assert.equal(cookie.includes("Secure"), false);
    assert.equal(cookie.includes(TEST_DEV_KEY), false);
  });

  it("logged_out cookie incluye HttpOnly, SameSite=Strict, Path y Max-Age esperados", () => {
    const cookie = buildDevStudentLoggedOutSessionCookie();
    assert.match(cookie, /^gmusic_dev_student_email=/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    assert.match(cookie, new RegExp(`Path=${DEV_STUDENT_COOKIE_PATH}`));
    assert.match(cookie, /Max-Age=28800/);
    assert.match(cookie, new RegExp(encodeURIComponent(DEV_STUDENT_SESSION_LOGGED_OUT_BODY)));
    assert.equal(cookie.includes(TEST_DEV_KEY), false);
  });

  it("falla con email inválido", () => {
    assert.throws(
      () => buildDevStudentSessionCookie("not-an-email"),
      /Email inválido para firmar cookie/i
    );
  });

  it("falla si GMUSIC_DEV_ACTIVATION_KEY no está configurada", () => {
    delete process.env.GMUSIC_DEV_ACTIVATION_KEY;
    assert.throws(
      () => buildDevStudentSessionCookie("juan@gmusic.academy"),
      /GMUSIC_DEV_ACTIVATION_KEY no está configurada/i
    );
  });

  it("falla si GMUSIC_DEV_ACTIVATION_KEY es inválida", () => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = DEV_ACTIVATION_PLACEHOLDER;
    assert.equal(isDevActivationKeyConfigured(process.env.GMUSIC_DEV_ACTIVATION_KEY), false);
    assert.throws(
      () => buildDevStudentSessionCookie("juan@gmusic.academy"),
      /GMUSIC_DEV_ACTIVATION_KEY no está configurada/i
    );
  });
});

describe("POST /api/v1/dev/activate-semestral — producción sin cookie", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDevKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;

  before(() => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
  });

  after(() => {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousDevKey === undefined) {
      delete process.env.GMUSIC_DEV_ACTIVATION_KEY;
    } else {
      process.env.GMUSIC_DEV_ACTIVATION_KEY = previousDevKey;
    }

    if (previousNodeEnv === undefined) {
      assert.equal(process.env.NODE_ENV, undefined);
    } else {
      assert.equal(process.env.NODE_ENV, previousNodeEnv);
    }
  });

  it("producción nunca emite cookie", async () => {
    process.env.NODE_ENV = "production";
    const response = await request(createApp())
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    assert.equal(response.status, 404);
    assert.equal(response.headers["set-cookie"], undefined);
    process.env.NODE_ENV = "test";
  });
});

const integration = hasDatabase ? describe : describe.skip;

integration("dev student session — integración", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDevKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;
  const previousDevUserEmail = process.env.GMUSIC_DEV_USER_EMAIL;
  let baseline: UserEmailTestSnapshot;
  let baselineB: UserEmailTestSnapshot;

  before(async () => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
    process.env.NODE_ENV = "test";
    process.env.GMUSIC_DEV_USER_EMAIL = "juan@gmusic.academy";
    baseline = await captureUserEmailTestSnapshot(SESSION_TEST_EMAIL);
    baselineB = await captureUserEmailTestSnapshot(SESSION_TEST_EMAIL_B);
  });

  after(async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, baseline);
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL_B, baselineB);
    const restored = await captureUserEmailTestSnapshot(SESSION_TEST_EMAIL);
    assertUserEmailTestSnapshotsEqual(restored, baseline);

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousDevKey === undefined) {
      delete process.env.GMUSIC_DEV_ACTIVATION_KEY;
    } else {
      process.env.GMUSIC_DEV_ACTIVATION_KEY = previousDevKey;
    }
    if (previousDevUserEmail === undefined) {
      delete process.env.GMUSIC_DEV_USER_EMAIL;
    } else {
      process.env.GMUSIC_DEV_USER_EMAIL = previousDevUserEmail;
    }

    if (previousNodeEnv === undefined) {
      assert.equal(process.env.NODE_ENV, undefined);
    } else {
      assert.equal(process.env.NODE_ENV, previousNodeEnv);
    }
  });

  it("activación establece cookie HttpOnly firmada con Path correcto", async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const agent = request.agent(createApp());
    const response = await agent
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    assert.equal(response.status, 201);
    const setCookie = response.headers["set-cookie"];
    assert.ok(setCookie);
    const cookieHeaders = Array.isArray(setCookie) ? setCookie : [setCookie];
    const devCookieHeader = cookieHeaders.find((value) => value.startsWith(`${DEV_STUDENT_COOKIE_NAME}=`));
    assert.ok(devCookieHeader);
    assert.match(devCookieHeader, /HttpOnly/);
    assert.match(devCookieHeader, /SameSite=Strict/);
    assert.match(devCookieHeader, new RegExp(`Path=${DEV_STUDENT_COOKIE_PATH}`));
    assert.equal(devCookieHeader.includes(TEST_DEV_KEY), false);

    const rawValue = parseCookieHeader(devCookieHeader).get(DEV_STUDENT_COOKIE_NAME);
    assert.ok(rawValue);
    const payload = decodeURIComponent(rawValue!);
    const verified = verifyDevStudentSessionPayload(payload, TEST_DEV_KEY);
    assert.deepEqual(verified, { kind: "student", email: SESSION_TEST_EMAIL });

    assert.ok(
      cookieHeaders.some((value) => value.startsWith(`${SESSION_COOKIE_NAME}=`)),
      "activación también emite gmusic_session JWT"
    );
  });

  it("cookie firmada válida permite /me/access", async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const agent = request.agent(createApp());
    await agent
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    const access = await agent.get("/api/v1/me/access");
    assert.equal(access.status, 200);
    assert.equal(access.body.user.email, SESSION_TEST_EMAIL);
    assert.equal(access.body.access.canAccessStudentZone, true);
  });

  it("dos agentes concurrentes no mezclan identidades", async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL_B, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const agentA = request.agent(createApp());
    const agentB = request.agent(createApp());

    await agentA
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);
    await agentB
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY_B);

    const [accessA, accessB] = await Promise.all([
      agentA.get("/api/v1/me/access"),
      agentB.get("/api/v1/me/access"),
    ]);

    assert.equal(accessA.body.user.email, SESSION_TEST_EMAIL);
    assert.equal(accessB.body.user.email, SESSION_TEST_EMAIL_B);
  });

  it("sin cookie responde 401 (realStudentAuth sin fallback dev)", async () => {
    const response = await request(createApp()).get("/api/v1/me/access");
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("cookie dev manipulada responde 401 (ignorada por realStudentAuth)", async () => {
    const payload = signDevStudentCookiePayload(SESSION_TEST_EMAIL, TEST_DEV_KEY);
    const tampered = payload.replace("session-test", "session-hack");

    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", `${DEV_STUDENT_COOKIE_NAME}=${encodeURIComponent(tampered)}`);

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("cookie dev sin firma responde 401 (ignorada por realStudentAuth)", async () => {
    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", `${DEV_STUDENT_COOKIE_NAME}=${encodeURIComponent(SESSION_TEST_EMAIL)}`);

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("JWT de ADMIN responde 403", async () => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: ADMIN_EMAIL } });
    const cookie = await buildSessionCookieHeader(admin.id);

    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", cookie);

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("JWT de GUARDIAN responde 403", async () => {
    const guardian = await prisma.user.findUniqueOrThrow({ where: { email: GUARDIAN_EMAIL } });
    const cookie = await buildSessionCookieHeader(guardian.id);

    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", cookie);

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("después de logout responde 401 sin fallback", async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const agent = request.agent(createApp());
    await agent
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    const sessionAccess = await agent.get("/api/v1/me/access");
    assert.equal(sessionAccess.body.user.email, SESSION_TEST_EMAIL);

    const logout = await agent
      .post("/api/v1/dev/logout")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY);
    assert.equal(logout.status, 204);
    const logoutCookie = logout.headers["set-cookie"];
    assert.ok(logoutCookie);
    const cookieHeader = Array.isArray(logoutCookie) ? logoutCookie[0] : logoutCookie;
    assert.match(cookieHeader, /HttpOnly/);
    assert.match(cookieHeader, new RegExp(encodeURIComponent(DEV_STUDENT_SESSION_LOGGED_OUT_BODY)));

    const afterLogout = await agent.get("/api/v1/me/access");
    assert.equal(afterLogout.status, 401);
    assert.equal(afterLogout.body.error.code, "UNAUTHORIZED");
  });

  it("logout no modifica usuario ni suscripción", async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const agent = request.agent(createApp());
    await agent
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    const before = await captureUserEmailTestSnapshot(SESSION_TEST_EMAIL);

    await agent
      .post("/api/v1/dev/logout")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY);

    const after = await captureUserEmailTestSnapshot(SESSION_TEST_EMAIL);
    assertUserEmailTestSnapshotsEqual(after, before);
    assert.equal(after.subscriptions.length > 0, true);
  });

  it("nueva activación reemplaza logged_out y recupera acceso", async () => {
    await restoreUserEmailTestSnapshot(SESSION_TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const agent = request.agent(createApp());
    await agent
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    await agent
      .post("/api/v1/dev/logout")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY);

    const denied = await agent.get("/api/v1/me/access");
    assert.equal(denied.status, 401);

    await agent
      .post("/api/v1/dev/activate-semestral")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY)
      .send(ACTIVATE_BODY);

    const restored = await agent.get("/api/v1/me/access");
    assert.equal(restored.status, 200);
    assert.equal(restored.body.user.email, SESSION_TEST_EMAIL);
    assert.equal(restored.body.access.canAccessStudentZone, true);
  });

  it("cookie dev logged_out responde 401 sin fallback", async () => {
    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", signedLoggedOutCookie());

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
    assert.equal(response.body.user, undefined);
  });
});

integration("POST /api/v1/dev/logout — seguridad", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDevKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;

  before(() => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
    process.env.NODE_ENV = "test";
  });

  after(() => {
    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
    if (previousDevKey === undefined) {
      delete process.env.GMUSIC_DEV_ACTIVATION_KEY;
    } else {
      process.env.GMUSIC_DEV_ACTIVATION_KEY = previousDevKey;
    }

    if (previousNodeEnv === undefined) {
      assert.equal(process.env.NODE_ENV, undefined);
    } else {
      assert.equal(process.env.NODE_ENV, previousNodeEnv);
    }
  });

  it("producción responde 404", async () => {
    process.env.NODE_ENV = "production";
    const response = await request(createApp())
      .post("/api/v1/dev/logout")
      .set(DEV_ACTIVATION_HEADER, TEST_DEV_KEY);
    assert.equal(response.status, 404);
    assert.equal(response.headers["set-cookie"], undefined);
    process.env.NODE_ENV = "test";
  });
});
