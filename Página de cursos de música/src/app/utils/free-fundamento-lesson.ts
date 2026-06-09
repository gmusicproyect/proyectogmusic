export type FreeFundamentoLessonPhase = "lesson" | "complete";

export interface FreeFundamentoLessonOption {
  id: string;
  label: string;
}

export const FREE_FUNDAMENTO_LESSON_QUESTION =
  "¿Qué parte de la guitarra apoyas sobre tu pierna al sentarte?";

export const FREE_FUNDAMENTO_LESSON_OPTIONS: FreeFundamentoLessonOption[] = [
  { id: "body", label: "El cuerpo (caja)" },
  { id: "neck", label: "El mástil" },
  { id: "headstock", label: "La cabeza" },
];

export const FREE_FUNDAMENTO_GUITAR_IMAGE_URL =
  "https://images.unsplash.com/photo-1511379938549-c8f88a16a946?w=1200&q=80";

export const FREE_FUNDAMENTO_GUITAR_IMAGE_ALT =
  "Guitarra acústica sobre fondo claro con el cuerpo, el mástil y las cuerdas claramente visibles";

const VALID_FREE_FUNDAMENTO_OPTION_IDS = new Set(
  FREE_FUNDAMENTO_LESSON_OPTIONS.map((option) => option.id)
);

export function canAdvanceFreeFundamentoLesson(selectedOptionId: string | null): boolean {
  if (typeof selectedOptionId !== "string" || selectedOptionId.length === 0) {
    return false;
  }
  return VALID_FREE_FUNDAMENTO_OPTION_IDS.has(selectedOptionId);
}

export function nextFreeFundamentoLessonPhase(
  current: FreeFundamentoLessonPhase
): FreeFundamentoLessonPhase {
  return current === "lesson" ? "complete" : current;
}
