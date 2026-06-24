import {
  clearTemperamentQuizLocalStorage,
  shouldShowTemperamentQuiz,
} from "./temperament-quiz-storage";

/** Evento interno: funnel anónimo reiniciado (p. ej. tras captura de lead sin suscripción). */
export const ANONYMOUS_FUNNEL_RESET_EVENT = "gmusic-anonymous-funnel-reset";

const DEMO_STORAGE_KEY = "gmusic:demo_v1";
const SELECTED_PLAN_KEY = "gmusic:selected_plan_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Borra progreso demo, quiz y sesión de onboarding del visitante anónimo. */
export function clearAnonymousFunnelLocalStorage(): void {
  if (!canUseStorage()) return;

  localStorage.removeItem(DEMO_STORAGE_KEY);
  localStorage.removeItem(SELECTED_PLAN_KEY);
  clearTemperamentQuizLocalStorage();

  window.dispatchEvent(new Event(ANONYMOUS_FUNNEL_RESET_EVENT));
}

/**
 * Fin de ciclo del funnel público: el visitante envió registro (WhatsApp) pero aún no es alumno.
 * Reinicia localStorage para que pueda repetir quiz + 5 clases en un nuevo intento.
 */
export function resetAnonymousFunnelAfterLeadCapture(): void {
  clearAnonymousFunnelLocalStorage();
}

/** Tras reset, página de entrada del nuevo ciclo (quiz primero si aplica). */
export function anonymousFunnelRestartPage(): "onboarding-quiz" | "mi-camino-demo" {
  return shouldShowTemperamentQuiz({ isSubscribedStudent: false })
    ? "onboarding-quiz"
    : "mi-camino-demo";
}
