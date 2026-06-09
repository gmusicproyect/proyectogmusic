import { SubscriptionStatus } from "@prisma/client";

export type StudentAccessReason = "ACTIVE_SUBSCRIPTION" | "NO_ACTIVE_SUBSCRIPTION";

export interface SubscriptionAccessRecord {
  id: string;
  status: SubscriptionStatus;
  planId: string;
  endsAt: Date | null;
}

export interface ResolvedSubscriptionAccess {
  status: "ACTIVE";
  planId: string;
  endsAt: string | null;
}

export interface StudentAccessResolution {
  canAccessStudentZone: boolean;
  reason: StudentAccessReason;
  subscription: ResolvedSubscriptionAccess | null;
}

export function isActiveSubscriptionValid(
  subscription: SubscriptionAccessRecord,
  now: Date
): boolean {
  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    return false;
  }

  if (subscription.endsAt !== null && subscription.endsAt.getTime() <= now.getTime()) {
    return false;
  }

  return true;
}

/**
 * Selecciona la suscripción ACTIVE vigente con el vencimiento válido más lejano.
 * `endsAt` null se trata como sin vencimiento (prioridad sobre fechas finitas).
 * Desempate determinístico por `id` ascendente.
 */
export function selectBestActiveSubscription(
  subscriptions: SubscriptionAccessRecord[],
  now: Date = new Date()
): SubscriptionAccessRecord | null {
  const valid = subscriptions.filter((subscription) =>
    isActiveSubscriptionValid(subscription, now)
  );

  if (valid.length === 0) {
    return null;
  }

  const sorted = [...valid].sort(compareSubscriptionsForSelection);
  return sorted[0] ?? null;
}

function compareSubscriptionsForSelection(
  a: SubscriptionAccessRecord,
  b: SubscriptionAccessRecord
): number {
  if (a.endsAt === null && b.endsAt === null) {
    return a.id.localeCompare(b.id);
  }
  if (a.endsAt === null) {
    return -1;
  }
  if (b.endsAt === null) {
    return 1;
  }

  const byEndsAt = b.endsAt.getTime() - a.endsAt.getTime();
  if (byEndsAt !== 0) {
    return byEndsAt;
  }

  return a.id.localeCompare(b.id);
}

export function resolveStudentAccess(
  subscriptions: SubscriptionAccessRecord[],
  now: Date = new Date()
): StudentAccessResolution {
  const selected = selectBestActiveSubscription(subscriptions, now);

  if (!selected) {
    return {
      canAccessStudentZone: false,
      reason: "NO_ACTIVE_SUBSCRIPTION",
      subscription: null,
    };
  }

  return {
    canAccessStudentZone: true,
    reason: "ACTIVE_SUBSCRIPTION",
    subscription: {
      status: "ACTIVE",
      planId: selected.planId,
      endsAt: selected.endsAt?.toISOString() ?? null,
    },
  };
}
