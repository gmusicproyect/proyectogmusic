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

/**
 * Checklist visual de preparación (local, no persistido).
 * Preferir `completionCriteria` del PathNode (editorial DB) cuando exista;
 * si no, hints genéricos — no inventan currículo publicado.
 */
export function buildVisualPracticeChecklist(input: {
  stageLabel: string;
  nodeTitle: string;
  completionCriteria?: string | null;
}): readonly string[] {
  const criteria = input.completionCriteria?.trim();
  if (criteria) {
    return [
      `Mira la clase: ${input.nodeTitle}`,
      criteria,
      "Cuando estés listo, continúa a la evaluación",
    ];
  }
  return [
    `Mira la clase: ${input.nodeTitle}`,
    `Prepara la etapa «${input.stageLabel}» con calma`,
    "Continúa a la evaluación cuando estés listo",
  ];
}

/** @deprecated Alias — usar buildVisualPracticeChecklist */
export function buildMockPracticeChecklist(
  stageLabel: string,
  nodeTitle: string
): readonly string[] {
  return buildVisualPracticeChecklist({ stageLabel, nodeTitle });
}
