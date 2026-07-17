/**
 * P0-02 — Onboarding diagnóstico H1.
 * Selector de entrada/ritmo/objetivo; NO genera currículos.
 * profileId = userId (puente temporal D-DOM-001). Sin tabla Profile.
 */
import { ApiError } from "./errors.js";
import {
  getProfileProjectionH1,
  upsertProfileProjectionH1,
  type ProfileProjectionH1,
} from "./profileProjectionH1Store.js";
import { assertProfileAccess, toProfileId } from "./learnerContextH1.js";
import {
  RUTA_GUITARRA_FUNDAMENTOS_SLUG,
  RUTA_MVP_VERSION,
  mesIdOf,
  rutaIdOf,
  tarjetaIdOf,
  unidadIdOf,
} from "./rutaFtcDomainH1.js";

export type LearningGoalH1 =
  | "play_songs"
  | "solid_basics"
  | "technique"
  | "create_improv";

export type ExperienceLevelH1 = "beginner" | "some" | "comfortable";

export type OnboardingStatusH1 =
  | "not_started"
  | "in_progress"
  | "completed"
  | "needs_review";

export type OnboardingAnswersH1 = {
  instrument: string;
  learningGoal: LearningGoalH1;
  experienceLevel: ExperienceLevelH1;
  weeklyGoalMinutes: number;
  /** Mes confirmado en Q5 (1..3 MVP). Si omitido → default mapping. */
  confirmedMonth?: number | null;
  /** true si el alumno confirma saltar al mes sugerido (some→M2, comfortable→M2/M3). */
  confirmPlacement?: boolean;
  profileId?: string;
};

export type PartialOnboardingAnswersH1 = Partial<OnboardingAnswersH1> & {
  step?: number;
};

export type OnboardingResultH1 = {
  profileId: string;
  instrument: "guitarra";
  learningGoal: LearningGoalH1;
  experienceLevel: ExperienceLevelH1;
  weeklyGoalMinutes: number;
  activeRutaSlug: string;
  activeRutaVersion: number;
  currentMonth: number;
  firstUnitId: string;
  nextCardId: string | null;
  onboardingStatus: "completed";
  onboardingCompletedAt: string;
  answersRaw: OnboardingAnswersH1;
};

const LEARNING_GOALS = new Set<LearningGoalH1>([
  "play_songs",
  "solid_basics",
  "technique",
  "create_improv",
]);

const EXPERIENCE_LEVELS = new Set<ExperienceLevelH1>([
  "beginner",
  "some",
  "comfortable",
]);

const WEEKLY_GOAL_OPTIONS = new Set([30, 60, 90, 120]);

export const RUTA_GUITARRA_FUNDAMENTOS = RUTA_GUITARRA_FUNDAMENTOS_SLUG;
export const RUTA_VERSION_MVP = RUTA_MVP_VERSION;

/**
 * IDs canónicos dominio P0-03 (reemplazan stubs temporales m{N}-u1*).
 * Aún no hay seeds DB; solo identificadores estables de dominio.
 */
export function stubFirstUnitId(month: number): string {
  const mesId = mesIdOf(rutaIdOf(RUTA_GUITARRA_FUNDAMENTOS, RUTA_VERSION_MVP), month);
  return unidadIdOf(mesId, 1);
}

export function stubNextCardId(month: number): string {
  return tarjetaIdOf(stubFirstUnitId(month), 1);
}

/**
 * Mapping §7: experiencia → mes sugerido.
 * Default seguro M1. Cap MVP = M3. Nunca >3.
 */
export function suggestMonthH1(
  experienceLevel: ExperienceLevelH1,
  confirmPlacement: boolean
): number {
  if (experienceLevel === "beginner") return 1;
  if (experienceLevel === "some") {
    return confirmPlacement ? 2 : 1;
  }
  // comfortable
  return confirmPlacement ? 2 : 1;
}

/**
 * Resuelve mes final tras Q5.
 * - confirmedMonth gana si 1..3 y válido
 * - sin confirmación de placement → M1 (salvo beginner ya M1)
 * - nunca >3
 */
export function resolveCurrentMonthH1(input: {
  experienceLevel: ExperienceLevelH1;
  confirmedMonth?: number | null;
  confirmPlacement?: boolean;
}): number {
  const suggested = suggestMonthH1(
    input.experienceLevel,
    Boolean(input.confirmPlacement)
  );

  if (
    typeof input.confirmedMonth === "number" &&
    Number.isInteger(input.confirmedMonth)
  ) {
    if (input.confirmedMonth < 1 || input.confirmedMonth > 3) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "currentMonth MVP debe estar entre 1 y 3."
      );
    }
    // Subir de mes nunca automático sin confirmación
    if (input.confirmedMonth > 1 && !input.confirmPlacement) {
      return 1;
    }
    return input.confirmedMonth;
  }

  return suggested;
}

export function parseOnboardingAnswersH1(body: unknown): OnboardingAnswersH1 {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "VALIDATION_ERROR", "Body de onboarding inválido.");
  }
  const raw = body as Record<string, unknown>;

  const instrument =
    typeof raw.instrument === "string" ? raw.instrument.trim().toLowerCase() : "";
  if (!instrument) {
    throw new ApiError(400, "VALIDATION_ERROR", "instrument requerido.");
  }

  const learningGoal = raw.learningGoal;
  if (typeof learningGoal !== "string" || !LEARNING_GOALS.has(learningGoal as LearningGoalH1)) {
    throw new ApiError(400, "VALIDATION_ERROR", "learningGoal inválido.");
  }

  const experienceLevel = raw.experienceLevel;
  if (
    typeof experienceLevel !== "string" ||
    !EXPERIENCE_LEVELS.has(experienceLevel as ExperienceLevelH1)
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "experienceLevel inválido.");
  }

  let weeklyGoalMinutes = 90;
  if (raw.weeklyGoalMinutes !== undefined && raw.weeklyGoalMinutes !== null) {
    if (
      typeof raw.weeklyGoalMinutes !== "number" ||
      !WEEKLY_GOAL_OPTIONS.has(raw.weeklyGoalMinutes)
    ) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "weeklyGoalMinutes debe ser 30, 60, 90 o 120."
      );
    }
    weeklyGoalMinutes = raw.weeklyGoalMinutes;
  }

  const confirmedMonth =
    raw.confirmedMonth === undefined || raw.confirmedMonth === null
      ? null
      : raw.confirmedMonth;
  if (
    confirmedMonth !== null &&
    (typeof confirmedMonth !== "number" || !Number.isInteger(confirmedMonth))
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", "confirmedMonth inválido.");
  }

  const confirmPlacement = Boolean(raw.confirmPlacement);
  const profileId =
    typeof raw.profileId === "string" ? raw.profileId : undefined;

  return {
    instrument,
    learningGoal: learningGoal as LearningGoalH1,
    experienceLevel: experienceLevel as ExperienceLevelH1,
    weeklyGoalMinutes,
    confirmedMonth,
    confirmPlacement,
    profileId,
  };
}

export function buildOnboardingResultH1(
  profileId: string,
  answers: OnboardingAnswersH1
): OnboardingResultH1 {
  if (answers.instrument !== "guitarra") {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Solo Guitarra está disponible en H1 MVP (instrumento no disponible)."
    );
  }

  const currentMonth = resolveCurrentMonthH1({
    experienceLevel: answers.experienceLevel,
    confirmedMonth: answers.confirmedMonth,
    confirmPlacement: answers.confirmPlacement,
  });

  return {
    profileId,
    instrument: "guitarra",
    learningGoal: answers.learningGoal,
    experienceLevel: answers.experienceLevel,
    weeklyGoalMinutes: answers.weeklyGoalMinutes,
    activeRutaSlug: RUTA_GUITARRA_FUNDAMENTOS,
    activeRutaVersion: RUTA_VERSION_MVP,
    currentMonth,
    firstUnitId: stubFirstUnitId(currentMonth),
    nextCardId: stubNextCardId(currentMonth),
    onboardingStatus: "completed",
    onboardingCompletedAt: new Date().toISOString(),
    answersRaw: answers,
  };
}

export function getOnboardingStateH1(profileId: string): {
  status: OnboardingStatusH1;
  partialAnswers: PartialOnboardingAnswersH1 | null;
  result: OnboardingResultH1 | null;
  projection: ProfileProjectionH1 | null;
} {
  const projection = getProfileProjectionH1(profileId);
  if (!projection) {
    return {
      status: "not_started",
      partialAnswers: null,
      result: null,
      projection: null,
    };
  }
  return {
    status: projection.onboardingStatus,
    partialAnswers: projection.partialAnswers,
    result: projection.result,
    projection,
  };
}

export function savePartialOnboardingH1(
  sessionUserId: string,
  body: unknown
): ProfileProjectionH1 {
  const profileId = toProfileId(sessionUserId);
  if (
    body &&
    typeof body === "object" &&
    "profileId" in body &&
    typeof (body as { profileId?: unknown }).profileId === "string"
  ) {
    assertProfileAccess(sessionUserId, (body as { profileId: string }).profileId);
  }

  const partial =
    body && typeof body === "object"
      ? (body as PartialOnboardingAnswersH1)
      : {};

  const prev = getProfileProjectionH1(profileId);
  if (prev?.onboardingStatus === "completed") {
    throw new ApiError(
      409,
      "VALIDATION_ERROR",
      "Onboarding ya completado; usa PATCH /me/profile para meta/goal."
    );
  }

  return upsertProfileProjectionH1(profileId, {
    onboardingStatus: "in_progress",
    partialAnswers: { ...prev?.partialAnswers, ...partial },
  });
}

export function completeOnboardingH1(
  sessionUserId: string,
  body: unknown
): { result: OnboardingResultH1; projection: ProfileProjectionH1 } {
  const answers = parseOnboardingAnswersH1(body);
  const profileId = toProfileId(sessionUserId);

  if (answers.profileId) {
    assertProfileAccess(sessionUserId, answers.profileId);
  }

  try {
    const result = buildOnboardingResultH1(profileId, answers);
    const projection = upsertProfileProjectionH1(profileId, {
      onboardingStatus: "completed",
      partialAnswers: null,
      result,
      learningGoalOverride: null,
      weeklyGoalMinutesOverride: null,
    });
    return { result, projection };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      upsertProfileProjectionH1(profileId, {
        onboardingStatus: "needs_review",
        partialAnswers: answers,
      });
    }
    throw error;
  }
}

export function patchProfileSettingsH1(
  sessionUserId: string,
  body: unknown
): ProfileProjectionH1 {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "VALIDATION_ERROR", "Body inválido.");
  }
  const raw = body as Record<string, unknown>;
  if (typeof raw.profileId === "string") {
    assertProfileAccess(sessionUserId, raw.profileId);
  }

  const profileId = toProfileId(sessionUserId);
  const prev = getProfileProjectionH1(profileId);
  if (!prev?.result || prev.onboardingStatus !== "completed") {
    throw new ApiError(
      409,
      "VALIDATION_ERROR",
      "Completa el onboarding antes de editar meta/goal."
    );
  }

  let learningGoalOverride = prev.learningGoalOverride;
  let weeklyGoalMinutesOverride = prev.weeklyGoalMinutesOverride;

  if (raw.learningGoal !== undefined) {
    if (
      typeof raw.learningGoal !== "string" ||
      !LEARNING_GOALS.has(raw.learningGoal as LearningGoalH1)
    ) {
      throw new ApiError(400, "VALIDATION_ERROR", "learningGoal inválido.");
    }
    learningGoalOverride = raw.learningGoal as LearningGoalH1;
  }

  if (raw.weeklyGoalMinutes !== undefined) {
    if (
      typeof raw.weeklyGoalMinutes !== "number" ||
      !WEEKLY_GOAL_OPTIONS.has(raw.weeklyGoalMinutes)
    ) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "weeklyGoalMinutes debe ser 30, 60, 90 o 120."
      );
    }
    weeklyGoalMinutesOverride = raw.weeklyGoalMinutes;
  }

  const nextResult: OnboardingResultH1 = {
    ...prev.result,
    learningGoal: learningGoalOverride ?? prev.result.learningGoal,
    weeklyGoalMinutes:
      weeklyGoalMinutesOverride ?? prev.result.weeklyGoalMinutes,
  };

  return upsertProfileProjectionH1(profileId, {
    learningGoalOverride,
    weeklyGoalMinutesOverride,
    result: nextResult,
  });
}
