/**
 * P0-07 — Pagos + Entitlements H1 (servidor).
 *
 * Cuenta (User) paga · Perfil implícito aprende (profileId = userId).
 * Sin schema nuevo · sin proveedor real · premium OFF · comunidad OFF.
 *
 * Spec: joytunes-analysis/reportes/spec_P0_07_pagos_entitlements_H1.md
 */
import type { AccountTier, User } from "@prisma/client";
import { ApiError } from "./errors.js";
import { toAccountId, toProfileId } from "./learnerContextH1.js";
import {
  isActiveSubscriptionValid,
  resolveStudentAccess,
  type SubscriptionAccessRecord,
} from "./studentAccess.js";
import type { BlockerH1 } from "./rutaFtcDomainH1.js";

export type LibraryTierH1 = "none" | "basic" | "premium";
export type CatalogPlanIdH1 = "demo" | "trial" | "subscriber";

export type BillingStatusH1 =
  | "none"
  | "trial"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type AccessGrantsH1 = {
  monthsPlayable: number[];
  monthsVisible: number[];
  libraryTier: LibraryTierH1;
  /** MVP: siempre false (E6). */
  communityAccess: false;
  /** H1: siempre 1 (E7). */
  maxProfiles: 1;
  canStartPractice: boolean;
  features: {
    premiumLibrary: false;
    community: false;
  };
};

export type PlanSuscripcionH1 = {
  planId: CatalogPlanIdH1;
  commercialName: string;
  includedProfiles: 1;
  monthsPlayable: number[];
  monthsVisible: number[];
  libraryTier: LibraryTierH1;
  communityAccess: false;
  trialDays: number | null;
};

/** Catálogo conceptual MVP (no proveedor real). */
export const PLAN_CATALOG_H1: Record<CatalogPlanIdH1, PlanSuscripcionH1> = {
  demo: {
    planId: "demo",
    commercialName: "Demo",
    includedProfiles: 1,
    monthsPlayable: [1],
    monthsVisible: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    libraryTier: "basic",
    communityAccess: false,
    trialDays: null,
  },
  trial: {
    planId: "trial",
    commercialName: "Prueba",
    includedProfiles: 1,
    monthsPlayable: [1, 2],
    monthsVisible: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    libraryTier: "basic",
    communityAccess: false,
    trialDays: 7,
  },
  subscriber: {
    planId: "subscriber",
    commercialName: "Suscriptor",
    includedProfiles: 1,
    monthsPlayable: [1, 2],
    monthsVisible: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    libraryTier: "basic",
    communityAccess: false,
    trialDays: null,
  },
};

export type DerechoAccesoH1 = {
  id: string;
  accountId: string;
  profileScope: "account_default_h1";
  source: "purchase" | "trial" | "grant" | "demo";
  planId: CatalogPlanIdH1;
  grants: AccessGrantsH1;
  validFrom: string | null;
  validUntil: string | null;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
};

export type AccessViewH1 = {
  accountId: string;
  profileId: string;
  billingStatus: BillingStatusH1;
  catalogPlanId: CatalogPlanIdH1;
  grants: AccessGrantsH1;
  derecho: DerechoAccesoH1;
  /** Legacy Track A zone gate (ACTIVE subscription). */
  canAccessStudentZone: boolean;
  zoneReason: "ACTIVE_SUBSCRIPTION" | "NO_ACTIVE_SUBSCRIPTION";
  subscription: {
    status: "ACTIVE";
    planId: string;
    endsAt: string | null;
  } | null;
};

function months1to12(): number[] {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
}

export function grantsFromPlan(plan: PlanSuscripcionH1): AccessGrantsH1 {
  return {
    monthsPlayable: [...plan.monthsPlayable],
    monthsVisible: [...plan.monthsVisible],
    libraryTier: plan.libraryTier === "premium" ? "basic" : plan.libraryTier,
    communityAccess: false,
    maxProfiles: 1,
    canStartPractice: plan.monthsPlayable.length > 0,
    features: {
      premiumLibrary: false,
      community: false,
    },
  };
}

/**
 * Mapea planId Track A / strings conocidos → catálogo H1.
 * Sin provider: ACTIVE comercial ⇒ subscriber; trial ⇒ trial; resto ⇒ demo.
 */
export function mapTrackAPlanToCatalog(
  trackAPlanId: string | null | undefined,
  accountTier: AccountTier
): CatalogPlanIdH1 {
  const raw = (trackAPlanId ?? "").trim().toLowerCase();
  if (!raw) {
    return accountTier === "DEMO" ? "demo" : "demo";
  }
  if (raw === "trial" || raw.includes("trial")) return "trial";
  if (raw === "demo" || raw.endsWith("-demo")) return "demo";
  return "subscriber";
}

export function isMonthPlayable(grants: AccessGrantsH1, monthIndex: number): boolean {
  return grants.monthsPlayable.includes(monthIndex);
}

export function isMonthVisible(grants: AccessGrantsH1, monthIndex: number): boolean {
  return grants.monthsVisible.includes(monthIndex);
}

export function buildEntitlementBlocker(monthIndex: number): BlockerH1 & {
  code: "ENTITLEMENT";
  actionLabel: string;
  actionTarget: string;
} {
  return {
    code: "ENTITLEMENT",
    kind: "ENTITLEMENT",
    requirement: `Plan que incluye el Mes ${monthIndex}`,
    reason: `El Mes ${monthIndex} está visible en tu ruta, pero tu acceso actual no incluye práctica profunda en ese mes.`,
    action: "Ver planes para desbloquear más meses de práctica.",
    actionLabel: "Ver planes",
    actionTarget: "/#planes",
  };
}

/**
 * Resuelve DerechoAcceso / AccessGrants desde Subscription Track A + accountTier.
 * No llama proveedor de pago.
 */
export function resolveEntitlementsH1(input: {
  user: Pick<User, "id" | "accountTier">;
  subscriptions: SubscriptionAccessRecord[];
  now?: Date;
}): AccessViewH1 {
  const now = input.now ?? new Date();
  const accountId = toAccountId(input.user.id);
  const profileId = toProfileId(input.user.id);
  const zone = resolveStudentAccess(input.subscriptions, now);

  let catalogPlanId: CatalogPlanIdH1 = "demo";
  let billingStatus: BillingStatusH1 = "none";
  let source: DerechoAccesoH1["source"] = "demo";
  let validUntil: string | null = null;

  if (zone.subscription) {
    catalogPlanId = mapTrackAPlanToCatalog(zone.subscription.planId, input.user.accountTier);
    billingStatus = catalogPlanId === "trial" ? "trial" : "active";
    source = catalogPlanId === "trial" ? "trial" : "purchase";
    validUntil = zone.subscription.endsAt;
  } else {
    // Sin ACTIVE: demo grants (mapa visible; M1 jugable conceptual).
    // past_due / canceled vencido → demo (E10 simplificado).
    const anyPastDue = input.subscriptions.some((s) => s.status === "PAST_DUE");
    const anyCanceled = input.subscriptions.some((s) => s.status === "CANCELED");
    if (anyPastDue) billingStatus = "past_due";
    else if (anyCanceled) {
      const canceled = input.subscriptions.filter((s) => s.status === "CANCELED");
      const stillValid = canceled.find(
        (s) => s.endsAt !== null && s.endsAt.getTime() > now.getTime()
      );
      if (stillValid) {
        // T-ENT-07: canceled con validUntil futuro mantiene grants subscriber
        catalogPlanId = mapTrackAPlanToCatalog(stillValid.planId, input.user.accountTier);
        billingStatus = "canceled";
        source = "purchase";
        validUntil = stillValid.endsAt?.toISOString() ?? null;
      } else {
        billingStatus = "expired";
        catalogPlanId = "demo";
      }
    } else if (
      input.subscriptions.some(
        (s) =>
          s.status === "ACTIVE" &&
          s.endsAt !== null &&
          s.endsAt.getTime() <= now.getTime()
      )
    ) {
      billingStatus = "expired";
      catalogPlanId = "demo";
    } else {
      catalogPlanId = "demo";
      billingStatus = "none";
    }
  }

  // MVP force: never premium / community
  const plan = PLAN_CATALOG_H1[catalogPlanId];
  const grants = grantsFromPlan(plan);

  const derecho: DerechoAccesoH1 = {
    id: `derecho:${accountId}:${catalogPlanId}`,
    accountId,
    profileScope: "account_default_h1",
    source,
    planId: catalogPlanId,
    grants,
    validFrom: null,
    validUntil,
    status: billingStatus === "expired" ? "EXPIRED" : "ACTIVE",
  };

  return {
    accountId,
    profileId,
    billingStatus,
    catalogPlanId,
    grants,
    derecho,
    canAccessStudentZone: zone.canAccessStudentZone,
    zoneReason: zone.reason,
    subscription: zone.subscription,
  };
}

/** E3: StartPractice exige monthIndex ∈ monthsPlayable. */
export function assertMonthPlayableForPractice(
  view: AccessViewH1,
  monthIndex: number
): void {
  if (!Number.isInteger(monthIndex) || monthIndex < 1 || monthIndex > 12) {
    throw new ApiError(400, "VALIDATION_ERROR", "monthIndex inválido.");
  }
  if (!isMonthPlayable(view.grants, monthIndex)) {
    const blocker = buildEntitlementBlocker(monthIndex);
    throw new ApiError(403, "ENTITLEMENT", blocker.reason);
  }
}

export function assertProfileMatchesAccountH1(accountId: string, profileId: string): void {
  if (profileId !== accountId) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "H1: profileId debe coincidir con accountId (userId)."
    );
  }
}

/** Helper tests / PathView: monthsVisible siempre 1..12 en MVP catalog. */
export function mvpVisibleMonths(): number[] {
  return months1to12();
}

// Re-export for canceled-until validity checks without ACTIVE status
export { isActiveSubscriptionValid };
