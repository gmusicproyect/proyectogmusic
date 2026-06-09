export type AcademiaTierId = "basico" | "intermedio" | "avanzado";
export type AcademiaFocusId = "fundamento" | "tecnica" | "crea";

export interface AcademiaTrackCombination {
  tierId: AcademiaTierId;
  tierLabel: string;
  tierSelectorLabel: string;
  focusId: AcademiaFocusId;
  focusTitle: string;
  description: string;
  forWho: string;
  duracion: string;
  bgImage: string;
  freeClassAvailable: boolean;
}

export const ACADEMIA_TIERS: ReadonlyArray<{
  id: AcademiaTierId;
  label: string;
  selectorLabel: string;
  forWho: string;
  duracion: string;
}> = [
  {
    id: "basico",
    label: "Básico",
    selectorLabel: "Nivel 1 · Básico",
    forWho: "Nunca has tocado o quieres volver a empezar",
    duracion: "Meses 1–4 del programa",
  },
  {
    id: "intermedio",
    label: "Intermedio",
    selectorLabel: "Nivel 2 · Intermedio",
    forWho: "Tocas, pero quieres más precisión y fluidez",
    duracion: "Meses 4–8 del programa",
  },
  {
    id: "avanzado",
    label: "Avanzado",
    selectorLabel: "Nivel 3 · Avanzado",
    forWho: "Tienes técnica y quieres expresarte",
    duracion: "Meses 9–12 del programa",
  },
];

export const ACADEMIA_FOCUSES: ReadonlyArray<{
  id: AcademiaFocusId;
  description: string;
  bgImage: string;
}> = [
  {
    id: "fundamento",
    description: "Postura, primeras notas y primeros acordes.",
    bgImage: "https://images.unsplash.com/photo-1603661850942-3b922be12831?w=900&q=80",
  },
  {
    id: "tecnica",
    description: "Escalas, rasgueos, precisión, control y fluidez.",
    bgImage: "https://images.unsplash.com/photo-1579797990179-4ca11c8b47fd?w=900&q=80",
  },
  {
    id: "crea",
    description: "Canciones, composición y expresión propia.",
    bgImage: "https://images.unsplash.com/photo-1444623151656-030273ddb785?w=900&q=80",
  },
];

const FOCUS_TITLES: Record<AcademiaFocusId, Record<AcademiaTierId, string>> = {
  fundamento: {
    basico: "Fundamento Básico",
    intermedio: "Fundamento Intermedio",
    avanzado: "Fundamento Avanzado",
  },
  tecnica: {
    basico: "Técnica Básica",
    intermedio: "Técnica Intermedia",
    avanzado: "Técnica Avanzada",
  },
  crea: {
    basico: "Crea Básico",
    intermedio: "Crea Intermedio",
    avanzado: "Crea Avanzado",
  },
};

export function buildFocusTitle(focusId: AcademiaFocusId, tierId: AcademiaTierId): string {
  return FOCUS_TITLES[focusId][tierId];
}

export const ACADEMIA_TRACK_MATRIX: ReadonlyArray<AcademiaTrackCombination> = ACADEMIA_TIERS.flatMap(
  (tier) =>
    ACADEMIA_FOCUSES.map((focus) => ({
      tierId: tier.id,
      tierLabel: tier.label,
      tierSelectorLabel: tier.selectorLabel,
      focusId: focus.id,
      focusTitle: buildFocusTitle(focus.id, tier.id),
      description: focus.description,
      forWho: tier.forWho,
      duracion: tier.duracion,
      bgImage: focus.bgImage,
      freeClassAvailable: tier.id === "basico" && focus.id === "fundamento",
    }))
);

export function getTracksForTier(tierId: AcademiaTierId): AcademiaTrackCombination[] {
  return ACADEMIA_TRACK_MATRIX.filter((track) => track.tierId === tierId);
}

export function isFreeClassTrack(track: AcademiaTrackCombination): boolean {
  return track.freeClassAvailable;
}

export const PUBLIC_FREE_LESSON_PAGE = "fundamento-free-lesson";

export const DISABLED_PUBLIC_PATH_PAGES = [
  "fundamento-preview",
  "fundamento-path",
] as const;

export function isPublicFreeLessonPage(page: string): boolean {
  return page === PUBLIC_FREE_LESSON_PAGE || DISABLED_PUBLIC_PATH_PAGES.includes(page as typeof DISABLED_PUBLIC_PATH_PAGES[number]);
}
