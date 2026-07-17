import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AccountTier, SubscriptionStatus } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import {
  assertMonthPlayableForPractice,
  buildEntitlementBlocker,
  isMonthPlayable,
  isMonthVisible,
  PLAN_CATALOG_H1,
  resolveEntitlementsH1,
  type AccessViewH1,
} from "../lib/entitlementsH1.js";

function fakeUser(id = "user-ent-1") {
  return {
    id,
    accountTier: AccountTier.DEMO,
  };
}

describe("P0-07 Entitlements H1", () => {
  it("T-ENT-01: demo — M1 playable; M3 not playable; M3 visible", () => {
    const view = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [],
    });
    assert.equal(view.catalogPlanId, "demo");
    assert.equal(isMonthPlayable(view.grants, 1), true);
    assert.equal(isMonthPlayable(view.grants, 3), false);
    assert.equal(isMonthVisible(view.grants, 3), true);
    assert.equal(view.grants.communityAccess, false);
    assert.equal(view.grants.features.premiumLibrary, false);
  });

  it("T-ENT-02: subscriber — M1–M2 playable", () => {
    const view = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [
        {
          id: "sub-1",
          status: SubscriptionStatus.ACTIVE,
          planId: "gmusic-semester-6-months",
          endsAt: new Date("2027-01-01T00:00:00.000Z"),
        },
      ],
    });
    assert.equal(view.catalogPlanId, "subscriber");
    assert.equal(isMonthPlayable(view.grants, 1), true);
    assert.equal(isMonthPlayable(view.grants, 2), true);
    assert.equal(isMonthPlayable(view.grants, 5), false);
    assert.equal(view.billingStatus, "active");
  });

  it("T-ENT-03: StartPractice M5 → 403 ENTITLEMENT", () => {
    const view = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [
        {
          id: "sub-1",
          status: SubscriptionStatus.ACTIVE,
          planId: "gmusic-semester-6-months",
          endsAt: null,
        },
      ],
    });
    assert.throws(
      () => assertMonthPlayableForPractice(view, 5),
      (err: unknown) =>
        err instanceof ApiError && err.status === 403 && err.code === "ENTITLEMENT"
    );
  });

  it("T-ENT-04: communityAccess === false", () => {
    for (const plan of Object.values(PLAN_CATALOG_H1)) {
      assert.equal(plan.communityAccess, false);
    }
    const view = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [
        {
          id: "sub-1",
          status: SubscriptionStatus.ACTIVE,
          planId: "plan-x",
          endsAt: null,
        },
      ],
    });
    assert.equal(view.grants.communityAccess, false);
    assert.equal(view.grants.features.community, false);
  });

  it("T-ENT-05: libraryTier !== premium en MVP plans", () => {
    for (const plan of Object.values(PLAN_CATALOG_H1)) {
      assert.notEqual(plan.libraryTier, "premium");
    }
    const view = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [],
    });
    assert.notEqual(view.grants.libraryTier, "premium");
    assert.equal(view.grants.features.premiumLibrary, false);
  });

  it("T-ENT-07: canceled con validUntil futuro mantiene grants; luego expired", () => {
    const now = new Date("2026-07-16T12:00:00.000Z");
    const kept: AccessViewH1 = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [
        {
          id: "sub-c",
          status: SubscriptionStatus.CANCELED,
          planId: "gmusic-semester-6-months",
          endsAt: new Date("2026-12-01T00:00:00.000Z"),
        },
      ],
      now,
    });
    assert.equal(kept.billingStatus, "canceled");
    assert.equal(kept.catalogPlanId, "subscriber");
    assert.equal(isMonthPlayable(kept.grants, 2), true);

    const expired = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [
        {
          id: "sub-c",
          status: SubscriptionStatus.CANCELED,
          planId: "gmusic-semester-6-months",
          endsAt: new Date("2026-01-01T00:00:00.000Z"),
        },
      ],
      now,
    });
    assert.equal(expired.billingStatus, "expired");
    assert.equal(expired.catalogPlanId, "demo");
    assert.equal(isMonthPlayable(expired.grants, 2), false);
    assert.equal(isMonthPlayable(expired.grants, 1), true);
  });

  it("T-ENT-08: blocker amable con actionTarget planes", () => {
    const blocker = buildEntitlementBlocker(5);
    assert.equal(blocker.code, "ENTITLEMENT");
    assert.equal(blocker.actionTarget, "/#planes");
    assert.ok(blocker.actionLabel.length > 0);
    assert.ok(blocker.requirement.length > 0);
    assert.ok(blocker.reason.length > 0);
  });

  it("T-ENT-09: profileId en access view === userId (H1)", () => {
    const view = resolveEntitlementsH1({
      user: fakeUser("abc-user"),
      subscriptions: [],
    });
    assert.equal(view.profileId, "abc-user");
    assert.equal(view.accountId, "abc-user");
    assert.equal(view.profileId, view.accountId);
  });

  it("T-ENT-10: expired no implica borrar progreso (grants solo)", () => {
    const expired = resolveEntitlementsH1({
      user: fakeUser(),
      subscriptions: [
        {
          id: "sub-e",
          status: SubscriptionStatus.ACTIVE,
          planId: "plan",
          endsAt: new Date("2020-01-01T00:00:00.000Z"),
        },
      ],
      now: new Date("2026-07-16T12:00:00.000Z"),
    });
    assert.equal(expired.billingStatus, "expired");
    assert.equal(expired.derecho.status, "EXPIRED");
    // Resolver solo cambia grants; no toca UserProgress (contrato §12).
    assert.equal(isMonthPlayable(expired.grants, 1), true);
  });

  it("T-ENT-06 note: authz solo servidor (grants.canStartPractice desde catálogo)", () => {
    assert.equal(PLAN_CATALOG_H1.demo.monthsPlayable.includes(1), true);
    assert.equal(PLAN_CATALOG_H1.subscriber.monthsPlayable.includes(5), false);
  });
});
