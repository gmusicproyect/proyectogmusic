/**
 * PD-5 — enforcement de entitlements en endpoints privados H1 (R-002).
 *
 * Verifica la semántica de la policy tal como la cablean los servicios de
 * práctica (start + complete H1): requisito `{ requireZone, allowDemoGrant,
 * monthIndex }` sobre `AccessViewH1` reales de `resolveEntitlementsH1`.
 *
 * Contrato clave: DEMO (sin ACTIVE) sigue pudiendo practicar el mes jugable
 * vía grant (`canStartPractice`), sin abrir premium ni comunidad.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AccountTier, SubscriptionStatus } from "@prisma/client";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";
import {
  assertStudentLearningAccess,
  evaluateStudentLearningAccess,
} from "../lib/entitlementsPolicyH1.js";
import { ApiError } from "../lib/errors.js";

/** Requisito exacto que cablean lessonSessionService y practiceLifecycleH1Service. */
function practiceRequirement(monthIndex: number) {
  return { requireZone: true, allowDemoGrant: true, monthIndex } as const;
}

function demoView() {
  return resolveEntitlementsH1({
    user: { id: "u-demo", accountTier: AccountTier.DEMO },
    subscriptions: [],
  });
}

function subscriberView() {
  return resolveEntitlementsH1({
    user: { id: "u-sub", accountTier: AccountTier.DEMO },
    subscriptions: [
      {
        id: "sub-1",
        status: SubscriptionStatus.ACTIVE,
        planId: "gmusic-semester-6-months",
        endsAt: null,
      },
    ],
  });
}

describe("PD-5 · enforcement entitlements práctica H1 (R-002)", () => {
  it("T-PD5-01: DEMO sin ACTIVE practica mes jugable vía grant (no zona)", () => {
    const view = demoView();
    assert.equal(view.canAccessStudentZone, false);
    assert.equal(view.grants.canStartPractice, true);
    // No lanza: allowDemoGrant cubre la ausencia de zona.
    assert.doesNotThrow(() => assertStudentLearningAccess(view, practiceRequirement(1)));
    const decision = evaluateStudentLearningAccess(view, practiceRequirement(1));
    assert.equal(decision.allowed, true);
  });

  it("T-PD5-02: DEMO mes no jugable → 403 ENTITLEMENT", () => {
    const view = demoView();
    assert.throws(
      () => assertStudentLearningAccess(view, practiceRequirement(2)),
      (err: unknown) =>
        err instanceof ApiError && err.status === 403 && err.code === "ENTITLEMENT"
    );
  });

  it("T-PD5-03: sin allowDemoGrant, DEMO sin zona → NO_ZONE (403 ENTITLEMENT)", () => {
    const view = demoView();
    const decision = evaluateStudentLearningAccess(view, {
      requireZone: true,
      monthIndex: 1,
    });
    assert.equal(decision.allowed, false);
    assert.equal(
      decision.allowed === false && decision.denial.reasonCode,
      "NO_ZONE"
    );
    assert.throws(
      () => assertStudentLearningAccess(view, { requireZone: true, monthIndex: 1 }),
      (err: unknown) =>
        err instanceof ApiError && err.status === 403 && err.code === "ENTITLEMENT"
    );
  });

  it("T-PD5-04: suscriptor ACTIVE practica meses de su plan", () => {
    const view = subscriberView();
    assert.equal(view.canAccessStudentZone, true);
    assert.doesNotThrow(() => assertStudentLearningAccess(view, practiceRequirement(1)));
    assert.doesNotThrow(() => assertStudentLearningAccess(view, practiceRequirement(2)));
  });

  it("T-PD5-05: suscriptor tampoco practica mes fuera de plan → 403 ENTITLEMENT", () => {
    const view = subscriberView();
    assert.throws(
      () => assertStudentLearningAccess(view, practiceRequirement(5)),
      (err: unknown) =>
        err instanceof ApiError && err.status === 403 && err.code === "ENTITLEMENT"
    );
  });

  it("T-PD5-06: monthIndex inválido → 400 VALIDATION_ERROR (no ENTITLEMENT)", () => {
    const view = demoView();
    for (const bad of [0, 13, 1.5]) {
      assert.throws(
        () => assertStudentLearningAccess(view, practiceRequirement(bad)),
        (err: unknown) =>
          err instanceof ApiError &&
          err.status === 400 &&
          err.code === "VALIDATION_ERROR"
      );
    }
  });

  it("T-PD5-07: policy no abre premium ni comunidad (grants MVP force-OFF)", () => {
    for (const view of [demoView(), subscriberView()]) {
      assert.equal(view.grants.communityAccess, false);
      assert.equal(view.grants.features.premiumLibrary, false);
      assert.notEqual(view.grants.libraryTier, "premium");
    }
  });
});
