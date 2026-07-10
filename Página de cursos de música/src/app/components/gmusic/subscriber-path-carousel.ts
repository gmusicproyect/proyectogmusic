import type { PathNodeData } from "../../data/gmusic-path-types";
import { canStartLessonFromNode } from "./path/path-lesson-start";
import { pathCarouselGradientForIndex } from "./path-carousel-styles";
import type { PathCarouselCardModel } from "./PathCarouselCards";

export function flattenPathNodes(modules: { nodes: PathNodeData[] }[]): PathNodeData[] {
  return modules.flatMap((module) => module.nodes);
}

export function resolveCarouselFocusIndex(
  nodes: PathNodeData[],
  activeNodeId: string | null
): number {
  if (activeNodeId) {
    const activeIdx = nodes.findIndex((node) => node.id === activeNodeId);
    if (activeIdx >= 0) return activeIdx;
  }
  const firstPlayable = nodes.findIndex((node) => canStartLessonFromNode(node));
  if (firstPlayable >= 0) return firstPlayable;
  return 0;
}

export function resolveCarouselActiveClass(
  nodes: PathNodeData[],
  activeNodeId: string | null
): number {
  if (activeNodeId) {
    const idx = nodes.findIndex((node) => node.id === activeNodeId);
    if (idx >= 0) return idx + 1;
  }
  return Math.min(
    nodes.filter((node) => node.status === "completed").length + 1,
    nodes.length
  );
}

export function buildSubscriberPathCardModels(
  nodes: PathNodeData[],
  focusedIdx: number,
  goTo: (idx: number) => void,
  onStartNode: (nodeId: string) => void,
  loadingNodeId: string | null = null
): PathCarouselCardModel[] {
  return nodes.map((node, i) => {
    const isFocused = i === focusedIdx;
    const isCompleted = node.status === "completed";
    const isActive = node.status === "active";
    const isLocked = node.status === "locked";
    const canStart = canStartLessonFromNode(node);
    const isStartingThisNode = loadingNodeId === node.id;
    const categoryLabel = node.typeLabel ?? "Lección";
    const gradient = pathCarouselGradientForIndex(i, isLocked);

    const handleCardClick = () => {
      if (!isFocused) {
        goTo(i);
        return;
      }
      if (canStart && !isStartingThisNode) {
        onStartNode(node.id);
      }
    };

    let focusedCta: PathCarouselCardModel["focusedCta"] = null;
    if (isFocused) {
      if (isLocked || isCompleted || !canStart) {
        focusedCta = {
          kind: "locked",
          label: isCompleted ? "Completada" : "Bloqueada",
          onClick: () => {},
        };
      } else {
        focusedCta = {
          kind: "action",
          label: isStartingThisNode
            ? "Preparando…"
            : isActive
              ? "Iniciar lección"
              : "Continuar",
          onClick: () => {
            if (!isStartingThisNode) onStartNode(node.id);
          },
        };
      }
    }

    return {
      title: node.title,
      gradient,
      categoryLabel,
      stepNumber: i + 1,
      isCompleted,
      isActive,
      isLocked,
      starsFilled: isCompleted ? 3 : 0,
      durationText: node.duration && !isLocked ? node.duration : null,
      lockedHint: isLocked ? "Completa la clase anterior" : null,
      focusedCta,
      onCardClick: handleCardClick,
    };
  });
}
