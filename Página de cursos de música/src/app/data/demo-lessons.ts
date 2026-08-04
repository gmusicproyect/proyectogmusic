export interface PulsoBeat {
  stringNumber: number;
  label: string;
  stringName: string;
}

export type DemoExerciseKind =
  | { kind: "mcq"; question: string; options: { id: string; text: string }[]; correctId: string }
  | { kind: "ex1-cuerdas" }
  | {
      kind: "ex-pulso-aire";
      headline: string;
      description: string;
      sequence: readonly PulsoBeat[];
    };

export interface DemoLesson {
  lessonNumber: number;
  title: string;
  subtitle: string;
  objective: string;
  videoTitle: string;
  videoSubtitle: string;
  videoDuration: string;
  /**
   * URL de embed para el reproductor de video.
   * Usar formato https://www.youtube.com/embed/VIDEO_ID para YouTube.
   * TODO: Reemplazar por video propio de Gmusic antes de producción.
   */
  videoUrl: string;
  /**
   * Marca el origen del video. "youtube-example" = video temporal de ejemplo,
   * no producción oficial de Gmusic. "owned" = video propio final.
   */
  videoSource?: "youtube-example" | "owned";
  /** true mientras el video no sea el contenido oficial definitivo de Gmusic. */
  isPlaceholderVideo?: true;
  /** Guía PDF (Storage privado; requiere sesión para URL firmada). */
  guidePdfUrl?: string | null;
  exercise: DemoExerciseKind;
  completionMessage: string;
}

const PULSO_CUERDA_6: PulsoBeat = {
  stringNumber: 6,
  label: "6",
  stringName: "Mi grave",
};

const PULSO_CUERDA_5: PulsoBeat = {
  stringNumber: 5,
  label: "5",
  stringName: "La",
};

const PULSO_CUERDA_4: PulsoBeat = {
  stringNumber: 4,
  label: "4",
  stringName: "Re",
};

export const DEMO_LESSONS: readonly DemoLesson[] = [
  {
    lessonNumber: 1,
    title: "Conoce tu guitarra",
    subtitle: "Partes del instrumento y postura básica",
    objective: "Identifica las partes principales de la guitarra y adopta una postura cómoda.",
    videoTitle: "Tu guitarra y postura",
    videoSubtitle: "Partes del instrumento, apoyo y primer contacto",
    videoDuration: "7 min",
    videoUrl: "https://www.youtube.com/embed/0GImi8l53q0",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    guidePdfUrl:
      "https://tosbwmqijmtxchvcgrkj.supabase.co/storage/v1/object/clases-pdf/tu-guitarra-y-postura.pdf",
    exercise: {
      kind: "mcq",
      question: "¿Cómo se llama la parte superior del mástil donde van las clavijas?",
      options: [
        { id: "headstock", text: "La cabeza (clavijero)" },
        { id: "body", text: "El cuerpo (caja resonante)" },
        { id: "bridge", text: "El puente" },
        { id: "nut", text: "El cejillo" },
      ],
      correctId: "headstock",
    },
    completionMessage: "Ya conoces las partes básicas de tu guitarra.",
  },
  {
    lessonNumber: 2,
    title: "Afina tu guitarra",
    subtitle: "Afinación estándar y referencia de cuerdas",
    objective: "Comprende la afinación estándar E-A-D-G-B-e sin usar afinador todavía.",
    videoTitle: "Afinación estándar",
    videoSubtitle: "Referencia de notas y orden de las 6 cuerdas",
    videoDuration: "8 min",
    videoUrl: "https://www.youtube.com/embed/s-XnaDpYXw4",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "mcq",
      question: "¿Qué nota suena la cuerda 6, la más gruesa, en afinación estándar?",
      options: [
        { id: "e_mi", text: "Mi (E)" },
        { id: "a_la", text: "La (A)" },
        { id: "d_re", text: "Re (D)" },
        { id: "g_sol", text: "Sol (G)" },
      ],
      correctId: "e_mi",
    },
    completionMessage: "Ya conoces la referencia de afinación estándar.",
  },
  {
    lessonNumber: 3,
    title: "Cuerdas al aire",
    subtitle: "Los 6 sonidos fundamentales de la guitarra",
    objective: "Reconoce las notas de las 6 cuerdas al aire, sin pisar trastes.",
    videoTitle: "Las 6 cuerdas al aire",
    videoSubtitle: "Nombres, orden y sonido de cada cuerda",
    videoDuration: "8 min",
    // TODO: Mismo embed que Clase 2 — reemplazar por video propio de cuerdas al aire antes de producción.
    videoUrl: "https://www.youtube.com/embed/s-XnaDpYXw4",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: { kind: "ex1-cuerdas" },
    completionMessage: "Reconoces las 6 cuerdas de tu guitarra.",
  },
  {
    lessonNumber: 4,
    title: "Pulso con cuerdas al aire",
    subtitle: "Seguir una guía rítmica simple",
    objective: "Marca el pulso tocando la cuerda 6 al aire, a tu ritmo.",
    videoTitle: "Pulso y guía de cuerdas",
    videoSubtitle: "Ritmo básico tocando cuerdas al aire",
    videoDuration: "6 min",
    videoUrl: "https://www.youtube.com/embed/wsnqgfaqYEE",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "ex-pulso-aire",
      headline: "Pulso en cuerda 6",
      description:
        "Toca la cuerda 6 al aire en cada TAP. Ve a tu ritmo — no hay metrónomo.",
      sequence: Array.from({ length: 8 }, () => PULSO_CUERDA_6),
    },
    completionMessage: "Ya puedes marcar pulso con la cuerda 6 al aire.",
  },
  {
    lessonNumber: 5,
    title: "Tu primera canción con cuerdas al aire",
    subtitle: "Mini secuencia con cuerdas 6, 5 y 4",
    objective: "Sigue la mini secuencia 6–6–6 / 5–5–5 / 4–4–5–6 con TAP manual.",
    videoTitle: "Tu primera mini canción",
    videoSubtitle: "Secuencia guiada solo con cuerdas al aire",
    videoDuration: "10 min",
    videoUrl: "https://www.youtube.com/embed/uZZsSol656w",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "ex-pulso-aire",
      headline: "Mini canción · cuerdas 6, 5 y 4",
      description:
        "Un TAP por nota. Sigue la secuencia: 6 6 6 — 5 5 5 — 4 4 5 6.",
      sequence: [
        PULSO_CUERDA_6,
        PULSO_CUERDA_6,
        PULSO_CUERDA_6,
        PULSO_CUERDA_5,
        PULSO_CUERDA_5,
        PULSO_CUERDA_5,
        PULSO_CUERDA_4,
        PULSO_CUERDA_4,
        PULSO_CUERDA_5,
        PULSO_CUERDA_6,
      ],
    },
    completionMessage: "Completaste tu primer camino con cuerdas al aire.",
  },
] as const;
