import { DEMO_LESSONS, type DemoLesson } from "./demo-lessons";

/** Clases con video + ejercicio real (demo público). */
export const DEMO_FREE_LESSON_COUNT = 5;

/** Lecciones bloqueadas visibles en teaser (6–15). */
export const DEMO_TEASER_LOCKED_COUNT = 10;

/** Lecciones mostradas en carrusel demo (5 gratis + 10 teaser). */
export const DEMO_CAROUSEL_LESSON_COUNT =
  DEMO_FREE_LESSON_COUNT + DEMO_TEASER_LOCKED_COUNT;

/** Camino completo en academia (catálogo interno). */
export const DEMO_PATH_TOTAL_LESSONS = 75;

/** Clases adicionales no mostradas en carrusel (teaser numérico). */
export const DEMO_ACADEMY_MORE_COUNT =
  DEMO_PATH_TOTAL_LESSONS - DEMO_CAROUSEL_LESSON_COUNT;

export const DEMO_ACADEMY_TEASER_NODE_ID = "demo-academy-teaser";

const PATH_MODULES = [
  { name: "Fundamento", start: 1, end: 15 },
  { name: "Ritmo y pulso", start: 16, end: 30 },
  { name: "Acordes abiertos", start: 31, end: 45 },
  { name: "Técnica de mano", start: 46, end: 60 },
  { name: "Primer repertorio", start: 61, end: 75 },
] as const;

const MODULE_LABELS: Record<(typeof PATH_MODULES)[number]["name"], readonly string[]> = {
  Fundamento: [
    "Postura y calentamiento",
    "Digitación básica",
    "Lectura rítmica",
    "Patrones con púa",
    "Ejercicios de mano",
    "Tu primer acorde",
    "Segundo acorde",
    "Tu primer cambio",
    "Ritmo con acordes",
    "Acorde de Sol",
    "Tres acordes",
    "Acorde de Do",
    "Tu primer patrón",
    "Tu primera progresión",
    "🏆 El gran momento",
  ],
  "Ritmo y pulso": [
    "Metrónomo y pulso",
    "Subdivisiones",
    "Groove con púa",
    "Silencios y acentos",
    "Patrones en 4/4",
    "Shuffle básico",
    "Syncopación",
    "Ritmo con acordes",
    "Backing track guiado",
    "Fill rítmico",
    "Contar en compás",
    "Polirritmia intro",
    "Ejercicio de velocidad",
    "Groove en 3/4",
    "Pieza rítmica",
  ],
  "Acordes abiertos": [
    "Forma de Do mayor",
    "Forma de Sol mayor",
    "Forma de La menor",
    "Forma de Mi menor",
    "Cambios lentos",
    "Cambios con metrónomo",
    "Progresión I–V–vi–IV",
    "Rasgueo en acordes",
    "Arpegio de acordes",
    "Voicing alternativo",
    "Capo introductorio",
    "Transposición simple",
    "Acompañamiento pop",
    "Dúo acordes + melodía",
    "Pieza con acordes",
  ],
  "Técnica de mano": [
    "Calentamiento técnico",
    "Hammer-on y pull-off",
    "Slide controlado",
    "Bending intencional",
    "Vibrato básico",
    "Alternancia de púa",
    "Economía de movimiento",
    "Escalas en una cuerda",
    "Coordination drills",
    "Velocidad limpia",
    "Legato en trastes",
    "Tapping intro",
    "Palm mute",
    "Dinámica y articulación",
    "Etude técnico",
  ],
  "Primer repertorio": [
    "Melodía sencilla",
    "Acompañamiento base",
    "Intro de canción",
    "Estribillo guiado",
    "Puente y dinámica",
    "Arreglo fingerstyle",
    "Versión acústica",
    "Impro sobre forma",
    "Dúo con backing",
    "Transcripción corta",
    "Interpretación expresiva",
    "Grabación casera",
    "Ensamble virtual",
    "Concierto mini",
    "Pieza de cierre",
  ],
};

export interface DemoPathEntry {
  lessonNumber: number;
  title: string;
  subtitle: string;
  moduleName: string;
  videoDuration?: string;
  /** Tiene contenido jugable en demo-clase-N */
  isFree: boolean;
  /** Solo definido en las 5 gratuitas */
  lesson?: DemoLesson;
}

function moduleForLesson(n: number): string {
  const mod = PATH_MODULES.find((m) => n >= m.start && n <= m.end);
  return mod?.name ?? "Academia";
}

function lockedTitle(n: number, moduleName: string): string {
  const mod = PATH_MODULES.find((m) => m.name === moduleName);
  const indexInModule = n - (mod?.start ?? 1) + 1;
  const labels =
    MODULE_LABELS[moduleName as keyof typeof MODULE_LABELS] ?? MODULE_LABELS.Fundamento;
  const label = labels[Math.min(Math.max(indexInModule - 1, 0), labels.length - 1)] ?? "Lección";
  return `Clase ${n} · ${label}`;
}

const FREE_BY_NUMBER = new Map<number, DemoLesson>(
  DEMO_LESSONS.map((l) => [l.lessonNumber, l])
);

function buildEntry(n: number): DemoPathEntry {
  const freeLesson = FREE_BY_NUMBER.get(n);
  const moduleName = moduleForLesson(n);

  if (freeLesson) {
    return {
      lessonNumber: n,
      title: freeLesson.title,
      subtitle: freeLesson.subtitle,
      moduleName,
      videoDuration: freeLesson.videoDuration,
      isFree: true,
      lesson: freeLesson,
    };
  }

  return {
    lessonNumber: n,
    title: lockedTitle(n, moduleName),
    subtitle: `${moduleName} · Academia Gmusic`,
    moduleName,
    isFree: false,
  };
}

const CATALOG: DemoPathEntry[] = Array.from({ length: DEMO_PATH_TOTAL_LESSONS }, (_, i) =>
  buildEntry(i + 1)
);

export function getDemoPathEntry(lessonNumber: number): DemoPathEntry | undefined {
  return CATALOG[lessonNumber - 1];
}

export function getAllDemoPathEntries(): readonly DemoPathEntry[] {
  return CATALOG;
}

/** Entradas visibles en el carrusel demo (1–15). */
export function getCarouselDemoPathEntries(): readonly DemoPathEntry[] {
  return CATALOG.slice(0, DEMO_CAROUSEL_LESSON_COUNT);
}

export function isFreeDemoLesson(lessonNumber: number): boolean {
  return lessonNumber >= 1 && lessonNumber <= DEMO_FREE_LESSON_COUNT;
}

export function isTeaserLockedLesson(lessonNumber: number): boolean {
  return (
    lessonNumber > DEMO_FREE_LESSON_COUNT &&
    lessonNumber <= DEMO_CAROUSEL_LESSON_COUNT
  );
}

export function isSubscriptionLockedLesson(lessonNumber: number): boolean {
  return lessonNumber > DEMO_FREE_LESSON_COUNT && lessonNumber <= DEMO_PATH_TOTAL_LESSONS;
}
