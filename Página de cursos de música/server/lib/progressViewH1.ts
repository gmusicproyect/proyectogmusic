/**
 * P0-06 — ProgressViewH1 / Mi Progreso (proyección derivada).
 *
 * ProgresoPerfil = f(EventoAprendizaje[], RutaAnual, LearnerContextH1, now)
 * Misma proyección de cards/units que PathViewH1 (vía eventos P0-05).
 * nextPracticeHint se alinea con PathViewH1.nextPractice.
 *
 * Fuente de eventos: store en memoria P0-05 — puente temporal H1 hasta
 * autorización de persistencia durable. Sin schema, UI, audio ni scoring.
 */
import type { AccessViewH1 } from "./entitlementsH1.js";
import type { LearnerContextH1 } from "./learnerContextH1.js";
import { buildPathViewH1, type NextPracticeH1 } from "./pathViewH1.js";
import {
  listLearningEventsH1,
  type LearningEventH1,
} from "./practiceEventsH1.js";
import {
  buildMvpRutaGuitarraFundamentosFixture,
  type FtcSlot,
  type FtcSlotName,
  type MesRuta,
} from "./rutaFtcDomainH1.js";
import {
  formatDateInTimezone,
  getIsoWeekStartDateInTimezone,
  subtractCalendarDays,
} from "./timezone.js";

export type ProgressEmptyStateH1 =
  | {
      code: "ONBOARDING";
      message: string;
    }
  | {
      code: "NO_PRACTICE";
      message: string;
    }
  | null;

export type LastCompletedCardH1 = {
  tarjetaId: string;
  slot: FtcSlot;
  typeName: FtcSlotName;
  completedAt: string;
} | null;

export type ProgressViewH1 = {
  profileId: string;
  rutaSlug: string;
  rutaVersion: number;

  cardsCompleted: number;
  unitsCompleted: number;
  monthsCompleted: number;

  currentMonthIndex: number | null;
  monthProgressPct: number;
  routeProgressPct: number;

  minutesTotal: number;
  minutesThisWeek: number;
  weeklyGoalMinutes: number | null;

  streakDays: number;
  lastActivityAt: string | null;

  lastCompletedCard: LastCompletedCardH1;
  nextPracticeHint: NextPracticeH1;

  emptyState: ProgressEmptyStateH1;

  /** Proyección interna (maps serializables) — misma base que Camino. */
  cardStatus: Record<string, "completed">;
  unitStatus: Record<string, "completed">;
  monthStatus: Record<number, "completed" | "in_progress" | "not_started">;

  meta: {
    /** Store P0-05 en memoria: temporal hasta persistencia durable. */
    eventSource: "memory_bridge_h1";
    timezone: string;
    computedAt: string;
  };
};

const DEFAULT_TIMEZONE = "America/Santiago";

function sortedEvents(profileId: string): LearningEventH1[] {
  return listLearningEventsH1(profileId).sort((a, b) =>
    a.occurredAt.localeCompare(b.occurredAt)
  );
}

function deriveCompletedSets(events: LearningEventH1[]): {
  cards: Set<string>;
  units: Set<string>;
  cardMeta: Map<string, { slot: FtcSlot; typeName: FtcSlotName; completedAt: string }>;
} {
  const cards = new Set<string>();
  const units = new Set<string>();
  const cardMeta = new Map<
    string,
    { slot: FtcSlot; typeName: FtcSlotName; completedAt: string }
  >();

  for (const event of events) {
    if (event.eventType === "ftc_card_completed" && event.tarjetaId && event.slot) {
      cards.add(event.tarjetaId);
      cardMeta.set(event.tarjetaId, {
        slot: event.slot,
        typeName: slotToTypeName(event.slot),
        completedAt: event.occurredAt,
      });
    }
    if (event.eventType === "unit_completed" && event.unidadId) {
      units.add(event.unidadId);
    }
  }

  return { cards, units, cardMeta };
}

function slotToTypeName(slot: FtcSlot): FtcSlotName {
  const names: FtcSlotName[] = [
    "Fundamento",
    "Forma",
    "Pulso",
    "Práctica",
    "Crea/Toca",
  ];
  return names[slot - 1]!;
}

function requiredUnitsCompletedInMonth(
  month: MesRuta,
  completedUnits: Set<string>
): number {
  const required = month.units
    .filter((unit) => !unit.isElective)
    .sort((a, b) => a.order - b.order)
    .slice(0, month.requiredUnitCount);
  return required.filter((unit) => completedUnits.has(unit.id)).length;
}

function isMonthCompleted(month: MesRuta, completedUnits: Set<string>): boolean {
  if (month.requiredUnitCount <= 0) return false;
  return (
    requiredUnitsCompletedInMonth(month, completedUnits) >= month.requiredUnitCount
  );
}

function computeStreakDays(
  practiceCompletedDates: Set<string>,
  today: string
): number {
  if (!practiceCompletedDates.has(today)) return 0;
  let streak = 0;
  let cursor = today;
  while (practiceCompletedDates.has(cursor)) {
    streak += 1;
    cursor = subtractCalendarDays(cursor, 1);
  }
  return streak;
}

/**
 * Rebuild/on-read: misma secuencia de eventos ⇒ mismo ProgressViewH1.
 * No muta el store; solo lee y proyecta.
 */
export function buildProgressViewH1(input: {
  context: LearnerContextH1;
  access: Pick<AccessViewH1, "grants">;
  timezone?: string;
  now?: Date;
}): ProgressViewH1 {
  const timezone = input.timezone ?? DEFAULT_TIMEZONE;
  const now = input.now ?? new Date();
  const computedAt = now.toISOString();
  const { context, access } = input;

  const events = sortedEvents(context.profileId);
  const { cards, units, cardMeta } = deriveCompletedSets(events);
  const ruta = buildMvpRutaGuitarraFundamentosFixture();

  const currentMonthIndex = context.onboardingCompleted
    ? (context.currentMonth ?? 1)
    : null;
  const activeMonth =
    currentMonthIndex == null
      ? null
      : (ruta.months.find((m) => m.monthIndex === currentMonthIndex) ?? null);

  const monthProgressPct =
    activeMonth == null
      ? 0
      : Math.round(
          (requiredUnitsCompletedInMonth(activeMonth, units) /
            Math.max(activeMonth.requiredUnitCount, 1)) *
            100
        );

  const monthsCompleted = ruta.months.filter((month) =>
    isMonthCompleted(month, units)
  ).length;

  /** Anexo B: meses cerrados previos + fracción del mes activo (sin doble conteo). */
  const pastCompletedMonths = ruta.months.filter(
    (month) =>
      currentMonthIndex != null &&
      month.monthIndex < currentMonthIndex &&
      isMonthCompleted(month, units)
  ).length;
  const activeMonthDone = Boolean(
    activeMonth && isMonthCompleted(activeMonth, units)
  );
  const routeProgressPct = Math.round(
    ((pastCompletedMonths +
      (activeMonthDone ? 1 : monthProgressPct / 100)) /
      12) *
      100
  );

  const weekStart = getIsoWeekStartDateInTimezone(timezone, now);
  const today = formatDateInTimezone(now, timezone);
  const practiceDates = new Set<string>();
  let minutesTotal = 0;
  let minutesThisWeek = 0;
  let lastActivityAt: string | null = null;

  for (const event of events) {
    if (event.eventType !== "practice_completed") continue;
    const minutes = Math.max(0, event.payload.effectiveMinutes ?? 0);
    minutesTotal += minutes;
    const day = formatDateInTimezone(new Date(event.occurredAt), timezone);
    practiceDates.add(day);
    if (day >= weekStart && day <= today) {
      minutesThisWeek += minutes;
    }
    if (!lastActivityAt || event.occurredAt > lastActivityAt) {
      lastActivityAt = event.occurredAt;
    }
  }

  let lastCompletedCard: LastCompletedCardH1 = null;
  for (const event of events) {
    if (event.eventType !== "ftc_card_completed" || !event.tarjetaId || !event.slot) {
      continue;
    }
    lastCompletedCard = {
      tarjetaId: event.tarjetaId,
      slot: event.slot,
      typeName: cardMeta.get(event.tarjetaId)?.typeName ?? slotToTypeName(event.slot),
      completedAt: event.occurredAt,
    };
  }

  const pathView = buildPathViewH1({ context, access });
  const nextPracticeHint = pathView.nextPractice;

  const cardStatus: Record<string, "completed"> = {};
  for (const id of cards) cardStatus[id] = "completed";
  const unitStatus: Record<string, "completed"> = {};
  for (const id of units) unitStatus[id] = "completed";

  const monthStatus: Record<number, "completed" | "in_progress" | "not_started"> =
    {};
  for (const month of ruta.months) {
    if (isMonthCompleted(month, units)) {
      monthStatus[month.monthIndex] = "completed";
    } else if (
      month.units.some(
        (unit) =>
          units.has(unit.id) || unit.cards.some((card) => cards.has(card.id))
      ) ||
      month.monthIndex === currentMonthIndex
    ) {
      monthStatus[month.monthIndex] = "in_progress";
    } else {
      monthStatus[month.monthIndex] = "not_started";
    }
  }

  let emptyState: ProgressEmptyStateH1 = null;
  if (!context.onboardingCompleted) {
    emptyState = {
      code: "ONBOARDING",
      message: "Completa tu punto de partida para ver tu progreso.",
    };
  } else if (cards.size === 0 && minutesTotal === 0) {
    emptyState = {
      code: "NO_PRACTICE",
      message: "Aún no hay práctica registrada. Continúa en Mi Camino.",
    };
  }

  return {
    profileId: context.profileId,
    rutaSlug: ruta.slug,
    rutaVersion: ruta.version,
    cardsCompleted: cards.size,
    unitsCompleted: units.size,
    monthsCompleted,
    currentMonthIndex,
    monthProgressPct,
    routeProgressPct,
    minutesTotal,
    minutesThisWeek,
    weeklyGoalMinutes: context.weeklyGoalMinutes,
    streakDays: computeStreakDays(practiceDates, today),
    lastActivityAt,
    lastCompletedCard,
    nextPracticeHint,
    emptyState,
    cardStatus,
    unitStatus,
    monthStatus,
    meta: {
      eventSource: "memory_bridge_h1",
      timezone,
      computedAt,
    },
  };
}

/** Alias explícito para rebuild/job — misma función on-read. */
export function rebuildProgressViewH1(
  input: Parameters<typeof buildProgressViewH1>[0]
): ProgressViewH1 {
  return buildProgressViewH1(input);
}
