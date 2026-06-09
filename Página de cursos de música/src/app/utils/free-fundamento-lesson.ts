import type { ParsedExerciseView } from "../components/gmusic/lesson/lesson-runner-types";

export type FreeFundamentoLessonPhase = "video" | "challenge" | "success";

export interface FreeFundamentoLessonOption {
  id: string;
  label: string;
}

export const FREE_FUNDAMENTO_LESSON_TITLE = "Tu guitarra y postura";

export const FREE_FUNDAMENTO_LESSON_QUESTION =
  "¿Qué parte de la guitarra se apoya sobre tu pierna?";

export const FREE_FUNDAMENTO_LESSON_OPTIONS: FreeFundamentoLessonOption[] = [
  { id: "body", label: "El cuerpo (caja)" },
  { id: "neck", label: "El mástil" },
  { id: "headstock", label: "La cabeza" },
];

export const FREE_FUNDAMENTO_EXPECTED_ANSWER_ID = "body";

export const FREE_FUNDAMENTO_STATIONS = [
  { id: "video", label: "Video" },
  { id: "challenge", label: "Desafío" },
  { id: "success", label: "Éxito" },
] as const;

const VALID_FREE_FUNDAMENTO_OPTION_IDS = new Set(
  FREE_FUNDAMENTO_LESSON_OPTIONS.map((option) => option.id)
);

export function isKnownFreeFundamentoOption(selectedOptionId: string | null): boolean {
  if (typeof selectedOptionId !== "string" || selectedOptionId.length === 0) {
    return false;
  }
  return VALID_FREE_FUNDAMENTO_OPTION_IDS.has(selectedOptionId);
}

/** @deprecated Usar isKnownFreeFundamentoOption + isExpectedFreeFundamentoAnswer */
export function canAdvanceFreeFundamentoLesson(selectedOptionId: string | null): boolean {
  return isKnownFreeFundamentoOption(selectedOptionId);
}

export function isExpectedFreeFundamentoAnswer(selectedOptionId: string | null): boolean {
  return selectedOptionId === FREE_FUNDAMENTO_EXPECTED_ANSWER_ID;
}

export function nextFreeFundamentoLessonPhase(
  current: FreeFundamentoLessonPhase
): FreeFundamentoLessonPhase {
  if (current === "video") return "challenge";
  if (current === "challenge") return "success";
  return "success";
}

export function buildFreeFundamentoChallengeExercise(): ParsedExerciseView {
  return {
    id: "free-fundamento-leg-challenge",
    type: "IDENTIFY_NOTE",
    difficulty: 1,
    instruction: FREE_FUNDAMENTO_LESSON_QUESTION,
    options: FREE_FUNDAMENTO_LESSON_OPTIONS.map((option) => ({
      id: option.id,
      text: option.label,
    })),
    media: {},
  };
}

export function playFreeFundamentoSuccessFeedback(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(523.25, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(784, context.currentTime + 0.18);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.45);
    oscillator.onended = () => {
      void context.close();
    };
  } catch {
    // Entorno sin audio: el feedback visual sigue siendo suficiente.
  }
}
