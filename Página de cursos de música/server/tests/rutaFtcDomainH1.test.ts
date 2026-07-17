import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildMvpRutaGuitarraFundamentosFixture,
  buildOrderBlocker,
  canOpenCardSlot,
  ftcSlotName,
  resolveActivePlacementH1,
  resolveLegacyStubUnitId,
  unitCompletionAfterCards,
  validateFtcSlots,
  validateRutaForPublish,
  validateRutaHas12Months,
  validateUnidadHas5Cards,
  type FtcSlot,
  type UnidadFTC,
} from "../lib/rutaFtcDomainH1.js";
import {
  FTC_SLOT_TO_STAGE_TYPE,
  ftcNameForStageType,
  stageTypeForFtcSlot,
} from "../lib/rutaFtcTrackABridge.js";
import { StageType } from "@prisma/client";

const appRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("P0-03 Ruta 12m + FTC dominio H1", () => {
  it("T-R12-01: Ruta válida tiene months 1..12", () => {
    const ruta = buildMvpRutaGuitarraFundamentosFixture();
    const v = validateRutaHas12Months(ruta);
    assert.equal(v.ok, true);
    assert.deepEqual(
      ruta.months.map((m) => m.monthIndex),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    );
  });

  it("T-R12-02: Publish ruta con 11 meses → rechazado", () => {
    const ruta = buildMvpRutaGuitarraFundamentosFixture();
    ruta.months = ruta.months.slice(0, 11);
    const v = validateRutaHas12Months(ruta);
    assert.equal(v.ok, false);
    if (!v.ok) assert.equal(v.code, "V-R12");
  });

  it("T-FTC-01: Unidad con 4 tarjetas → no publish", () => {
    const ruta = buildMvpRutaGuitarraFundamentosFixture();
    const unit = structuredClone(ruta.months[0].units[0]);
    unit.cards = unit.cards.slice(0, 4);
    const v = validateUnidadHas5Cards(unit);
    assert.equal(v.ok, false);
    if (!v.ok) assert.equal(v.code, "V-U5");
  });

  it("T-FTC-02: Unidad con 5 slots Fundamento…Crea/Toca → OK", () => {
    const ruta = buildMvpRutaGuitarraFundamentosFixture();
    const unit = ruta.months[0].units[0];
    const v = validateFtcSlots(unit);
    assert.equal(v.ok, true);
    assert.deepEqual(
      unit.cards.map((c) => c.typeName),
      ["Fundamento", "Forma", "Pulso", "Práctica", "Crea/Toca"]
    );
  });

  it("T-FTC-03: Slot duplicado → rechazado", () => {
    const ruta = buildMvpRutaGuitarraFundamentosFixture();
    const unit: UnidadFTC = structuredClone(ruta.months[0].units[0]);
    unit.cards[1].slot = 1;
    unit.cards[1].typeName = "Fundamento";
    const v = validateFtcSlots(unit);
    assert.equal(v.ok, false);
    if (!v.ok) assert.equal(v.code, "V-SLOT");
  });

  it("T-DEP-01: M1–M2 deep; M3+ summary en fixture MVP", () => {
    const ruta = buildMvpRutaGuitarraFundamentosFixture();
    assert.equal(ruta.months[0].depth, "deep");
    assert.equal(ruta.months[1].depth, "deep");
    for (let i = 2; i < 12; i++) {
      assert.equal(ruta.months[i].depth, "summary");
    }
    assert.equal(validateRutaForPublish(ruta).ok, true);
  });

  it("T-ADV-01: No abrir c2 si c1 incompleta", () => {
    const done = new Set<FtcSlot>();
    assert.equal(canOpenCardSlot(done, 1), true);
    assert.equal(canOpenCardSlot(done, 2), false);
    done.add(1);
    assert.equal(canOpenCardSlot(done, 2), true);
  });

  it("T-ADV-02: 5/5 → unidad completed → u02 available", () => {
    const done = new Set<FtcSlot>([1, 2, 3, 4, 5]);
    const result = unitCompletionAfterCards(done);
    assert.equal(result.unitCompleted, true);
    assert.equal(result.nextUnitAvailable, true);
  });

  it("T-ONB-01: currentMonth=1 → active mes m01; first unit u01", () => {
    const placement = resolveActivePlacementH1({
      profileId: "user-1",
      userId: "user-1",
      currentMonth: 1,
    });
    assert.equal(
      placement.activeMesId,
      "ruta:guitarra-fundamentos:v1/m01"
    );
    assert.equal(
      placement.firstUnitId,
      "ruta:guitarra-fundamentos:v1/m01/u01"
    );
    assert.equal(
      placement.firstCardId,
      "ruta:guitarra-fundamentos:v1/m01/u01/c1"
    );
  });

  it("T-H1-01: Progreso evaluado con profileId=userId", () => {
    assert.throws(() =>
      resolveActivePlacementH1({
        profileId: "other",
        userId: "user-1",
        currentMonth: 1,
      })
    );
    const ok = resolveActivePlacementH1({
      profileId: "user-1",
      userId: "user-1",
      currentMonth: 2,
    });
    assert.equal(ok.profileId, "user-1");
  });

  it("T-BLK-01: Locked expone requisito+razón+acción", () => {
    const blocker = buildOrderBlocker(ftcSlotName(1));
    assert.equal(blocker.kind, "ORDER");
    assert.ok(blocker.requirement.includes("Fundamento"));
    assert.ok(blocker.reason.length > 0);
    assert.ok(blocker.action.length > 0);
  });

  it("T-NOSEED: esta fase no introduce archivos seed/JSON de contenido", () => {
    assert.equal(existsSync(join(appRoot, "prisma/seed-ruta-ftc.ts")), false);
    assert.equal(existsSync(join(appRoot, "server/fixtures/ruta-ftc.json")), false);
    assert.equal(existsSync(join(appRoot, "seeds/guitarra-fundamentos.json")), false);
  });

  it("bridge: StageType legacy ↔ slot FTC canónico", () => {
    assert.equal(stageTypeForFtcSlot(1), StageType.FUNDAMENTO_UNO);
    assert.equal(ftcNameForStageType(StageType.TOCAR), "Crea/Toca");
    assert.equal(FTC_SLOT_TO_STAGE_TYPE[2], StageType.FUNDAMENTO_DOS);
  });

  it("legacy stubs m{N}-u1 resuelven a IDs canónicos", () => {
    assert.equal(
      resolveLegacyStubUnitId("m1-u1"),
      "ruta:guitarra-fundamentos:v1/m01/u01"
    );
  });
});
