import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AccountTier, Role, SubscriptionStatus } from "@prisma/client";
import {
  buildLibraryItemDetailH1,
  buildLibraryViewH1,
  buildMvpLibraryCatalogFixtureH1,
  parseLibraryQueryH1,
  type LibraryViewH1,
} from "../lib/libraryH1.js";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";
import type { LearnerContextH1 } from "../lib/learnerContextH1.js";
import { ApiError } from "../lib/errors.js";
import {
  clearPracticeEventsH1,
  getPracticeProjectionH1,
} from "../lib/practiceEventsH1.js";

const PROFILE = "user-biblio";

function context(overrides: Partial<LearnerContextH1> = {}): LearnerContextH1 {
  return {
    accountId: PROFILE,
    profileId: PROFILE,
    email: "biblio@gmusic.test",
    displayName: "Alumno Biblioteca",
    role: Role.STUDENT,
    accountTier: AccountTier.DEMO,
    instrument: "guitarra",
    currentMonth: 1,
    weeklyGoalMinutes: 90,
    activeRutaSlug: "guitarra-fundamentos",
    activeRutaVersion: 1,
    onboardingCompleted: true,
    firstUnitId: "ruta:guitarra-fundamentos:v1/m01/u01",
    nextCardId: "ruta:guitarra-fundamentos:v1/m01/u01/c1",
    learningGoal: "play_songs",
    ...overrides,
  };
}

function basicGrants() {
  return resolveEntitlementsH1({
    user: { id: PROFILE, accountTier: AccountTier.DEMO },
    subscriptions: [],
  }).grants;
}

function subscriberGrants() {
  return resolveEntitlementsH1({
    user: { id: PROFILE, accountTier: AccountTier.DEMO },
    subscriptions: [
      {
        id: "sub-biblio",
        status: SubscriptionStatus.ACTIVE,
        planId: "gmusic-semester-6-months",
        endsAt: null,
      },
    ],
  }).grants;
}

function build(
  overrides: Partial<LearnerContextH1> = {},
  opts: {
    grants?: ReturnType<typeof basicGrants>;
    filters?: Parameters<typeof buildLibraryViewH1>[0]["filters"];
  } = {}
): LibraryViewH1 {
  return buildLibraryViewH1({
    context: context(overrides),
    grants: opts.grants ?? basicGrants(),
    filters: opts.filters,
  });
}

describe("P0-08 LibraryViewH1 / Biblioteca básica backend", () => {
  it("T-LIB-01: library profileId === userId", () => {
    const view = build();
    assert.equal(view.profileId, PROFILE);
    assert.equal(view.meta.catalogSource, "memory_fixture_h1");
    assert.equal(view.meta.premiumEnabled, false);
  });

  it("T-LIB-02: basic + grant basic → available/recommended", () => {
    const view = build();
    const basicItems = view.items.filter((i) => i.accessTier === "basic");
    assert.ok(basicItems.length > 0);
    for (const item of basicItems) {
      assert.ok(item.viewState === "available" || item.viewState === "recommended");
      assert.equal(item.blocker, null);
    }
  });

  it("T-LIB-03: premium + grant basic → locked + blocker ENTITLEMENT", () => {
    const view = build();
    const premium = view.items.filter((i) => i.accessTier === "premium");
    assert.ok(premium.length > 0);
    for (const item of premium) {
      assert.equal(item.viewState, "locked");
      assert.equal(item.blocker?.code, "ENTITLEMENT");
      assert.equal(item.blocker?.actionTarget, "/#planes");
    }
  });

  it("T-LIB-03b: subscriber tampoco abre premium (MVP premium OFF)", () => {
    const view = build({}, { grants: subscriberGrants() });
    const premium = view.items.filter((i) => i.accessTier === "premium");
    assert.ok(premium.length > 0);
    for (const item of premium) {
      assert.equal(item.viewState, "locked");
    }
  });

  it("T-LIB-04: grant none → listado vacío + empty NO_LIBRARY_ACCESS", () => {
    const grants = { ...basicGrants(), libraryTier: "none" as const };
    const view = build({}, { grants });
    assert.equal(view.items.length, 0);
    assert.equal(view.emptyState?.code, "NO_LIBRARY_ACCESS");
    assert.equal(view.emptyState?.ctaTarget, "/mi-camino");
  });

  it("T-LIB-05: default filter → suggestedMonth ∈ {m-1, m, m+1} (mes actual)", () => {
    const view = build({ currentMonth: 2 });
    assert.deepEqual(view.filtersApplied?.monthWindow, [1, 2, 3]);
    assert.equal(view.filtersApplied?.month, 2);
    for (const item of view.items) {
      assert.ok(item.suggestedMonth === null || item.suggestedMonth === 2);
    }
    // mes fuera de política → 400
    assert.throws(
      () => build({ currentMonth: 1 }, { filters: { month: 5 } }),
      (err: unknown) => err instanceof ApiError && err.status === 400
    );
  });

  it("T-LIB-06: locked no se bypasa — detalle premium sigue locked", () => {
    const premiumId = "lib:guitarra:m01:cancion-simple-1";
    const detail = buildLibraryItemDetailH1({
      context: context(),
      grants: basicGrants(),
      resourceId: premiumId,
    });
    assert.equal(detail.viewState, "locked");
    assert.equal(detail.blocker?.code, "ENTITLEMENT");
    // grant none → 403 en detalle
    assert.throws(
      () =>
        buildLibraryItemDetailH1({
          context: context(),
          grants: { ...basicGrants(), libraryTier: "none" },
          resourceId: premiumId,
        }),
      (err: unknown) => err instanceof ApiError && err.status === 403
    );
  });

  it("T-LIB-07: ver recurso ≠ ftc_card_completed (no toca proyección P0-05)", () => {
    clearPracticeEventsH1();
    build();
    buildLibraryItemDetailH1({
      context: context(),
      grants: basicGrants(),
      resourceId: "lib:guitarra:m01:postura-checklist",
    });
    const projection = getPracticeProjectionH1(PROFILE);
    assert.equal(projection.completedCards.length, 0);
    assert.equal(projection.completedUnits.length, 0);
  });

  it("T-LIB-08: Camino sigue siendo CTA primario en empty states", () => {
    const onboarding = build({
      onboardingCompleted: false,
      currentMonth: null,
      instrument: null,
    });
    assert.equal(onboarding.emptyState?.code, "ONBOARDING");
    assert.equal(onboarding.emptyState?.ctaLabel, "Ir a Mi Camino");
    assert.equal(onboarding.emptyState?.ctaTarget, "/mi-camino");
    assert.equal(onboarding.items.length, 0);
  });

  it("T-LIB-09: sin community links en library MVP", () => {
    const view = build();
    const json = JSON.stringify(view).toLowerCase();
    assert.equal(json.includes("community"), false);
    assert.equal(json.includes("comunidad"), false);
  });

  it("DRAFT y ARCHIVED nunca visibles al alumno", () => {
    const view = build();
    const ids = view.items.map((i) => i.id);
    assert.ok(!ids.includes("lib:guitarra:m06:draft-no-visible"));
    assert.ok(!ids.includes("lib:guitarra:legacy:archivado"));
    // detalle de DRAFT → 404
    assert.throws(
      () =>
        buildLibraryItemDetailH1({
          context: context(),
          grants: basicGrants(),
          resourceId: "lib:guitarra:m06:draft-no-visible",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 404
    );
  });

  it("filtros type/skill/level + parseo query", () => {
    const parsed = parseLibraryQueryH1({
      month: "1",
      type: "exercise",
      skillKey: "Ritmo",
      level: "beginner",
    });
    assert.deepEqual(parsed, {
      month: 1,
      type: "exercise",
      skillKey: "Ritmo",
      level: "beginner",
    });
    const view = build({}, { filters: parsed });
    assert.ok(view.items.every((i) => i.type === "exercise"));
    assert.throws(
      () => parseLibraryQueryH1({ type: "podcast" }),
      (err: unknown) => err instanceof ApiError && err.status === 400
    );
    assert.throws(
      () => parseLibraryQueryH1({ month: "13" }),
      (err: unknown) => err instanceof ApiError && err.status === 400
    );
  });

  it("catálogo fixture: sin mediaRef real (placeholder null)", () => {
    for (const resource of buildMvpLibraryCatalogFixtureH1()) {
      assert.equal(resource.mediaRef, null);
    }
  });
});
