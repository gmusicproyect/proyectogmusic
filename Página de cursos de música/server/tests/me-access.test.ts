import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { SubscriptionStatus } from "@prisma/client";
import request from "supertest";
import { createApp } from "../app.js";
import {
  isActiveSubscriptionValid,
  resolveStudentAccess,
  selectBestActiveSubscription,
  type SubscriptionAccessRecord,
} from "../lib/studentAccess.js";
import {
  assertUserSubscriptionsSnapshotsEqual,
  captureUserSubscriptionsSnapshot,
  getDevStudent,
  hasDatabase,
  restoreUserSubscriptionsSnapshot,
  type SubscriptionRowSnapshot,
} from "./helpers/db.js";

const FORBIDDEN_ACCESS_RESPONSE_KEYS = [
  "paymentMethod",
  "amount",
  "currency",
  "transactionId",
  "secureAnswer",
  "password",
  "stripe",
];

function assertAccessResponseHasNoSensitiveFields(body: unknown): void {
  const serialized = JSON.stringify(body).toLowerCase();
  for (const key of FORBIDDEN_ACCESS_RESPONSE_KEYS) {
    assert.equal(
      serialized.includes(key.toLowerCase()),
      false,
      `La respuesta no debe incluir ${key}`
    );
  }
}

function subscriptionRow(
  overrides: Partial<SubscriptionAccessRecord> & Pick<SubscriptionAccessRecord, "id">
): SubscriptionAccessRecord {
  return {
    status: SubscriptionStatus.ACTIVE,
    planId: "plan-default",
    endsAt: new Date("2027-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("isActiveSubscriptionValid", () => {
  const now = new Date("2026-06-09T12:00:00.000Z");

  it("permite ACTIVE vigente con endsAt futuro", () => {
    assert.equal(
      isActiveSubscriptionValid(
        subscriptionRow({
          id: "s1",
          endsAt: new Date("2026-12-09T12:00:00.000Z"),
        }),
        now
      ),
      true
    );
  });

  it("permite ACTIVE sin endsAt", () => {
    assert.equal(
      isActiveSubscriptionValid(subscriptionRow({ id: "s1", endsAt: null }), now),
      true
    );
  });

  it("rechaza ACTIVE vencida", () => {
    assert.equal(
      isActiveSubscriptionValid(
        subscriptionRow({ id: "s1", endsAt: new Date("2026-06-09T11:59:59.999Z") }),
        now
      ),
      false
    );
  });

  it("rechaza ACTIVE con endsAt exactamente igual a now", () => {
    assert.equal(
      isActiveSubscriptionValid(subscriptionRow({ id: "s1", endsAt: now }), now),
      false
    );
  });

  it("rechaza CANCELED y PAST_DUE", () => {
    assert.equal(
      isActiveSubscriptionValid(
        subscriptionRow({ id: "s1", status: SubscriptionStatus.CANCELED }),
        now
      ),
      false
    );
    assert.equal(
      isActiveSubscriptionValid(
        subscriptionRow({ id: "s2", status: SubscriptionStatus.PAST_DUE }),
        now
      ),
      false
    );
  });
});

describe("selectBestActiveSubscription", () => {
  const now = new Date("2026-06-09T12:00:00.000Z");

  it("elige la ACTIVE vigente con endsAt más lejano", () => {
    const selected = selectBestActiveSubscription(
      [
        subscriptionRow({
          id: "b-later",
          endsAt: new Date("2026-12-09T12:00:00.000Z"),
        }),
        subscriptionRow({
          id: "a-sooner",
          endsAt: new Date("2026-09-09T12:00:00.000Z"),
        }),
      ],
      now
    );

    assert.equal(selected?.id, "b-later");
  });

  it("prioriza endsAt null sobre fechas finitas", () => {
    const selected = selectBestActiveSubscription(
      [
        subscriptionRow({
          id: "finite",
          endsAt: new Date("2030-01-01T00:00:00.000Z"),
        }),
        subscriptionRow({ id: "open-ended", endsAt: null }),
      ],
      now
    );

    assert.equal(selected?.id, "open-ended");
  });

  it("desempata por id ascendente con el mismo endsAt", () => {
    const sameEndsAt = new Date("2027-06-09T12:00:00.000Z");
    const selected = selectBestActiveSubscription(
      [
        subscriptionRow({ id: "z-sub", endsAt: sameEndsAt }),
        subscriptionRow({ id: "a-sub", endsAt: sameEndsAt }),
      ],
      now
    );

    assert.equal(selected?.id, "a-sub");
  });
});

describe("resolveStudentAccess", () => {
  const now = new Date("2026-06-09T12:00:00.000Z");

  it("deniega acceso sin suscripción válida", () => {
    const result = resolveStudentAccess([], now);
    assert.equal(result.canAccessStudentZone, false);
    assert.equal(result.reason, "NO_ACTIVE_SUBSCRIPTION");
    assert.equal(result.subscription, null);
  });

  it("permite acceso con ACTIVE vigente", () => {
    const result = resolveStudentAccess(
      [
        subscriptionRow({
          id: "active",
          planId: "gmusic-semester-6-months",
          endsAt: new Date("2026-12-09T12:00:00.000Z"),
        }),
      ],
      now
    );

    assert.equal(result.canAccessStudentZone, true);
    assert.equal(result.reason, "ACTIVE_SUBSCRIPTION");
    assert.equal(result.subscription?.planId, "gmusic-semester-6-months");
    assert.equal(result.subscription?.status, "ACTIVE");
  });
});

describe("devStudentAuth in production (access)", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  before(() => {
    process.env.NODE_ENV = "production";
  });

  after(() => {
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("rechaza GET /api/v1/me/access con 401 UNAUTHORIZED", async () => {
    const response = await request(createApp()).get("/api/v1/me/access");
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });
});

const integration = hasDatabase ? describe : describe.skip;

integration("GET /api/v1/me/access", () => {
  let baseline: SubscriptionRowSnapshot[];

  before(async () => {
    const student = await getDevStudent();
    baseline = await captureUserSubscriptionsSnapshot(student.id);
  });

  after(async () => {
    const student = await getDevStudent();
    await restoreUserSubscriptionsSnapshot(student.id, baseline);
    const restored = await captureUserSubscriptionsSnapshot(student.id);
    assertUserSubscriptionsSnapshotsEqual(restored, baseline);
  });

  it("expone Cache-Control: no-store", async () => {
    const response = await request(createApp()).get("/api/v1/me/access");
    assert.equal(response.status, 200);
    assert.equal(response.headers["cache-control"], "no-store");
  });

  it("Juan ACTIVE y vigente → acceso permitido", async () => {
    const response = await request(createApp()).get("/api/v1/me/access");

    assert.equal(response.status, 200);
    assert.equal(response.body.access.canAccessStudentZone, true);
    assert.equal(response.body.access.reason, "ACTIVE_SUBSCRIPTION");
    assert.equal(response.body.subscription?.status, "ACTIVE");
    assert.equal(response.body.user.email, process.env.GMUSIC_DEV_USER_EMAIL);
    assertAccessResponseHasNoSensitiveFields(response.body);
  });

  it("ACTIVE sin endsAt → acceso permitido", async () => {
    const student = await getDevStudent();
    const snapshot = await captureUserSubscriptionsSnapshot(student.id);

    try {
      await restoreUserSubscriptionsSnapshot(student.id, [
        {
          id: snapshot[0]?.id ?? "00000000-0000-4000-8000-000000000001",
          userId: student.id,
          status: SubscriptionStatus.ACTIVE,
          planId: "gmusic-open",
          endsAt: null,
          createdAt: snapshot[0]?.createdAt ?? new Date(),
          updatedAt: new Date(),
        },
      ]);

      const response = await request(createApp()).get("/api/v1/me/access");
      assert.equal(response.status, 200);
      assert.equal(response.body.access.canAccessStudentZone, true);
      assert.equal(response.body.subscription.endsAt, null);
    } finally {
      await restoreUserSubscriptionsSnapshot(student.id, snapshot);
    }
  });

  it("ACTIVE vencida → acceso denegado", async () => {
    const student = await getDevStudent();
    const snapshot = await captureUserSubscriptionsSnapshot(student.id);

    try {
      await restoreUserSubscriptionsSnapshot(student.id, [
        {
          id: snapshot[0]?.id ?? "00000000-0000-4000-8000-000000000002",
          userId: student.id,
          status: SubscriptionStatus.ACTIVE,
          planId: "gmusic-expired",
          endsAt: new Date("2020-01-01T00:00:00.000Z"),
          createdAt: snapshot[0]?.createdAt ?? new Date(),
          updatedAt: new Date(),
        },
      ]);

      const response = await request(createApp()).get("/api/v1/me/access");
      assert.equal(response.status, 200);
      assert.equal(response.body.access.canAccessStudentZone, false);
      assert.equal(response.body.access.reason, "NO_ACTIVE_SUBSCRIPTION");
      assert.equal(response.body.subscription, null);
    } finally {
      await restoreUserSubscriptionsSnapshot(student.id, snapshot);
    }
  });

  it("CANCELED / PAST_DUE → acceso denegado", async () => {
    const student = await getDevStudent();
    const snapshot = await captureUserSubscriptionsSnapshot(student.id);
    const createdAt = snapshot[0]?.createdAt ?? new Date();

    for (const status of [SubscriptionStatus.CANCELED, SubscriptionStatus.PAST_DUE] as const) {
      try {
        await restoreUserSubscriptionsSnapshot(student.id, [
          {
            id: snapshot[0]?.id ?? "00000000-0000-4000-8000-000000000003",
            userId: student.id,
            status,
            planId: "gmusic-invalid",
            endsAt: new Date("2030-01-01T00:00:00.000Z"),
            createdAt,
            updatedAt: new Date(),
          },
        ]);

        const response = await request(createApp()).get("/api/v1/me/access");
        assert.equal(response.status, 200);
        assert.equal(response.body.access.canAccessStudentZone, false);
        assert.equal(response.body.access.reason, "NO_ACTIVE_SUBSCRIPTION");
      } finally {
        await restoreUserSubscriptionsSnapshot(student.id, snapshot);
      }
    }
  });

  it("varias suscripciones → selección determinística de la vigente más lejana", async () => {
    const student = await getDevStudent();
    const snapshot = await captureUserSubscriptionsSnapshot(student.id);
    const createdAt = snapshot[0]?.createdAt ?? new Date();

    try {
      await restoreUserSubscriptionsSnapshot(student.id, [
        {
          id: "00000000-0000-4000-8000-000000000010",
          userId: student.id,
          status: SubscriptionStatus.ACTIVE,
          planId: "plan-sooner",
          endsAt: new Date("2026-09-01T00:00:00.000Z"),
          createdAt,
          updatedAt: new Date(),
        },
        {
          id: "00000000-0000-4000-8000-000000000011",
          userId: student.id,
          status: SubscriptionStatus.CANCELED,
          planId: "plan-canceled",
          endsAt: new Date("2099-01-01T00:00:00.000Z"),
          createdAt,
          updatedAt: new Date(),
        },
        {
          id: "00000000-0000-4000-8000-000000000012",
          userId: student.id,
          status: SubscriptionStatus.ACTIVE,
          planId: "plan-latest",
          endsAt: new Date("2027-06-01T00:00:00.000Z"),
          createdAt,
          updatedAt: new Date(),
        },
      ]);

      const response = await request(createApp()).get("/api/v1/me/access");
      assert.equal(response.status, 200);
      assert.equal(response.body.access.canAccessStudentZone, true);
      assert.equal(response.body.subscription.planId, "plan-latest");
    } finally {
      await restoreUserSubscriptionsSnapshot(student.id, snapshot);
    }
  });

  it("alumno sin suscripción → acceso denegado", async () => {
    const student = await getDevStudent();
    const snapshot = await captureUserSubscriptionsSnapshot(student.id);

    try {
      await restoreUserSubscriptionsSnapshot(student.id, []);

      const response = await request(createApp()).get("/api/v1/me/access");
      assert.equal(response.status, 200);
      assert.equal(response.body.access.canAccessStudentZone, false);
      assert.equal(response.body.access.reason, "NO_ACTIVE_SUBSCRIPTION");
      assert.equal(response.body.subscription, null);
      assertAccessResponseHasNoSensitiveFields(response.body);
    } finally {
      await restoreUserSubscriptionsSnapshot(student.id, snapshot);
    }
  });
});
