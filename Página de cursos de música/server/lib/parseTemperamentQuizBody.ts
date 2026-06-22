import { TemperamentType } from "@prisma/client";
import { ApiError } from "./errors.js";

const TEMPERAMENT_IDS = new Set<string>([
  TemperamentType.sanguine,
  TemperamentType.choleric,
  TemperamentType.melancholic,
  TemperamentType.phlegmatic,
]);

const OPTION_IDS = new Set(["a", "b", "c", "d"]);

export interface TemperamentQuizSubmission {
  sessionId: string;
  calculatedTemperament: TemperamentType;
  scores: Record<TemperamentType, number>;
  isTie: boolean;
  totalDurationMs: number;
  totalAnswerChanges: number;
  questionsAnswered: number;
  questionEvents: Array<{
    question_id: number;
    selected_option: string;
    temperament_tag: TemperamentType;
    time_ms: number;
    answer_changes: number;
  }>;
  instrumentSlug: string | null;
  referrerPath: string | null;
  completedAt: Date;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readTemperamentScores(value: unknown): Record<TemperamentType, number> {
  if (!isPlainObject(value)) {
    throw new ApiError(400, "VALIDATION_ERROR", "scores debe ser un objeto.");
  }

  const scores = {} as Record<TemperamentType, number>;
  for (const temperament of TEMPERAMENT_IDS) {
    const raw = value[temperament];
    if (typeof raw !== "number" || !Number.isFinite(raw) || raw < 0) {
      throw new ApiError(400, "VALIDATION_ERROR", `scores.${temperament} inválido.`);
    }
    scores[temperament as TemperamentType] = Math.trunc(raw);
  }

  return scores;
}

function readQuestionEvents(value: unknown): TemperamentQuizSubmission["questionEvents"] {
  if (!Array.isArray(value) || value.length !== 6) {
    throw new ApiError(400, "VALIDATION_ERROR", "question_events debe tener 6 entradas.");
  }

  return value.map((entry, index) => {
    if (!isPlainObject(entry)) {
      throw new ApiError(400, "VALIDATION_ERROR", "question_events inválido.");
    }

    const questionId = entry.question_id;
    const selectedOption = entry.selected_option;
    const temperamentTag = entry.temperament_tag;
    const timeMs = entry.time_ms;
    const answerChanges = entry.answer_changes;

    if (typeof questionId !== "number" || questionId !== index + 1) {
      throw new ApiError(400, "VALIDATION_ERROR", "question_id fuera de secuencia.");
    }
    if (typeof selectedOption !== "string" || !OPTION_IDS.has(selectedOption)) {
      throw new ApiError(400, "VALIDATION_ERROR", "selected_option inválido.");
    }
    if (typeof temperamentTag !== "string" || !TEMPERAMENT_IDS.has(temperamentTag)) {
      throw new ApiError(400, "VALIDATION_ERROR", "temperament_tag inválido.");
    }
    if (typeof timeMs !== "number" || !Number.isFinite(timeMs) || timeMs < 0) {
      throw new ApiError(400, "VALIDATION_ERROR", "time_ms inválido.");
    }
    if (
      typeof answerChanges !== "number" ||
      !Number.isFinite(answerChanges) ||
      answerChanges < 0
    ) {
      throw new ApiError(400, "VALIDATION_ERROR", "answer_changes inválido.");
    }

    return {
      question_id: questionId,
      selected_option: selectedOption,
      temperament_tag: temperamentTag as TemperamentType,
      time_ms: Math.trunc(timeMs),
      answer_changes: Math.trunc(answerChanges),
    };
  });
}

export function parseTemperamentQuizBody(body: unknown): TemperamentQuizSubmission {
  if (!isPlainObject(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Body JSON inválido.");
  }

  const sessionId = body.session_id;
  if (typeof sessionId !== "string" || sessionId.trim().length < 8) {
    throw new ApiError(400, "VALIDATION_ERROR", "session_id inválido.");
  }

  const calculatedTemperament = body.calculated_temperament;
  if (
    typeof calculatedTemperament !== "string" ||
    !TEMPERAMENT_IDS.has(calculatedTemperament)
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "calculated_temperament inválido.");
  }

  if (typeof body.is_tie !== "boolean") {
    throw new ApiError(400, "VALIDATION_ERROR", "is_tie debe ser boolean.");
  }

  const totalDurationMs = body.total_duration_ms;
  if (
    typeof totalDurationMs !== "number" ||
    !Number.isFinite(totalDurationMs) ||
    totalDurationMs < 0
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "total_duration_ms inválido.");
  }

  const totalAnswerChanges = body.total_answer_changes;
  if (
    typeof totalAnswerChanges !== "number" ||
    !Number.isFinite(totalAnswerChanges) ||
    totalAnswerChanges < 0
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "total_answer_changes inválido.");
  }

  const questionsAnswered = body.questions_answered ?? 6;
  if (questionsAnswered !== 6) {
    throw new ApiError(400, "VALIDATION_ERROR", "questions_answered debe ser 6.");
  }

  const completedAtRaw = body.completed_at;
  const completedAt =
    typeof completedAtRaw === "string" ? new Date(completedAtRaw) : new Date();
  if (Number.isNaN(completedAt.getTime())) {
    throw new ApiError(400, "VALIDATION_ERROR", "completed_at inválido.");
  }

  const instrumentSlug =
    body.instrument_slug === null || body.instrument_slug === undefined
      ? null
      : typeof body.instrument_slug === "string"
        ? body.instrument_slug.trim() || null
        : null;

  const referrerPath =
    body.referrer_path === null || body.referrer_path === undefined
      ? null
      : typeof body.referrer_path === "string"
        ? body.referrer_path.trim() || null
        : null;

  return {
    sessionId: sessionId.trim(),
    calculatedTemperament: calculatedTemperament as TemperamentType,
    scores: readTemperamentScores(body.scores),
    isTie: body.is_tie,
    totalDurationMs: Math.trunc(totalDurationMs),
    totalAnswerChanges: Math.trunc(totalAnswerChanges),
    questionsAnswered: 6,
    questionEvents: readQuestionEvents(body.question_events),
    instrumentSlug,
    referrerPath,
    completedAt,
  };
}
