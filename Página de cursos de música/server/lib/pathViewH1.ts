/**
 * P0-04 — PathViewH1 / Mi Camino backend projection.
 *
 * Ensambla "qué practico ahora" desde:
 * LearnerContextH1 + dominio Ruta/FTC + Entitlements + eventos P0-05.
 * No toca schema, no calcula progreso en frontend, no expone Comunidad.
 */
import type { AccessViewH1 } from "./entitlementsH1.js";
import { buildEntitlementBlocker, isMonthPlayable } from "./entitlementsH1.js";
import type { LearnerContextH1 } from "./learnerContextH1.js";
import {
  buildMvpRutaGuitarraFundamentosFixture,
  type FtcSlot,
  type FtcSlotName,
  type LearnerItemStatus,
  type MesRuta,
  type TarjetaFTC,
  type UnidadFTC,
} from "./rutaFtcDomainH1.js";
import {
  getPracticeProjectionH1,
  listLearningEventsH1,
} from "./practiceEventsH1.js";

export type PathBlockerCodeH1 =
  | "ONBOARDING"
  | "CARD_ORDER"
  | "UNIT_ORDER"
  | "MONTH_ORDER"
  | "DEPTH_SUMMARY"
  | "ENTITLEMENT"
  | "NO_CONTENT";

export type PathBlockerH1 = {
  code: PathBlockerCodeH1;
  requirement: string;
  reason: string;
  actionLabel: string;
  actionTarget: string | null;
};

export type MonthViewH1 = {
  id: string;
  monthIndex: number;
  title: string;
  depth: "deep" | "summary";
  status: LearnerItemStatus;
  percentCompleted: number;
  blocker: PathBlockerH1 | null;
};

export type CardViewH1 = {
  tarjetaId: string;
  unidadId: string;
  monthIndex: number;
  slot: FtcSlot;
  typeName: FtcSlotName;
  title: string;
  status: LearnerItemStatus;
  ctaLabel: "Empezar" | "Continuar" | null;
  blocker: PathBlockerH1 | null;
};

export type UnitViewH1 = {
  unidadId: string;
  monthIndex: number;
  order: number;
  title: string;
  status: LearnerItemStatus;
  cardsCompleted: number;
  cardsTotal: 5;
};

export type NextPracticeH1 = {
  tarjetaId: string;
  unidadId: string;
  monthIndex: number;
  slot: FtcSlot;
  typeName: FtcSlotName;
  ctaLabel: "Empezar" | "Continuar";
} | null;

export type PathViewH1 = {
  profileId: string;
  ruta: {
    slug: string;
    version: number;
    title: string;
  };
  months: MonthViewH1[];
  activeMonthIndex: number | null;
  activeUnit: UnitViewH1 | null;
  cards: CardViewH1[];
  nextPractice: NextPracticeH1;
  blockers: PathBlockerH1[];
  links: {
    progress: "/mi-progreso";
    library: "/biblioteca";
  };
  meta: {
    weeklyGoalMinutes: number | null;
    learningGoal: string | null;
  };
};

function onboardingBlocker(): PathBlockerH1 {
  return {
    code: "ONBOARDING",
    requirement: "Completar diagnóstico inicial",
    reason: "Mi Camino necesita tu punto de partida antes de recomendar una práctica.",
    actionLabel: "Completar diagnóstico",
    actionTarget: "/onboarding",
  };
}

function depthBlocker(monthIndex: number): PathBlockerH1 {
  return {
    code: "DEPTH_SUMMARY",
    requirement: `Contenido deep del Mes ${monthIndex}`,
    reason: `El Mes ${monthIndex} está visible como mapa anual, pero aún no está jugable en MVP.`,
    actionLabel: "Ver mes actual",
    actionTarget: null,
  };
}

function noContentBlocker(monthIndex: number): PathBlockerH1 {
  return {
    code: "NO_CONTENT",
    requirement: `Unidad publicada del Mes ${monthIndex}`,
    reason: "No hay una UnidadFTC jugable para este mes.",
    actionLabel: "Volver a M1",
    actionTarget: null,
  };
}

function cardOrderBlocker(slot: FtcSlot): PathBlockerH1 {
  return {
    code: "CARD_ORDER",
    requirement: `Completar tarjeta ${slot - 1}`,
    reason: "Las tarjetas FTC se desbloquean en orden: Fundamento → Crea/Toca.",
    actionLabel: "Continuar en orden",
    actionTarget: null,
  };
}

function toEntitlementBlocker(monthIndex: number): PathBlockerH1 {
  const blocker = buildEntitlementBlocker(monthIndex);
  return {
    code: "ENTITLEMENT",
    requirement: blocker.requirement,
    reason: blocker.reason,
    actionLabel: blocker.actionLabel,
    actionTarget: blocker.actionTarget,
  };
}

function latestOpenSessionByCard(profileId: string): Map<string, string> {
  const events = listLearningEventsH1(profileId);
  const open = new Map<string, string>();
  for (const event of events) {
    if (!event.tarjetaId || !event.sessionId) continue;
    if (event.eventType === "practice_started") {
      open.set(event.tarjetaId, event.sessionId);
    }
    if (
      event.eventType === "practice_completed" ||
      event.eventType === "practice_abandoned"
    ) {
      const current = open.get(event.tarjetaId);
      if (current === event.sessionId) open.delete(event.tarjetaId);
    }
  }
  return open;
}

function firstUnitForMonth(month: MesRuta): UnidadFTC | null {
  return [...month.units].sort((a, b) => a.order - b.order)[0] ?? null;
}

function sortedCards(unit: UnidadFTC): TarjetaFTC[] {
  return [...unit.cards].sort((a, b) => a.slot - b.slot);
}

export function buildPathViewH1(input: {
  context: LearnerContextH1;
  access: Pick<AccessViewH1, "grants">;
}): PathViewH1 {
  const { context, access } = input;
  const ruta = buildMvpRutaGuitarraFundamentosFixture();
  const projection = getPracticeProjectionH1(context.profileId);
  const completedCards = new Set(projection.completedCards);
  const completedUnits = new Set(projection.completedUnits);
  const openSessions = latestOpenSessionByCard(context.profileId);

  const blockers: PathBlockerH1[] = [];
  if (!context.onboardingCompleted) {
    blockers.push(onboardingBlocker());
  }

  const activeMonthIndex = context.onboardingCompleted
    ? (context.currentMonth ?? 1)
    : null;
  const activeMonth =
    activeMonthIndex == null
      ? null
      : (ruta.months.find((month) => month.monthIndex === activeMonthIndex) ?? null);

  if (
    activeMonthIndex != null &&
    !isMonthPlayable(access.grants, activeMonthIndex)
  ) {
    blockers.push(toEntitlementBlocker(activeMonthIndex));
  }
  if (activeMonth && activeMonth.depth === "summary") {
    blockers.push(depthBlocker(activeMonth.monthIndex));
  }

  const activeUnit =
    activeMonth && blockers.length === 0 ? firstUnitForMonth(activeMonth) : null;
  if (activeMonth && !activeUnit && blockers.length === 0) {
    blockers.push(noContentBlocker(activeMonth.monthIndex));
  }

  const monthViews = ruta.months.map((month): MonthViewH1 => {
    const units = month.units;
    const totalCards = units.flatMap((unit) => unit.cards).length;
    const completedInMonth = units
      .flatMap((unit) => unit.cards)
      .filter((card) => completedCards.has(card.id)).length;
    const playable = isMonthPlayable(access.grants, month.monthIndex);
    const status: LearnerItemStatus =
      month.monthIndex === activeMonthIndex
        ? "active"
        : completedInMonth > 0 && completedInMonth === totalCards
          ? "completed"
          : playable && month.depth === "deep"
            ? "available"
            : "locked";

    return {
      id: month.id,
      monthIndex: month.monthIndex,
      title: month.nameInternal,
      depth: month.depth,
      status,
      percentCompleted:
        totalCards > 0 ? Math.round((completedInMonth / totalCards) * 100) : 0,
      blocker:
        status === "locked"
          ? month.depth === "summary"
            ? depthBlocker(month.monthIndex)
            : toEntitlementBlocker(month.monthIndex)
          : null,
    };
  });

  const cards: CardViewH1[] = [];
  let nextPractice: NextPracticeH1 = null;

  if (activeUnit) {
    let previousCompleted = true;
    for (const card of sortedCards(activeUnit)) {
      const isCompleted = completedCards.has(card.id);
      const isActive = openSessions.has(card.id);
      const orderAllows = previousCompleted;
      let status: LearnerItemStatus = "locked";
      let blocker: PathBlockerH1 | null = null;
      let ctaLabel: "Empezar" | "Continuar" | null = null;

      if (isCompleted) {
        status = "completed";
      } else if (isActive) {
        status = "active";
        ctaLabel = "Continuar";
      } else if (orderAllows && !nextPractice) {
        status = "recommended";
        ctaLabel = "Empezar";
      } else if (orderAllows) {
        status = "available";
      } else {
        status = "locked";
        blocker = cardOrderBlocker(card.slot);
      }

      if (!nextPractice && (status === "recommended" || status === "active")) {
        nextPractice = {
          tarjetaId: card.id,
          unidadId: activeUnit.id,
          monthIndex: activeMonthIndex ?? 1,
          slot: card.slot,
          typeName: card.typeName,
          ctaLabel: ctaLabel ?? "Empezar",
        };
      }

      cards.push({
        tarjetaId: card.id,
        unidadId: activeUnit.id,
        monthIndex: activeMonthIndex ?? 1,
        slot: card.slot,
        typeName: card.typeName,
        title: card.objective,
        status,
        ctaLabel,
        blocker,
      });

      if (!isCompleted) previousCompleted = false;
    }
  }

  const activeUnitView: UnitViewH1 | null = activeUnit
    ? {
        unidadId: activeUnit.id,
        monthIndex: activeMonthIndex ?? 1,
        order: activeUnit.order,
        title: activeUnit.title,
        status: completedUnits.has(activeUnit.id)
          ? "completed"
          : nextPractice
            ? "active"
            : "available",
        cardsCompleted: cards.filter((card) => card.status === "completed").length,
        cardsTotal: 5,
      }
    : null;

  if (!nextPractice && blockers.length === 0 && activeMonth) {
    blockers.push(noContentBlocker(activeMonth.monthIndex));
  }

  return {
    profileId: context.profileId,
    ruta: {
      slug: ruta.slug,
      version: ruta.version,
      title: ruta.title,
    },
    months: monthViews,
    activeMonthIndex,
    activeUnit: activeUnitView,
    cards,
    nextPractice,
    blockers,
    links: {
      progress: "/mi-progreso",
      library: "/biblioteca",
    },
    meta: {
      weeklyGoalMinutes: context.weeklyGoalMinutes,
      learningGoal: context.learningGoal,
    },
  };
}
