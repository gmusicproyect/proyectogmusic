export type DemoExerciseKind =
  | { kind: "mcq"; question: string; options: { id: string; text: string }[]; correctId: string }
  | { kind: "ex1-cuerdas" }
  | { kind: "ex4-calidad-acorde" }
  | { kind: "ex5-secuencia" };

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
  exercise: DemoExerciseKind;
  completionMessage: string;
}

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
    objective: "Identifica qué cuerda tocar cuando la guía indica un número de cuerda.",
    videoTitle: "Pulso y guía de cuerdas",
    videoSubtitle: "Ritmo básico tocando cuerdas al aire",
    videoDuration: "6 min",
    videoUrl: "https://www.youtube.com/embed/wsnqgfaqYEE",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "mcq",
      question: "Si la guía indica cuerda 6, ¿qué cuerda debes tocar?",
      options: [
        { id: "e6", text: "Mi grave (6)" },
        { id: "e1", text: "Mi agudo (1)" },
        { id: "string3", text: "Sol (3)" },
        { id: "string4", text: "Re (4)" },
      ],
      correctId: "e6",
    },
    completionMessage: "Ya puedes seguir una guía simple de cuerdas al aire.",
  },
  {
    lessonNumber: 5,
    title: "Tu primera canción con cuerdas al aire",
    subtitle: "Mini secuencia con cuerdas 6, 5 y 4",
    objective: "Lee una secuencia sencilla de cuerdas al aire como primer reto musical.",
    videoTitle: "Tu primera mini canción",
    videoSubtitle: "Secuencia guiada solo con cuerdas al aire",
    videoDuration: "10 min",
    videoUrl: "https://www.youtube.com/embed/uZZsSol656w",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "mcq",
      question:
        "¿Qué cuerdas usa esta mini canción: 6 6 — 6 / 5 5 — 5 / 4 4 5 6?",
      options: [
        { id: "s654", text: "Cuerdas 6, 5 y 4" },
        { id: "s123", text: "Cuerdas 1, 2 y 3" },
        { id: "s456", text: "Cuerdas 4, 5 y 6" },
        { id: "s345", text: "Cuerdas 3, 4 y 5" },
      ],
      correctId: "s654",
    },
    completionMessage: "Completaste tu primer camino con cuerdas al aire.",
  },
] as const;
