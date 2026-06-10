import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import { createApp } from "../app.js";
import {
  buildDevStudentCookieHeaderValue,
  buildDevStudentSessionClearCookie,
  buildDevStudentSessionCookie,
  DEV_STUDENT_COOKIE_NAME,
  DEV_STUDENT_COOKIE_PATH,
  parseCookieHeader,
  resolveDevStudentEmail,
  signDevStudentCookiePayload,
  verifyDevStudentCookiePayload,
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

function signedCookie(email: string, signingKey = TEST_DEV_KEY): string {
  return `${DEV_STUDENT_COOKIE_NAME}=${buildDevStudentCookieHeaderValue(email, signingKey)}`;
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
    const payload = signDevStudentCookiePayload("Juan@GMUSIC.academy", TEST_DEV_KEY);
    assert.match(payload, /^juan@gmusic\.academy\.[a-f0-9]{64}$/);
    assert.equal(verifyDevStudentCookiePayload(payload, TEST_DEV_KEY), "juan@gmusic.academy");
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
    const resolution = resolveDevStudentEmail("other=value");
    assert.equal(resolution.kind, "fallback");
  });

  it("marca cookie inválida sin usar fallback", () => {
    const resolution = resolveDevStudentEmail(`${DEV_STUDENT_COOKIE_NAME}=invalid`);
    assert.equal(resolution.kind, "invalid_cookie");
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

  it("clear cookie usa Max-Age=0 y Expires", () => {
    const cookie = buildDevStudentSessionClearCookie();
    assert.match(cookie, /Max-Age=0/);
    assert.match(cookie, /Expires=Thu, 01 Jan 1970 00:00:00 GMT/);
    assert.match(cookie, new RegExp(`Path=${DEV_STUDENT_COOKIE_PATH}`));
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
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie;
    assert.match(cookieHeader, /HttpOnly/);
    assert.match(cookieHeader, /SameSite=Strict/);
    assert.match(cookieHeader, new RegExp(`Path=${DEV_STUDENT_COOKIE_PATH}`));
    assert.equal(cookieHeader.includes(TEST_DEV_KEY), false);

    const rawValue = parseCookieHeader(cookieHeader).get(DEV_STUDENT_COOKIE_NAME);
    assert.ok(rawValue);
    const payload = decodeURIComponent(rawValue!);
    assert.equal(verifyDevStudentCookiePayload(payload, TEST_DEV_KEY), SESSION_TEST_EMAIL);
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

  it("sin cookie conserva fallback GMUSIC_DEV_USER_EMAIL", async () => {
    const response = await request(createApp()).get("/api/v1/me/access");
    assert.equal(response.status, 200);
    assert.equal(response.body.user.email, process.env.GMUSIC_DEV_USER_EMAIL);
  });

  it("cookie manipulada responde 401 sin fallback", async () => {
    const payload = signDevStudentCookiePayload(SESSION_TEST_EMAIL, TEST_DEV_KEY);
    const tampered = payload.replace("session-test", "session-hack");

    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", `${DEV_STUDENT_COOKIE_NAME}=${encodeURIComponent(tampered)}`);

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("cookie sin firma responde 401 sin fallback", async () => {
    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", `${DEV_STUDENT_COOKIE_NAME}=${encodeURIComponent(SESSION_TEST_EMAIL)}`);

    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("cookie firmada de ADMIN responde 403", async () => {
    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", signedCookie(ADMIN_EMAIL));

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("cookie firmada de GUARDIAN responde 403", async () => {
    const response = await request(createApp())
      .get("/api/v1/me/access")
      .set("Cookie", signedCookie(GUARDIAN_EMAIL));

    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("después de logout el mismo agente usa fallback", async () => {
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

    const fallbackAccess = await agent.get("/api/v1/me/access");
    assert.equal(fallbackAccess.status, 200);
    assert.equal(fallbackAccess.body.user.email, process.env.GMUSIC_DEV_USER_EMAIL);
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
