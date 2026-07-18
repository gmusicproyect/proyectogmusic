/**
 * PD-4 — integración durable de Biblioteca (requiere Postgres local + GMUSIC_H1_DURABLE=1).
 * Sin flag / sin DB → suite skipped. Seed idempotente + lectura vía bridge.
 */
import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { AccountTier, Role } from "@prisma/client";
import { isH1DurableEnabled } from "../lib/h1DurableFlag.js";
import { buildMvpLibraryCatalogFixtureH1 } from "../lib/libraryH1.js";
import type { LearnerContextH1 } from "../lib/learnerContextH1.js";
import {
  buildLibraryItemDetailH1Async,
  buildLibraryViewH1Async,
  resolveLibraryCatalogH1,
} from "../lib/libraryCatalogBridge.js";
import { seedLibraryCatalogH1 } from "../lib/librarySeedH1.js";
import { resolveEntitlementsH1 } from "../lib/entitlementsH1.js";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { hasDatabase } from "./helpers/db.js";

const durableOn = isH1DurableEnabled();
const suite = hasDatabase && durableOn ? describe : describe.skip;

const PROFILE = "user-pd4-biblio";

function context(overrides: Partial<LearnerContextH1> = {}): LearnerContextH1 {
  return {
    accountId: PROFILE,
    profileId: PROFILE,
    email: "pd4@gmusic.test",
    displayName: "Alumno PD-4",
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

const fixture = buildMvpLibraryCatalogFixtureH1();
const publishedIds = fixture
  .filter((r) => r.status === "PUBLISHED")
  .map((r) => r.id);

suite("PD-4 Persistencia Durable H1 — Biblioteca (GMUSIC_H1_DURABLE=1)", () => {
  before(async () => {
    assert.equal(isH1DurableEnabled(), true, "flag debe estar ON");
    await seedLibraryCatalogH1(prisma);
  });

  after(async () => {
    const ids = fixture.map((r) => r.id);
    await prisma.libraryResourceLink.deleteMany({
      where: { resourceId: { in: ids } },
    });
    await prisma.libraryResource.deleteMany({ where: { id: { in: ids } } });
  });

  it("T-PD4-INT-01: catálogo durable = solo PUBLISHED, fuente db", async () => {
    const { catalog, source } = await resolveLibraryCatalogH1("guitarra");
    assert.equal(source, "db");
    const ids = catalog.map((r) => r.id).sort();
    assert.deepEqual(ids, [...publishedIds].sort());
    assert.ok(!ids.includes("lib:guitarra:m06:draft-no-visible"));
    assert.ok(!ids.includes("lib:guitarra:legacy:archivado"));
  });

  it("T-PD4-INT-02: LibraryViewH1 desde DB — meta.catalogSource=db, premium locked", async () => {
    const view = await buildLibraryViewH1Async({
      context: context(),
      grants: basicGrants(),
    });
    assert.equal(view.meta.catalogSource, "db");
    assert.equal(view.meta.premiumEnabled, false);
    assert.equal(view.profileId, PROFILE);

    const premium = view.items.filter((i) => i.accessTier === "premium");
    for (const item of premium) {
      assert.equal(item.viewState, "locked");
      assert.equal(item.blocker?.code, "ENTITLEMENT");
    }
    const ids = view.items.map((i) => i.id);
    assert.ok(!ids.includes("lib:guitarra:m06:draft-no-visible"));
    assert.ok(!ids.includes("lib:guitarra:legacy:archivado"));
  });

  it("T-PD4-INT-03: seed idempotente — re-ejecutar no cambia counts", async () => {
    const before1 = await prisma.libraryResource.count();
    const links1 = await prisma.libraryResourceLink.count();
    await seedLibraryCatalogH1(prisma);
    const before2 = await prisma.libraryResource.count();
    const links2 = await prisma.libraryResourceLink.count();
    assert.equal(before1, before2);
    assert.equal(links1, links2);
  });

  it("T-PD4-INT-04: detalle durable — premium locked; DRAFT → 404", async () => {
    const detail = await buildLibraryItemDetailH1Async({
      context: context(),
      grants: basicGrants(),
      resourceId: "lib:guitarra:m01:cancion-simple-1",
    });
    assert.equal(detail.viewState, "locked");
    assert.equal(detail.blocker?.code, "ENTITLEMENT");

    await assert.rejects(
      () =>
        buildLibraryItemDetailH1Async({
          context: context(),
          grants: basicGrants(),
          resourceId: "lib:guitarra:m06:draft-no-visible",
        }),
      (err: unknown) => err instanceof ApiError && err.status === 404
    );
  });

  it("T-PD4-INT-05: links reconstruyen tarjetaIds/unitIds del fixture publicado", async () => {
    const { catalog } = await resolveLibraryCatalogH1("guitarra");
    const byId = new Map(catalog.map((r) => [r.id, r]));
    for (const resource of fixture.filter((r) => r.status === "PUBLISHED")) {
      const durable = byId.get(resource.id);
      assert.ok(durable);
      assert.deepEqual(
        [...durable!.tarjetaIds].sort(),
        [...resource.tarjetaIds].sort()
      );
      assert.deepEqual([...durable!.unitIds].sort(), [...resource.unitIds].sort());
    }
  });
});
