import type { User } from "@prisma/client";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";
import { prisma } from "../lib/prisma.js";

/**
 * P0-07 AccessViewH1 + contrato legacy `/me/access`.
 * Cuenta paga / Perfil aprende; sin provider real.
 */
export async function buildAccessResponse(student: User) {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: student.id },
    select: {
      id: true,
      status: true,
      planId: true,
      endsAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const view = resolveEntitlementsH1({
    user: student,
    subscriptions,
  });

  return {
    user: {
      id: student.id,
      name: student.name,
      email: student.email,
    },
    /** Legacy zone gate (ACTIVE subscription). */
    access: {
      canAccessStudentZone: view.canAccessStudentZone,
      reason: view.zoneReason,
    },
    subscription: view.subscription,
    /** P0-07 AccessViewH1 — única fuente de authz pedagógica. */
    entitlements: {
      accountId: view.accountId,
      profileId: view.profileId,
      billingStatus: view.billingStatus,
      catalogPlanId: view.catalogPlanId,
      grants: view.grants,
      derecho: view.derecho,
    },
  };
}
