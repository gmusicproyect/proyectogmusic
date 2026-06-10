import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { SubscriptionStatus } from "@prisma/client";
import request from "supertest";
import { createApp } from "../app.js";
import {
  DEV_ACTIVATION_KEY_MIN_LENGTH,
  DEV_ACTIVATION_PLACEHOLDER,
  isDevActivationKeyConfigured,
} from "../lib/devActivationGate.js";
import { parseActivateSemestralBody, SEMESTRAL_PLAN_ID } from "../lib/parseActivateSemestralBody.js";
import {
  assertUserEmailTestSnapshotsEqual,
  captureUserEmailTestSnapshot,
  captureUserSubscriptionsSnapshot,
  countUserLearningActivity,
  getDevStudent,
  hasDatabase,
  restoreUserEmailTestSnapshot,
  type UserEmailTestSnapshot,
} from "./helpers/db.js";

const DEV_ACTIVATION_HEADER = "X-Gmusic-Dev-Activation-Key";
const TEST_DEV_KEY = "test-dev-activation-key-valid-long";
const TEST_EMAIL = "dev-semestral-activate-test@gmusic.academy";
const ADMIN_EMAIL = "admin@gmusic.academy";
const GUARDIAN_EMAIL = "apoderado@gmusic.academy";

const VALID_BODY = {
  name: "Dev Test Alumno",
  email: TEST_EMAIL,
  planId: SEMESTRAL_PLAN_ID,
} as const;

const FORBIDDEN_RESPONSE_KEYS = [
  "paymentMethod",
  "amount",
  "currency",
  "transactionId",
  "secureAnswer",
  "password",
  "stripe",
  "role",
  "timezone",
];

function assertActivationResponseHasNoSensitiveFields(body: unknown): void {
  const serialized = JSON.stringify(body).toLowerCase();
  for (const key of FORBIDDEN_RESPONSE_KEYS) {
    assert.equal(
      serialized.includes(`"${key.toLowerCase()}"`),
      false,
      `La respuesta no debe incluir ${key}`
    );
  }
}

function postActivate(
  body: object,
  options?: { key?: string | null; omitHeader?: boolean }
) {
  const req = request(createApp())
    .post("/api/v1/dev/activate-semestral")
    .send(body);

  if (!options?.omitHeader) {
    req.set(DEV_ACTIVATION_HEADER, options?.key ?? TEST_DEV_KEY);
  }

  return req;
}

describe("isDevActivationKeyConfigured", () => {
  it("rechaza claves ausentes, vacías, placeholder o demasiado cortas", () => {
    assert.equal(isDevActivationKeyConfigured(undefined), false);
    assert.equal(isDevActivationKeyConfigured(""), false);
    assert.equal(isDevActivationKeyConfigured("   "), false);
    assert.equal(isDevActivationKeyConfigured(DEV_ACTIVATION_PLACEHOLDER), false);
    assert.equal(
      isDevActivationKeyConfigured("a".repeat(DEV_ACTIVATION_KEY_MIN_LENGTH - 1)),
      false
    );
  });

  it("acepta claves válidas de al menos 24 caracteres", () => {
    assert.equal(isDevActivationKeyConfigured(TEST_DEV_KEY), true);
    assert.ok(TEST_DEV_KEY.length >= DEV_ACTIVATION_KEY_MIN_LENGTH);
  });
});

describe("parseActivateSemestralBody", () => {
  it("normaliza email a minúsculas", () => {
    const parsed = parseActivateSemestralBody({
      name: "Juan Lizama",
      email: "  JUAN@GMUSIC.ACADEMY  ",
      planId: SEMESTRAL_PLAN_ID,
    });
    assert.equal(parsed.email, "juan@gmusic.academy");
  });

  it("rechaza plan distinto", () => {
    assert.throws(
      () =>
        parseActivateSemestralBody({
          name: "Juan",
          email: "juan@gmusic.academy",
          planId: "otro-plan",
        }),
      (error: unknown) =>
        error instanceof Error && /planId debe ser/i.test(error.message)
    );
  });

  it("rechaza campos desconocidos", () => {
    assert.throws(
      () =>
        parseActivateSemestralBody({
          ...VALID_BODY,
          role: "ADMIN",
        }),
      (error: unknown) =>
        error instanceof Error && /Campo desconocido: role/i.test(error.message)
    );
    assert.throws(
      () =>
        parseActivateSemestralBody({
          ...VALID_BODY,
          endsAt: "2026-12-09T00:00:00.000Z",
        }),
      (error: unknown) =>
        error instanceof Error && /Campo desconocido: endsAt/i.test(error.message)
    );
  });
});

describe("POST /api/v1/dev/activate-semestral — seguridad", () => {
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
  });

  it("producción responde 404", async () => {
    process.env.NODE_ENV = "production";
    const response = await postActivate(VALID_BODY);
    assert.equal(response.status, 404);
    assert.equal(response.body.error.code, "INTERNAL_ERROR");
  });

  it("sin clave responde 404", async () => {
    process.env.NODE_ENV = "test";
    const response = await request(createApp())
      .post("/api/v1/dev/activate-semestral")
      .send(VALID_BODY);
    assert.equal(response.status, 404);
  });

  it("clave incorrecta responde 404", async () => {
    process.env.NODE_ENV = "test";
    const response = await postActivate(VALID_BODY, { key: "wrong-key-that-is-long-enough-12345" });
    assert.equal(response.status, 404);
  });

  it("clave placeholder en entorno responde 404", async () => {
    process.env.NODE_ENV = "test";
    process.env.GMUSIC_DEV_ACTIVATION_KEY = DEV_ACTIVATION_PLACEHOLDER;
    const response = await postActivate(VALID_BODY, { key: DEV_ACTIVATION_PLACEHOLDER });
    assert.equal(response.status, 404);
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
  });

  it("clave menor de 24 caracteres en entorno responde 404", async () => {
    process.env.NODE_ENV = "test";
    process.env.GMUSIC_DEV_ACTIVATION_KEY = "short-dev-key";
    const response = await postActivate(VALID_BODY, { key: "short-dev-key" });
    assert.equal(response.status, 404);
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
  });

  it("clave válida larga permite pasar el gate", async () => {
    process.env.NODE_ENV = "test";
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
    const response = await postActivate({ email: TEST_EMAIL } as object);
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("body inválido responde 400", async () => {
    process.env.NODE_ENV = "test";
    const response = await postActivate({ email: TEST_EMAIL } as object);
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("NODE_ENV queda restaurado al finalizar la suite", () => {
    if (previousNodeEnv === undefined) {
      assert.equal(process.env.NODE_ENV, "test");
    } else {
      assert.equal(process.env.NODE_ENV, previousNodeEnv);
    }
  });
});

const integration = hasDatabase ? describe : describe.skip;

integration("POST /api/v1/dev/activate-semestral — integración", () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousDevKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;
  let baseline: UserEmailTestSnapshot;
  let adminBaseline: UserEmailTestSnapshot;
  let guardianBaseline: UserEmailTestSnapshot;
  let devStudentActivityBefore: Awaited<ReturnType<typeof countUserLearningActivity>>;

  before(async () => {
    process.env.GMUSIC_DEV_ACTIVATION_KEY = TEST_DEV_KEY;
    process.env.NODE_ENV = "test";
    baseline = await captureUserEmailTestSnapshot(TEST_EMAIL);
    adminBaseline = await captureUserEmailTestSnapshot(ADMIN_EMAIL);
    guardianBaseline = await captureUserEmailTestSnapshot(GUARDIAN_EMAIL);
    const devStudent = await getDevStudent();
    devStudentActivityBefore = await countUserLearningActivity(devStudent.id);
  });

  after(async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, baseline);
    const restored = await captureUserEmailTestSnapshot(TEST_EMAIL);
    assertUserEmailTestSnapshotsEqual(restored, baseline);

    const adminAfter = await captureUserEmailTestSnapshot(ADMIN_EMAIL);
    assertUserEmailTestSnapshotsEqual(adminAfter, adminBaseline);

    const guardianAfter = await captureUserEmailTestSnapshot(GUARDIAN_EMAIL);
    assertUserEmailTestSnapshotsEqual(guardianAfter, guardianBaseline);

    const devStudent = await getDevStudent();
    const devStudentActivityAfter = await countUserLearningActivity(devStudent.id);
    assert.deepEqual(devStudentActivityAfter, devStudentActivityBefore);

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
  });

  it("expone Cache-Control: no-store", async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const response = await postActivate(VALID_BODY);
    assert.equal(response.status, 201);
    assert.equal(response.headers["cache-control"], "no-store");
  });

  it("clave válida larga funciona", async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const response = await postActivate(VALID_BODY);
    assert.equal(response.status, 201);
    assert.equal(response.body.subscription.planId, SEMESTRAL_PLAN_ID);
  });

  it("primera llamada responde 201", async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const response = await postActivate(VALID_BODY);
    assert.equal(response.status, 201);
    assert.equal(response.body.access.canAccessStudentZone, true);
    assert.equal(response.body.access.reason, "ACTIVE_SUBSCRIPTION");
    assert.equal(response.body.subscription.status, "ACTIVE");
    assert.equal(response.body.subscription.planId, SEMESTRAL_PLAN_ID);
    assertActivationResponseHasNoSensitiveFields(response.body);

    const user = await captureUserEmailTestSnapshot(TEST_EMAIL);
    assert.equal(user.subscriptions.length, 1);
    assert.equal(user.subscriptions[0]?.status, SubscriptionStatus.ACTIVE);
  });

  it("segunda llamada responde 200 con exactamente una ACTIVE", async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const first = await postActivate(VALID_BODY);
    assert.equal(first.status, 201);

    const second = await postActivate(VALID_BODY);
    assert.equal(second.status, 200);
    assert.equal(second.body.user.email, TEST_EMAIL);
    assertActivationResponseHasNoSensitiveFields(second.body);

    const snapshot = await captureUserSubscriptionsSnapshot(second.body.user.id);
    assert.equal(snapshot.length, 1);
    assert.equal(snapshot[0]?.status, SubscriptionStatus.ACTIVE);
    assert.equal(snapshot[0]?.planId, SEMESTRAL_PLAN_ID);
  });

  it("concurrencia deja exactamente una suscripción ACTIVE", async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, {
      existed: false,
      user: null,
      subscriptions: [],
    });

    const [a, b] = await Promise.all([
      postActivate(VALID_BODY),
      postActivate(VALID_BODY),
    ]);

    assert.ok(a.status === 201 || a.status === 200);
    assert.ok(b.status === 201 || b.status === 200);
    assert.notEqual(a.status, b.status);

    const userId = a.body.user.id;
    const snapshot = await captureUserSubscriptionsSnapshot(userId);
    assert.equal(snapshot.length, 1);
    assert.equal(snapshot[0]?.status, SubscriptionStatus.ACTIVE);
  });

  it("no crea actividad de aprendizaje", async () => {
    const before = await captureUserEmailTestSnapshot(TEST_EMAIL);
    const userId = before.user?.id;
    const countsBefore = userId
      ? await countUserLearningActivity(userId)
      : {
          userProgress: 0,
          lessonSessions: 0,
          exerciseAttempts: 0,
          xpEvents: 0,
          streakEvents: 0,
        };

    await postActivate(VALID_BODY);

    const afterUser = await captureUserEmailTestSnapshot(TEST_EMAIL);
    const countsAfter = await countUserLearningActivity(afterUser.user!.id);
    assert.deepEqual(countsAfter, countsBefore);
  });

  it("no permite activar ADMIN", async () => {
    const response = await postActivate({
      name: "Admin Gmusic",
      email: ADMIN_EMAIL,
      planId: SEMESTRAL_PLAN_ID,
    });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("no permite activar GUARDIAN", async () => {
    const response = await postActivate({
      name: "María Apoderado",
      email: GUARDIAN_EMAIL,
      planId: SEMESTRAL_PLAN_ID,
    });
    assert.equal(response.status, 403);
    assert.equal(response.body.error.code, "FORBIDDEN");
  });

  it("snapshot completo del usuario queda idéntico después de la suite", async () => {
    await restoreUserEmailTestSnapshot(TEST_EMAIL, baseline);
    const restored = await captureUserEmailTestSnapshot(TEST_EMAIL);
    assertUserEmailTestSnapshotsEqual(restored, baseline);
  });

  it("NODE_ENV queda restaurado al finalizar la suite", () => {
    if (previousNodeEnv === undefined) {
      assert.equal(process.env.NODE_ENV, "test");
    } else {
      assert.equal(process.env.NODE_ENV, previousNodeEnv);
    }
  });
});
