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
    objective: "Identifica las partes de la guitarra y adopta la postura correcta.",
    videoTitle: "Tu guitarra y postura",
    videoSubtitle: "Partes del instrumento, apoyo y primer contacto",
    videoDuration: "7 min",
    videoUrl: "https://www.youtube.com/embed/0GImi8l53q0",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "mcq",
      question: "¿Qué parte de la guitarra se apoya sobre tu pierna al sentarte?",
      options: [
        { id: "body", text: "El cuerpo (caja resonante)" },
        { id: "neck", text: "El mástil" },
        { id: "headstock", text: "La cabeza" },
        { id: "bridge", text: "El puente" },
      ],
      correctId: "body",
    },
    completionMessage: "Ya conoces tu instrumento.",
  },
  {
    lessonNumber: 2,
    title: "Cuerdas al aire",
    subtitle: "Los 6 sonidos fundamentales de la guitarra",
    objective: "Conoce las 6 cuerdas, sus nombres y cómo tocarlas.",
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
    lessonNumber: 3,
    title: "Primer lenguaje musical",
    subtitle: "Nota, traste, digitación, ritmo y pulso",
    objective: "Aprende las palabras clave del lenguaje musical de la guitarra.",
    videoTitle: "Tu vocabulario musical",
    videoSubtitle: "Nota, cuerda, traste, digitación, ritmo, pulso",
    videoDuration: "6 min",
    videoUrl: "https://www.youtube.com/embed/wsnqgfaqYEE",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: {
      kind: "mcq",
      question: "¿Cómo se llaman las barras metálicas verticales que dividen el mástil?",
      options: [
        { id: "frets", text: "Trastes" },
        { id: "strings", text: "Cuerdas" },
        { id: "notes", text: "Notas" },
        { id: "digits", text: "Digitaciones" },
      ],
      correctId: "frets",
    },
    completionMessage: "Ya hablas el idioma de la guitarra.",
  },
  {
    lessonNumber: 4,
    title: "Notas y sostenidos",
    subtitle: "Ubicación en el mástil, notas naturales y alteraciones",
    objective: "Distingue notas naturales y alteradas, y ubícalas en el mástil.",
    videoTitle: "El mástil y las notas",
    videoSubtitle: "Notas naturales, sostenidos y ubicación básica",
    videoDuration: "9 min",
    videoUrl: "https://www.youtube.com/embed/FRp9OgW2HhI",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: { kind: "ex4-calidad-acorde" },
    completionMessage: "Reconoces acordes mayores y menores.",
  },
  {
    lessonNumber: 5,
    title: "Primeros acordes",
    subtitle: "La diferencia entre mayor y menor — tu primer reto práctico",
    objective: "Completa tu primer reto musical: Am y Em en secuencia.",
    videoTitle: "Am y Em — tus primeros acordes",
    videoSubtitle: "Formación, calidad y cambio entre acordes básicos",
    videoDuration: "10 min",
    videoUrl: "https://www.youtube.com/embed/uZZsSol656w",
    videoSource: "youtube-example",
    isPlaceholderVideo: true,
    exercise: { kind: "ex5-secuencia" },
    completionMessage: "Completaste tu primer camino musical.",
  },
] as const;
