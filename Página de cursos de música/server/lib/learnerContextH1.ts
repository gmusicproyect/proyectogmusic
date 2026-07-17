/**
 * P0-01 / D-DOM-001 — puente H1 (temporal).
 * profileId === userId hasta mandato H2 (tabla Profile).
 * No crear tabla Profile ni cambiar FKs en esta fase.
 * P0-02: campos pedagógicos vienen de profileProjectionH1Store (sin schema).
 */
import type { AccountTier, Role, User } from "@prisma/client";
import { ApiError } from "./errors.js";
import { getProfileProjectionH1 } from "./profileProjectionH1Store.js";

/** H1: profileId = userId (puente temporal, D-DOM-001). */
export function toProfileId(userId: string): string {
  return userId;
}

/** H1: accountId = userId (User = Cuenta). */
export function toAccountId(userId: string): string {
  return userId;
}

export type LearnerContextH1 = {
  accountId: string;
  profileId: string;
  email: string;
  displayName: string;
  role: Role;
  accountTier: AccountTier;
  /** Pedagógico — P0-02 onboarding vía proyección H1 (store, sin tabla Profile). */
  instrument: string | null;
  currentMonth: number | null;
  weeklyGoalMinutes: number | null;
  activeRutaSlug: string | null;
  activeRutaVersion: number | null;
  onboardingCompleted: boolean;
  /** P0-02: firstUnit stub hasta P0-03. */
  firstUnitId: string | null;
  nextCardId: string | null;
  learningGoal: string | null;
};

/**
 * Resuelve el contexto de alumno bajo H1.
 * Cuenta = User; Perfil = proyección 1:1 (profileId = userId).
 * Consumidores futuros: siempre partir de aquí (no inventar IDs).
 */
export function resolveLearnerContext(user: User): LearnerContextH1 {
  // H1: profileId === userId (temporal, D-DOM-001)
  const profileId = toProfileId(user.id);
  const projection = getProfileProjectionH1(profileId);
  const result = projection?.result ?? null;
  const completed = projection?.onboardingStatus === "completed" && result !== null;

  return {
    accountId: toAccountId(user.id),
    profileId,
    email: user.email,
    displayName: user.name,
    role: user.role,
    accountTier: user.accountTier,
    instrument: result?.instrument ?? null,
    currentMonth: result?.currentMonth ?? null,
    weeklyGoalMinutes: result
      ? (projection?.weeklyGoalMinutesOverride ?? result.weeklyGoalMinutes)
      : null,
    activeRutaSlug: result?.activeRutaSlug ?? null,
    activeRutaVersion: result?.activeRutaVersion ?? null,
    onboardingCompleted: completed,
    firstUnitId: result?.firstUnitId ?? null,
    nextCardId: result?.nextCardId ?? null,
    learningGoal: result
      ? (projection?.learningGoalOverride ?? result.learningGoal)
      : null,
  };
}

export type ImplicitProfileH1 = {
  id: string;
  accountId: string;
  displayName: string;
  instrument: string | null;
  currentMonth: number | null;
  weeklyGoalMinutes: number | null;
  activeRutaSlug: string | null;
  activeRutaVersion: number | null;
  onboardingCompleted: boolean;
  firstUnitId: string | null;
  nextCardId: string | null;
  learningGoal: string | null;
};

export function toImplicitProfileH1(ctx: LearnerContextH1): ImplicitProfileH1 {
  return {
    id: ctx.profileId,
    accountId: ctx.accountId,
    displayName: ctx.displayName,
    instrument: ctx.instrument,
    currentMonth: ctx.currentMonth,
    weeklyGoalMinutes: ctx.weeklyGoalMinutes,
    activeRutaSlug: ctx.activeRutaSlug,
    activeRutaVersion: ctx.activeRutaVersion,
    onboardingCompleted: ctx.onboardingCompleted,
    firstUnitId: ctx.firstUnitId,
    nextCardId: ctx.nextCardId,
    learningGoal: ctx.learningGoal,
  };
}

/**
 * H1: solo el perfil implícito de la sesión es válido.
 * profileId debe ser exactamente session.userId.
 */
export function assertProfileAccess(sessionUserId: string, profileId: string): void {
  if (profileId !== sessionUserId) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Perfil no autorizado en H1 (profileId debe coincidir con la sesión)."
    );
  }
}
