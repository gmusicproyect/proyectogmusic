/**
 * P0-08 — Biblioteca básica H1 (catálogo backend).
 *
 * Principio: Biblioteca refuerza; Mi Camino manda "qué practico ahora".
 * Acceso decidido por Entitlements (`grants.libraryTier`) — fuente única
 * `/me/access`; el frontend solo renderiza `GET /me/library`.
 *
 * MVP: accessTier basic permitido · premium SIEMPRE locked · sin Comunidad.
 * Catálogo fixture en memoria: sin seeds DB, sin multimedia real
 * (mediaRef = null placeholder), sin persistencia durable no autorizada.
 * Consumo de recurso NO completa tarjetas (progreso = eventos P0-05).
 *
 * Spec: joytunes-analysis/reportes/spec_P0_08_biblioteca_basica_H1.md
 */
import type { AccessGrantsH1 } from "./entitlementsH1.js";
import { ApiError } from "./errors.js";
import type { LearnerContextH1 } from "./learnerContextH1.js";
import {
  mesIdOf,
  rutaIdOf,
  tarjetaIdOf,
  unidadIdOf,
  RUTA_GUITARRA_FUNDAMENTOS_SLUG,
  RUTA_MVP_VERSION,
  type PublishStatusDomain,
} from "./rutaFtcDomainH1.js";

export type ResourceTypeH1 =
  | "song_simple"
  | "exercise"
  | "video_guide"
  | "backing_track"
  | "support_material";

export type ResourceAccessTierH1 = "basic" | "premium";
export type ResourceLevelH1 = "beginner" | "early" | "intermediate";
export type LibraryViewStateH1 = "available" | "locked" | "recommended";

export type RecursoBibliotecaH1 = {
  id: string;
  titleInternal: string;
  titlePublic: string | null;
  instrument: "guitarra";
  level: ResourceLevelH1;
  suggestedMonth: number | null;
  skillKey: string | null;
  type: ResourceTypeH1;
  estimatedMinutes: number;
  accessTier: ResourceAccessTierH1;
  status: PublishStatusDomain;
  /** Sin upload/hosting en esta fase — siempre placeholder null. */
  mediaRef: null;
  tarjetaIds: string[];
  unitIds: string[];
};

export type LibraryBlockerH1 = {
  code: "ENTITLEMENT";
  requirement: string;
  reason: string;
  actionLabel: string;
  actionTarget: string;
};

export type LibraryItemViewH1 = {
  id: string;
  title: string;
  type: ResourceTypeH1;
  level: ResourceLevelH1;
  estimatedMinutes: number;
  suggestedMonth: number | null;
  skillKey: string | null;
  accessTier: ResourceAccessTierH1;
  viewState: LibraryViewStateH1;
  blocker: LibraryBlockerH1 | null;
  tarjetaIds: string[];
  unitIds: string[];
};

export type LibraryFiltersH1 = {
  month: number;
  monthWindow: number[];
  type: ResourceTypeH1 | null;
  skillKey: string | null;
  level: ResourceLevelH1 | null;
};

export type LibraryViewH1 = {
  profileId: string;
  currentMonth: number | null;
  filtersApplied: LibraryFiltersH1 | null;
  items: LibraryItemViewH1[];
  emptyState: {
    code: "ONBOARDING" | "NO_RESOURCES" | "NO_LIBRARY_ACCESS";
    message: string;
    /** Camino sigue siendo el CTA primario. */
    ctaLabel: "Ir a Mi Camino";
    ctaTarget: "/mi-camino";
  } | null;
  meta: {
    /** Catálogo fixture en memoria — sin seeds/multimedia hasta mandato editorial. */
    catalogSource: "memory_fixture_h1";
    premiumEnabled: false;
  };
};

const RESOURCE_TYPES: ResourceTypeH1[] = [
  "song_simple",
  "exercise",
  "video_guide",
  "backing_track",
  "support_material",
];

const RESOURCE_LEVELS: ResourceLevelH1[] = ["beginner", "early", "intermediate"];

const RUTA_ID = rutaIdOf(RUTA_GUITARRA_FUNDAMENTOS_SLUG, RUTA_MVP_VERSION);

function m1u1CardId(slot: 1 | 2 | 3 | 4 | 5): string {
  return tarjetaIdOf(unidadIdOf(mesIdOf(RUTA_ID, 1), 1), slot);
}

/**
 * Catálogo curado fixture (metadatos placeholder, sin contenido real).
 * Cubre: basic/premium, PUBLISHED/DRAFT/ARCHIVED, meses 1..3 y sin mes.
 */
export function buildMvpLibraryCatalogFixtureH1(): RecursoBibliotecaH1[] {
  return [
    {
      id: "lib:guitarra:m01:postura-checklist",
      titleInternal: "Checklist de postura y afinación (placeholder)",
      titlePublic: "Checklist: postura y afinación",
      instrument: "guitarra",
      level: "beginner",
      suggestedMonth: 1,
      skillKey: "Sonido",
      type: "support_material",
      estimatedMinutes: 5,
      accessTier: "basic",
      status: "PUBLISHED",
      mediaRef: null,
      tarjetaIds: [m1u1CardId(1)],
      unitIds: [unidadIdOf(mesIdOf(RUTA_ID, 1), 1)],
    },
    {
      id: "lib:guitarra:m01:primer-ritmo-drill",
      titleInternal: "Drill primer patrón rítmico (placeholder)",
      titlePublic: "Ejercicio: primer patrón rítmico",
      instrument: "guitarra",
      level: "beginner",
      suggestedMonth: 1,
      skillKey: "Ritmo",
      type: "exercise",
      estimatedMinutes: 8,
      accessTier: "basic",
      status: "PUBLISHED",
      mediaRef: null,
      tarjetaIds: [m1u1CardId(3)],
      unitIds: [unidadIdOf(mesIdOf(RUTA_ID, 1), 1)],
    },
    {
      id: "lib:guitarra:m01:cancion-simple-1",
      titleInternal: "Canción simple de apoyo M1 (placeholder)",
      titlePublic: "Canción de apoyo — Mes 1",
      instrument: "guitarra",
      level: "beginner",
      suggestedMonth: 1,
      skillKey: "Ritmo",
      type: "song_simple",
      estimatedMinutes: 10,
      accessTier: "premium",
      status: "PUBLISHED",
      mediaRef: null,
      tarjetaIds: [],
      unitIds: [],
    },
    {
      id: "lib:guitarra:m02:video-cambios-acordes",
      titleInternal: "Video guía cambios de acordes (placeholder)",
      titlePublic: "Video: cambios de acordes sin pausas",
      instrument: "guitarra",
      level: "early",
      suggestedMonth: 2,
      skillKey: "Forma",
      type: "video_guide",
      estimatedMinutes: 12,
      accessTier: "basic",
      status: "PUBLISHED",
      mediaRef: null,
      tarjetaIds: [],
      unitIds: [],
    },
    {
      id: "lib:guitarra:m02:backing-track-1",
      titleInternal: "Backing track lenta M2 (placeholder)",
      titlePublic: "Pista de acompañamiento — Mes 2",
      instrument: "guitarra",
      level: "early",
      suggestedMonth: 2,
      skillKey: "Pulso",
      type: "backing_track",
      estimatedMinutes: 6,
      accessTier: "premium",
      status: "PUBLISHED",
      mediaRef: null,
      tarjetaIds: [],
      unitIds: [],
    },
    {
      id: "lib:guitarra:m03:teaser-repertorio",
      titleInternal: "Teaser repertorio M3 (placeholder)",
      titlePublic: "Próximamente: repertorio Mes 3",
      instrument: "guitarra",
      level: "early",
      suggestedMonth: 3,
      skillKey: null,
      type: "support_material",
      estimatedMinutes: 4,
      accessTier: "basic",
      status: "PUBLISHED",
      mediaRef: null,
      tarjetaIds: [],
      unitIds: [],
    },
    {
      id: "lib:guitarra:m06:draft-no-visible",
      titleInternal: "Borrador editorial M6 — no visible alumno",
      titlePublic: null,
      instrument: "guitarra",
      level: "intermediate",
      suggestedMonth: 6,
      skillKey: null,
      type: "exercise",
      estimatedMinutes: 10,
      accessTier: "basic",
      status: "DRAFT",
      mediaRef: null,
      tarjetaIds: [],
      unitIds: [],
    },
    {
      id: "lib:guitarra:legacy:archivado",
      titleInternal: "Recurso archivado legacy",
      titlePublic: null,
      instrument: "guitarra",
      level: "beginner",
      suggestedMonth: 1,
      skillKey: null,
      type: "support_material",
      estimatedMinutes: 3,
      accessTier: "basic",
      status: "ARCHIVED",
      mediaRef: null,
      tarjetaIds: [],
      unitIds: [],
    },
  ];
}

function premiumLockedBlocker(): LibraryBlockerH1 {
  return {
    code: "ENTITLEMENT",
    requirement: "Biblioteca premium",
    reason:
      "Este recurso es premium. Tu acceso actual incluye la biblioteca básica; premium no está habilitado en MVP.",
    actionLabel: "Ver planes",
    actionTarget: "/#planes",
  };
}

/** Tier permitido por grant: premium jamás abre en MVP (grants nunca lo dan). */
function tierAllowed(
  libraryTier: AccessGrantsH1["libraryTier"],
  accessTier: ResourceAccessTierH1
): boolean {
  if (accessTier === "premium") return false;
  return libraryTier === "basic" || libraryTier === "premium";
}

function monthWindowFor(currentMonth: number): number[] {
  return [currentMonth - 1, currentMonth, currentMonth + 1].filter(
    (m) => m >= 1 && m <= 12
  );
}

export function parseLibraryQueryH1(query: {
  month?: unknown;
  type?: unknown;
  skillKey?: unknown;
  level?: unknown;
}): {
  month: number | null;
  type: ResourceTypeH1 | null;
  skillKey: string | null;
  level: ResourceLevelH1 | null;
} {
  let month: number | null = null;
  if (typeof query.month === "string" && query.month.length > 0) {
    const parsed = Number(query.month);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 12) {
      throw new ApiError(400, "VALIDATION_ERROR", "month debe ser 1..12.");
    }
    month = parsed;
  }

  let type: ResourceTypeH1 | null = null;
  if (typeof query.type === "string" && query.type.length > 0) {
    if (!RESOURCE_TYPES.includes(query.type as ResourceTypeH1)) {
      throw new ApiError(400, "VALIDATION_ERROR", "type de recurso inválido.");
    }
    type = query.type as ResourceTypeH1;
  }

  let level: ResourceLevelH1 | null = null;
  if (typeof query.level === "string" && query.level.length > 0) {
    if (!RESOURCE_LEVELS.includes(query.level as ResourceLevelH1)) {
      throw new ApiError(400, "VALIDATION_ERROR", "level inválido.");
    }
    level = query.level as ResourceLevelH1;
  }

  const skillKey =
    typeof query.skillKey === "string" && query.skillKey.length > 0
      ? query.skillKey
      : null;

  return { month, type, skillKey, level };
}

function toItemView(
  resource: RecursoBibliotecaH1,
  grants: Pick<AccessGrantsH1, "libraryTier">,
  currentMonth: number
): LibraryItemViewH1 {
  const allowed = tierAllowed(grants.libraryTier, resource.accessTier);
  const recommended =
    allowed &&
    resource.suggestedMonth !== null &&
    Math.abs(resource.suggestedMonth - currentMonth) <= 1;

  return {
    id: resource.id,
    title: resource.titlePublic ?? resource.titleInternal,
    type: resource.type,
    level: resource.level,
    estimatedMinutes: resource.estimatedMinutes,
    suggestedMonth: resource.suggestedMonth,
    skillKey: resource.skillKey,
    accessTier: resource.accessTier,
    viewState: !allowed ? "locked" : recommended ? "recommended" : "available",
    blocker: !allowed ? premiumLockedBlocker() : null,
    tarjetaIds: [...resource.tarjetaIds],
    unitIds: [...resource.unitIds],
  };
}

/**
 * §13: filter(PUBLISHED) ∩ instrument ∩ month policy (±1) ∩ tier por grants.
 * Locked premium se lista CON candado (no se oculta ni se abre).
 */
export function buildLibraryViewH1(input: {
  context: LearnerContextH1;
  grants: Pick<AccessGrantsH1, "libraryTier">;
  filters?: {
    month?: number | null;
    type?: ResourceTypeH1 | null;
    skillKey?: string | null;
    level?: ResourceLevelH1 | null;
  };
  catalog?: RecursoBibliotecaH1[];
}): LibraryViewH1 {
  const { context, grants } = input;
  const catalog = input.catalog ?? buildMvpLibraryCatalogFixtureH1();

  const base: Omit<LibraryViewH1, "items" | "filtersApplied" | "emptyState"> = {
    profileId: context.profileId,
    currentMonth: context.currentMonth,
    meta: {
      catalogSource: "memory_fixture_h1",
      premiumEnabled: false,
    },
  };

  if (!context.onboardingCompleted || context.currentMonth == null) {
    return {
      ...base,
      filtersApplied: null,
      items: [],
      emptyState: {
        code: "ONBOARDING",
        message:
          "Completa tu punto de partida para ver los materiales de tu mes.",
        ctaLabel: "Ir a Mi Camino",
        ctaTarget: "/mi-camino",
      },
    };
  }

  if (grants.libraryTier === "none") {
    return {
      ...base,
      filtersApplied: null,
      items: [],
      emptyState: {
        code: "NO_LIBRARY_ACCESS",
        message: "Tu acceso actual no incluye la biblioteca.",
        ctaLabel: "Ir a Mi Camino",
        ctaTarget: "/mi-camino",
      },
    };
  }

  const filterMonth = input.filters?.month ?? context.currentMonth;
  const monthWindow = monthWindowFor(context.currentMonth);
  if (!monthWindow.includes(filterMonth)) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `month fuera de la política MVP (mes actual ±1): ${monthWindow.join(", ")}.`
    );
  }

  const filters: LibraryFiltersH1 = {
    month: filterMonth,
    monthWindow,
    type: input.filters?.type ?? null,
    skillKey: input.filters?.skillKey ?? null,
    level: input.filters?.level ?? null,
  };

  const items = catalog
    .filter((r) => r.status === "PUBLISHED")
    .filter((r) => r.instrument === (context.instrument ?? "guitarra"))
    .filter((r) => r.suggestedMonth === null || r.suggestedMonth === filters.month)
    .filter((r) => filters.type === null || r.type === filters.type)
    .filter((r) => filters.skillKey === null || r.skillKey === filters.skillKey)
    .filter((r) => filters.level === null || r.level === filters.level)
    .map((r) => toItemView(r, grants, context.currentMonth ?? 1));

  return {
    ...base,
    filtersApplied: filters,
    items,
    emptyState:
      items.length === 0
        ? {
            code: "NO_RESOURCES",
            message:
              "Aún no hay materiales publicados para este filtro. Tu práctica sigue en Mi Camino.",
            ctaLabel: "Ir a Mi Camino",
            ctaTarget: "/mi-camino",
          }
        : null,
  };
}

/** Detalle: 404 amable si no existe/no PUBLISHED; locked premium con blocker. */
export function buildLibraryItemDetailH1(input: {
  context: LearnerContextH1;
  grants: Pick<AccessGrantsH1, "libraryTier">;
  resourceId: string;
  catalog?: RecursoBibliotecaH1[];
}): LibraryItemViewH1 {
  const catalog = input.catalog ?? buildMvpLibraryCatalogFixtureH1();
  const resource = catalog.find((r) => r.id === input.resourceId);
  if (!resource || resource.status !== "PUBLISHED") {
    throw new ApiError(404, "RESOURCE_NOT_FOUND", "Recurso de biblioteca no disponible.");
  }
  if (resource.instrument !== (input.context.instrument ?? "guitarra")) {
    throw new ApiError(404, "RESOURCE_NOT_FOUND", "Recurso de biblioteca no disponible.");
  }
  if (input.grants.libraryTier === "none") {
    throw new ApiError(403, "ENTITLEMENT", "Tu acceso actual no incluye la biblioteca.");
  }
  return toItemView(resource, input.grants, input.context.currentMonth ?? 1);
}
