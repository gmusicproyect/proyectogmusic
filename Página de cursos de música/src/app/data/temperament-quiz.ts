export type TemperamentId = "sanguine" | "choleric" | "melancholic" | "phlegmatic";
export type QuizOptionId = "a" | "b" | "c" | "d";

export interface QuizOption {
  id: QuizOptionId;
  text: string;
  temperament: TemperamentId;
}

export interface QuizQuestion {
  id: number;
  situation: string;
  options: QuizOption[];
}

export interface QuestionEvent {
  question_id: number;
  selected_option: QuizOptionId;
  temperament_tag: TemperamentId;
  time_ms: number;
  answer_changes: number;
}

export interface TemperamentScores {
  sanguine: number;
  choleric: number;
  melancholic: number;
  phlegmatic: number;
}

export interface TemperamentQuizResult {
  session_id: string;
  calculated_temperament: TemperamentId;
  scores: TemperamentScores;
  is_tie: boolean;
  total_duration_ms: number;
  total_answer_changes: number;
  question_events: QuestionEvent[];
  completed_at: string;
  instrument_slug: string | null;
}

export const TIE_BREAK_ORDER: TemperamentId[] = [
  "sanguine",
  "choleric",
  "melancholic",
  "phlegmatic",
];

export const TEMPERAMENT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    situation: "Llegas a una clase nueva de guitarra. ¿Qué haces primero?",
    options: [
      { id: "a", text: "Saludo a todos y pregunto cuándo empezamos a tocar", temperament: "sanguine" },
      { id: "b", text: "Pregunto cuál es el plan de la clase y qué voy a lograr hoy", temperament: "choleric" },
      { id: "c", text: "Observo el espacio, la guitarra del profe y cómo están organizados", temperament: "melancholic" },
      { id: "d", text: "Me siento, respiro y espero que el profe explique con calma", temperament: "phlegmatic" },
    ],
  },
  {
    id: 2,
    situation: "Un ejercicio te cuesta más de lo esperado. ¿Cómo reaccionas?",
    options: [
      { id: "a", text: "Lo intento de nuevo al tiro, con otra energía", temperament: "sanguine" },
      { id: "b", text: "Lo repito hasta dominarlo, sin importar el tiempo", temperament: "choleric" },
      { id: "c", text: "Busco entender por qué no me sale antes de seguir", temperament: "melancholic" },
      { id: "d", text: "Bajo el ritmo y practico despacio, sin presión", temperament: "phlegmatic" },
    ],
  },
  {
    id: 3,
    situation: "¿Qué te empuja más a seguir aprendiendo guitarra?",
    options: [
      { id: "a", text: "Tocar algo que suene bien y compartirlo con otros", temperament: "sanguine" },
      { id: "b", text: "Ver que avanzo y cumplo mis metas semana a semana", temperament: "choleric" },
      { id: "c", text: "Entender la música y sentir que mejoro de verdad", temperament: "melancholic" },
      { id: "d", text: "Tener una rutina tranquila que pueda sostener en el tiempo", temperament: "phlegmatic" },
    ],
  },
  {
    id: 4,
    situation: "Tienes 20 minutos libres para practicar. ¿Qué haces?",
    options: [
      { id: "a", text: "Toco lo que más me divierte, aunque no sea lo del curso", temperament: "sanguine" },
      { id: "b", text: "Sigo el plan del curso, punto por punto", temperament: "choleric" },
      { id: "c", text: "Repaso lo que me costó y anoto qué mejorar", temperament: "melancholic" },
      { id: "d", text: "Practico lo mismo de siempre, sin apuro", temperament: "phlegmatic" },
    ],
  },
  {
    id: 5,
    situation: "El profe te corrige algo que haces mal. ¿Cómo lo vives?",
    options: [
      { id: "a", text: "Me río, lo intento de nuevo y sigo con buena onda", temperament: "sanguine" },
      { id: "b", text: "Lo tomo como reto y lo corrijo en el acto", temperament: "choleric" },
      { id: "c", text: "Me quedo pensando en el detalle hasta entenderlo", temperament: "melancholic" },
      { id: "d", text: "Escucho, agradezco y lo aplico sin drama", temperament: "phlegmatic" },
    ],
  },
  {
    id: 6,
    situation: "¿Qué te gustaría poder decir en 3 meses?",
    options: [
      { id: "a", text: "Toco progresiones que me gustan y se lo muestro a mi familia", temperament: "sanguine" },
      { id: "b", text: "Completé mi primer módulo y sé exactamente qué sigue", temperament: "choleric" },
      { id: "c", text: "Entiendo lo que toco y por qué suena así", temperament: "melancholic" },
      { id: "d", text: "Practico seguido y no abandoné", temperament: "phlegmatic" },
    ],
  },
];

export function emptyScores(): TemperamentScores {
  return { sanguine: 0, choleric: 0, melancholic: 0, phlegmatic: 0 };
}

export function scoreFromEvents(events: QuestionEvent[]): TemperamentScores {
  const scores = emptyScores();
  for (const event of events) {
    scores[event.temperament_tag] += 1;
  }
  return scores;
}

export function calculateTemperament(scores: TemperamentScores): {
  calculated_temperament: TemperamentId;
  is_tie: boolean;
} {
  const max = Math.max(...TIE_BREAK_ORDER.map((id) => scores[id]));
  const leaders = TIE_BREAK_ORDER.filter((id) => scores[id] === max);
  return {
    calculated_temperament: leaders[0],
    is_tie: leaders.length > 1,
  };
}

export function buildQuizResult(params: {
  sessionId: string;
  events: QuestionEvent[];
  totalDurationMs: number;
  instrumentSlug: string | null;
}): TemperamentQuizResult {
  const scores = scoreFromEvents(params.events);
  const { calculated_temperament, is_tie } = calculateTemperament(scores);
  const totalAnswerChanges = params.events.reduce(
    (sum, event) => sum + event.answer_changes,
    0
  );

  return {
    session_id: params.sessionId,
    calculated_temperament,
    scores,
    is_tie,
    total_duration_ms: params.totalDurationMs,
    total_answer_changes: totalAnswerChanges,
    question_events: params.events,
    completed_at: new Date().toISOString(),
    instrument_slug: params.instrumentSlug,
  };
}
