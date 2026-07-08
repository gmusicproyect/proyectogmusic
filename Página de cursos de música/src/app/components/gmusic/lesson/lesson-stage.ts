import type { PathStageType } from "../../../data/gmusic-path-types";

export const LESSON_STAGE_LABELS = [
  "Fundamento uno",
  "Fundamento dos",
  "Técnica",
  "Práctica",
  "Tocar",
] as const;

const STAGE_SLOT_BY_TYPE: Record<PathStageType, number> = {
  FUNDAMENTO_UNO: 1,
  FUNDAMENTO_DOS: 2,
  TECNICA: 3,
  PRACTICA: 4,
  TOCAR: 5,
};

export function resolveLessonStageSlot(
  stageType: PathStageType | null | undefined,
  nodeOrder?: number | null
): number {
  if (stageType && STAGE_SLOT_BY_TYPE[stageType]) {
    return STAGE_SLOT_BY_TYPE[stageType];
  }
  if (typeof nodeOrder === "number" && nodeOrder >= 1 && nodeOrder <= 5) {
    return nodeOrder;
  }
  return 1;
}

export function lessonStageLabelForSlot(slot: number): string {
  const index = Math.max(1, Math.min(5, slot)) - 1;
  return LESSON_STAGE_LABELS[index] ?? LESSON_STAGE_LABELS[0];
}

export function buildMockPracticeChecklist(
  stageLabel: string,
  nodeTitle: string
): readonly string[] {
  return [
    `Mira la clase completa: ${nodeTitle}`,
    `Aplica la etapa «${stageLabel}» con calma y atención`,
    "Repite la microacción al menos una vez antes de continuar",
  ];
}
