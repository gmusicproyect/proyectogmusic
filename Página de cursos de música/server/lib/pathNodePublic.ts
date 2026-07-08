import { StageType, type PathNode } from "@prisma/client";

export type PublicStageType = StageType;

const STAGE_SLOT_BY_TYPE: Record<StageType, number> = {
  [StageType.FUNDAMENTO_UNO]: 1,
  [StageType.FUNDAMENTO_DOS]: 2,
  [StageType.TECNICA]: 3,
  [StageType.PRACTICA]: 4,
  [StageType.TOCAR]: 5,
};

export function publicHttpsMaterialUrl(url: string | null | undefined): string | null {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed.startsWith("https://")) return null;
  return trimmed;
}

export function publicNullableText(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";
  return trimmed.length > 0 ? trimmed : null;
}

export function resolvePublicStageSlot(
  stageType: StageType | null | undefined,
  nodeOrder: number
): number {
  if (stageType && STAGE_SLOT_BY_TYPE[stageType]) {
    return STAGE_SLOT_BY_TYPE[stageType];
  }
  if (Number.isFinite(nodeOrder) && nodeOrder >= 1 && nodeOrder <= 5) {
    return nodeOrder;
  }
  return 1;
}

export interface PublicPathNodeFields {
  stageType: PublicStageType | null;
  order: number;
  guideText: string | null;
  guidePdfUrl: string | null;
  completionCriteria: string | null;
  ctaLabel: string | null;
}

export function buildPublicPathNodeFields(node: Pick<PathNode, "stageType" | "order" | "guideText" | "guidePdfUrl" | "completionCriteria" | "ctaLabel">): PublicPathNodeFields {
  return {
    stageType: node.stageType ?? null,
    order: node.order,
    guideText: publicNullableText(node.guideText),
    guidePdfUrl: publicHttpsMaterialUrl(node.guidePdfUrl),
    completionCriteria: publicNullableText(node.completionCriteria),
    ctaLabel: publicNullableText(node.ctaLabel),
  };
}
