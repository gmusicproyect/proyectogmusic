/**
 * P0-03 — Dominio RutaAnual 12m + UnidadFTC × 5 TarjetaFTC (H1).
 *
 * Nombres FTC fijos: Fundamento · Forma · Pulso · Práctica · Crea/Toca
 * Sin schema · sin seeds DB · sin tabla Profile.
 * Progreso (cuando exista) se evalúa con profileId = userId (D-DOM-001).
 *
 * Spec: joytunes-analysis/reportes/spec_P0_03_ruta_12m_ftc_dominio_H1.md
 */

export type PublishStatusDomain = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type MonthDepth = "deep" | "summary";
export type LearnerItemStatus =
  | "locked"
  | "available"
  | "active"
  | "completed"
  | "recommended";

/** Nombres canónicos aprobados — no renombrar. */
export const FTC_SLOT_NAMES = [
  "Fundamento",
  "Forma",
  "Pulso",
  "Práctica",
  "Crea/Toca",
] as const;

export type FtcSlotName = (typeof FTC_SLOT_NAMES)[number];
export type FtcSlot = 1 | 2 | 3 | 4 | 5;

export const RUTA_GUITARRA_FUNDAMENTOS_SLUG = "guitarra-fundamentos";
export const RUTA_MVP_VERSION = 1;

export type TarjetaFTC = {
  id: string;
  unidadId: string;
  slot: FtcSlot;
  typeName: FtcSlotName;
  objective: string;
  primarySkill: string;
  estimatedMinutes: number;
  completionCriteria: string;
  resourceRef: string | null;
  status: PublishStatusDomain;
};

export type UnidadFTC = {
  id: string;
  mesRutaId: string;
  order: number;
  title: string;
  isElective: boolean;
  primarySkill: string;
  status: PublishStatusDomain;
  cards: TarjetaFTC[];
};

export type MesRuta = {
  id: string;
  rutaId: string;
  monthIndex: number; // 1..12
  nameInternal: string;
  objective: string;
  depth: MonthDepth;
  requiredUnitCount: number;
  status: PublishStatusDomain;
  units: UnidadFTC[];
};

export type RutaAnual = {
  id: string;
  slug: string;
  version: number;
  instrument: "guitarra";
  title: string;
  description: string;
  monthCount: 12;
  status: PublishStatusDomain;
  months: MesRuta[];
};

export type BlockerH1 = {
  requirement: string;
  reason: string;
  action: string;
  kind: "ORDER" | "MONTH" | "DEPTH" | "ENTITLEMENT" | "ONBOARDING";
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** IDs canónicos dominio (reemplazan stubs temporales m{N}-u1*). */
export function rutaIdOf(slug: string, version: number): string {
  return `ruta:${slug}:v${version}`;
}

export function mesIdOf(rutaId: string, monthIndex: number): string {
  return `${rutaId}/m${pad2(monthIndex)}`;
}

export function unidadIdOf(mesId: string, unitOrder: number): string {
  return `${mesId}/u${pad2(unitOrder)}`;
}

export function tarjetaIdOf(unidadId: string, slot: FtcSlot): string {
  return `${unidadId}/c${slot}`;
}

export function ftcSlotName(slot: FtcSlot): FtcSlotName {
  return FTC_SLOT_NAMES[slot - 1];
}

/** Depth MVP: M1–M2 deep; M3–12 summary. */
export function monthDepthMvp(monthIndex: number): MonthDepth {
  return monthIndex <= 2 ? "deep" : "summary";
}

/**
 * Alias de transición: stubs P0-02 `m{N}-u1` → ID canónico dominio.
 * Temporal hasta que consumidores usen solo IDs canónicos.
 */
export function resolveLegacyStubUnitId(
  stubOrCanonical: string,
  slug = RUTA_GUITARRA_FUNDAMENTOS_SLUG,
  version = RUTA_MVP_VERSION
): string {
  const legacy = /^m(\d+)-u(\d+)$/i.exec(stubOrCanonical);
  if (!legacy) return stubOrCanonical;
  const month = Number(legacy[1]);
  const unit = Number(legacy[2]);
  const rutaId = rutaIdOf(slug, version);
  return unidadIdOf(mesIdOf(rutaId, month), unit);
}

export function resolveLegacyStubCardId(
  stubOrCanonical: string,
  slug = RUTA_GUITARRA_FUNDAMENTOS_SLUG,
  version = RUTA_MVP_VERSION
): string {
  const legacy = /^m(\d+)-u(\d+)-fundamento$/i.exec(stubOrCanonical);
  if (!legacy) return stubOrCanonical;
  const month = Number(legacy[1]);
  const unit = Number(legacy[2]);
  const unidadId = unidadIdOf(mesIdOf(rutaIdOf(slug, version), month), unit);
  return tarjetaIdOf(unidadId, 1);
}

// ─── Validadores publish (V-R12 / V-U5 / V-SLOT / V-CARD / V-DEPTH) ───

export function validateRutaHas12Months(ruta: RutaAnual): ValidationResult {
  if (ruta.monthCount !== 12 || ruta.months.length !== 12) {
    return {
      ok: false,
      code: "V-R12",
      message: "RutaAnual publish requiere exactamente 12 MesRuta.",
    };
  }
  const indexes = ruta.months.map((m) => m.monthIndex).sort((a, b) => a - b);
  for (let i = 0; i < 12; i++) {
    if (indexes[i] !== i + 1) {
      return {
        ok: false,
        code: "V-R12",
        message: "MesRuta debe cubrir monthIndex 1..12 sin huecos ni duplicados.",
      };
    }
  }
  return { ok: true };
}

export function validateUnidadHas5Cards(unit: UnidadFTC): ValidationResult {
  if (unit.cards.length !== 5) {
    return {
      ok: false,
      code: "V-U5",
      message: "UnidadFTC publish requiere exactamente 5 TarjetaFTC.",
    };
  }
  return { ok: true };
}

export function validateFtcSlots(unit: UnidadFTC): ValidationResult {
  const u5 = validateUnidadHas5Cards(unit);
  if (!u5.ok) return u5;

  const slots = unit.cards.map((c) => c.slot);
  if (new Set(slots).size !== 5) {
    return {
      ok: false,
      code: "V-SLOT",
      message: "Slots 1..5 deben ser únicos en la UnidadFTC.",
    };
  }
  for (const card of unit.cards) {
    if (card.slot < 1 || card.slot > 5) {
      return { ok: false, code: "V-SLOT", message: "Slot fuera de 1..5." };
    }
    const expected = ftcSlotName(card.slot);
    if (card.typeName !== expected) {
      return {
        ok: false,
        code: "V-SLOT",
        message: `Slot ${card.slot} debe llamarse "${expected}", no "${card.typeName}".`,
      };
    }
  }
  return { ok: true };
}

export function validateTarjetaFields(card: TarjetaFTC): ValidationResult {
  if (
    !card.objective.trim() ||
    !card.primarySkill.trim() ||
    !card.completionCriteria.trim() ||
    !(card.estimatedMinutes > 0)
  ) {
    return {
      ok: false,
      code: "V-CARD",
      message:
        "TarjetaFTC requiere objective, primarySkill, completionCriteria y estimatedMinutes > 0.",
    };
  }
  return { ok: true };
}

export function validateMonthDepthMvp(month: MesRuta): ValidationResult {
  const expected = monthDepthMvp(month.monthIndex);
  if (month.depth !== expected) {
    return {
      ok: false,
      code: "V-DEPTH",
      message: `Mes ${month.monthIndex} MVP debe ser depth=${expected}.`,
    };
  }
  return { ok: true };
}

export function validateUnidadForPublish(unit: UnidadFTC): ValidationResult {
  const slots = validateFtcSlots(unit);
  if (!slots.ok) return slots;
  for (const card of unit.cards) {
    const cardOk = validateTarjetaFields(card);
    if (!cardOk.ok) return cardOk;
  }
  return { ok: true };
}

export function validateRutaForPublish(ruta: RutaAnual): ValidationResult {
  const r12 = validateRutaHas12Months(ruta);
  if (!r12.ok) return r12;

  for (const month of ruta.months) {
    const depth = validateMonthDepthMvp(month);
    if (!depth.ok) return depth;
    if (month.units.length < 1) {
      return {
        ok: false,
        code: "V-MES-U",
        message: `Mes ${month.monthIndex} publish requiere ≥1 UnidadFTC.`,
      };
    }
    for (const unit of month.units) {
      if (unit.status === "PUBLISHED") {
        const u = validateUnidadForPublish(unit);
        if (!u.ok) return u;
      }
    }
  }
  return { ok: true };
}

// ─── Avance A-SEQ / A-UNIT (puro; sujeto H1 = profileId) ───

export function canOpenCardSlot(
  completedSlots: ReadonlySet<FtcSlot>,
  targetSlot: FtcSlot
): boolean {
  if (targetSlot === 1) return true;
  return completedSlots.has((targetSlot - 1) as FtcSlot);
}

export function unitCompletionAfterCards(
  completedSlots: ReadonlySet<FtcSlot>
): { unitCompleted: boolean; nextUnitAvailable: boolean } {
  const unitCompleted = ([1, 2, 3, 4, 5] as FtcSlot[]).every((s) =>
    completedSlots.has(s)
  );
  return { unitCompleted, nextUnitAvailable: unitCompleted };
}

export function buildOrderBlocker(prevCardName: string): BlockerH1 {
  return {
    kind: "ORDER",
    requirement: `Completar ${prevCardName}`,
    reason: "Las tarjetas FTC se abren en orden 1→5 (A-SEQ).",
    action: `Termina ${prevCardName} para continuar.`,
  };
}

/**
 * T-ONB / Camino: mes activo y primera unidad desde contexto onboarding H1.
 * profileId debe = userId (puente temporal); no se usa otro sujeto.
 */
export function resolveActivePlacementH1(input: {
  profileId: string;
  userId: string;
  currentMonth: number;
  rutaSlug?: string;
  rutaVersion?: number;
}): {
  profileId: string;
  activeMesId: string;
  firstUnitId: string;
  firstCardId: string;
} {
  if (input.profileId !== input.userId) {
    throw new Error("H1: profileId debe coincidir con userId.");
  }
  const slug = input.rutaSlug ?? RUTA_GUITARRA_FUNDAMENTOS_SLUG;
  const version = input.rutaVersion ?? RUTA_MVP_VERSION;
  const rutaId = rutaIdOf(slug, version);
  const mesId = mesIdOf(rutaId, input.currentMonth);
  const firstUnitId = unidadIdOf(mesId, 1);
  return {
    profileId: input.profileId,
    activeMesId: mesId,
    firstUnitId,
    firstCardId: tarjetaIdOf(firstUnitId, 1),
  };
}

/** Fixture conceptual en memoria (NO seed DB / NO JSON archivo). */
export function buildMinimalTarjeta(
  unidadId: string,
  slot: FtcSlot,
  status: PublishStatusDomain = "PUBLISHED"
): TarjetaFTC {
  const typeName = ftcSlotName(slot);
  return {
    id: tarjetaIdOf(unidadId, slot),
    unidadId,
    slot,
    typeName,
    objective: `Objetivo ${typeName}`,
    primarySkill: "guitarra-mvp",
    estimatedMinutes: 10,
    completionCriteria: `Criterio binario ${typeName}`,
    resourceRef: null,
    status,
  };
}

export function buildMinimalUnidad(
  mesId: string,
  order: number,
  title: string,
  status: PublishStatusDomain = "PUBLISHED"
): UnidadFTC {
  const id = unidadIdOf(mesId, order);
  return {
    id,
    mesRutaId: mesId,
    order,
    title,
    isElective: false,
    primarySkill: "guitarra-mvp",
    status,
    cards: ([1, 2, 3, 4, 5] as FtcSlot[]).map((slot) =>
      buildMinimalTarjeta(id, slot, status)
    ),
  };
}

/**
 * Fixture MVP en memoria: Ruta guitarra-fundamentos v1, 12 meses,
 * M1–M2 deep con 1 UnidadFTC×5; M3–12 summary con 1 unidad draft mínima.
 * No escribe DB ni archivos seed (T-NOSEED).
 */
export function buildMvpRutaGuitarraFundamentosFixture(): RutaAnual {
  const slug = RUTA_GUITARRA_FUNDAMENTOS_SLUG;
  const version = RUTA_MVP_VERSION;
  const rutaId = rutaIdOf(slug, version);

  const months: MesRuta[] = [];
  for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
    const mesId = mesIdOf(rutaId, monthIndex);
    const depth = monthDepthMvp(monthIndex);
    const deep = depth === "deep";
    months.push({
      id: mesId,
      rutaId,
      monthIndex,
      nameInternal: deep ? `Mes ${monthIndex} deep` : `Mes ${monthIndex} summary`,
      objective: `Objetivo pedagógico mes ${monthIndex}`,
      depth,
      requiredUnitCount: 1,
      status: "PUBLISHED",
      units: [
        buildMinimalUnidad(
          mesId,
          1,
          deep ? `Unidad M${monthIndex}-U1` : `Resumen M${monthIndex}-U1`,
          deep ? "PUBLISHED" : "DRAFT"
        ),
      ],
    });
  }

  return {
    id: rutaId,
    slug,
    version,
    instrument: "guitarra",
    title: "Guitarra fundamentos",
    description: "Ruta anual MVP GMusic — fixture dominio P0-03 (sin seed DB).",
    monthCount: 12,
    status: "PUBLISHED",
    months,
  };
}
