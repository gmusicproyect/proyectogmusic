import { useCallback, useMemo } from "react";
import type { PathNodeData } from "../../data/gmusic-path-types";
import {
  DEMO_ACADEMY_MORE_COUNT,
  DEMO_ACADEMY_TEASER_NODE_ID,
  getDemoPathEntry,
  isSubscriptionLockedLesson,
} from "../../data/demo-path-catalog";
import {
  PATH_CARD_GRADIENTS,
  PATH_CAROUSEL_ACADEMY_TEASER_GRADIENT,
  PATH_CAROUSEL_LOCKED_GRADIENT,
} from "./path-carousel-styles";
import {
  PathCarouselCards,
  type PathCarouselCardModel,
} from "./PathCarouselCards";

function getLessonNumber(nodeId: string): number | null {
  const m = /^demo-node-(\d+)$/.exec(nodeId);
  if (!m || !m[1]) return null;
  return parseInt(m[1], 10);
}

function isAcademyTeaserNode(nodeId: string): boolean {
  return nodeId === DEMO_ACADEMY_TEASER_NODE_ID;
}

export interface DemoPathCardsProps {
  nodes: PathNodeData[];
  fullBleed?: boolean;
  reviewCompleted?: boolean;
  allowLockedSelection?: boolean;
  hintText?: string;
  onStartLesson: (lessonNumber: number) => void;
  onLockedClick: (title: string, lessonNumber: number) => void;
  onAcademyTeaserClick?: () => void;
}

export function DemoPathCards({
  nodes,
  fullBleed = false,
  reviewCompleted = false,
  allowLockedSelection = false,
  hintText,
  onStartLesson,
  onLockedClick,
  onAcademyTeaserClick,
}: DemoPathCardsProps) {
  const initialFocusIndex = useMemo(() => {
    const activeIdx = nodes.findIndex((n) => n.status === "active");
    if (activeIdx >= 0) return activeIdx;
    const completedCount = nodes.filter((n) => n.status === "completed").length;
    if (completedCount >= 5) {
      const teaserIdx = nodes.findIndex((n) => isAcademyTeaserNode(n.id));
      if (teaserIdx >= 0) return teaserIdx;
    }
    return 0;
  }, [nodes]);

  const buildCardModels = useCallback(
    (focusedIdx: number, goTo: (idx: number) => void): PathCarouselCardModel[] =>
      nodes.map((node, i) => {
        const isTeaserCard = isAcademyTeaserNode(node.id);
        const lessonNum = getLessonNumber(node.id);
        const meta = lessonNum != null ? getDemoPathEntry(lessonNum) : undefined;
        const isFocused = i === focusedIdx;
        const isCompleted = node.status === "completed";
        const isActive = node.status === "active";
        const isLocked = node.status === "locked";
        const isSubscriptionLock =
          lessonNum != null && isSubscriptionLockedLesson(lessonNum);
        const gradient = isTeaserCard
          ? PATH_CAROUSEL_ACADEMY_TEASER_GRADIENT
          : isSubscriptionLock || (isLocked && lessonNum != null && lessonNum > 5)
            ? PATH_CAROUSEL_LOCKED_GRADIENT
            : lessonNum != null
              ? PATH_CARD_GRADIENTS[lessonNum] ?? PATH_CAROUSEL_LOCKED_GRADIENT
              : PATH_CAROUSEL_LOCKED_GRADIENT;
        const categoryLabel = meta?.subtitle ?? node.typeLabel ?? "Lección";

        const handleCardClick = () => {
          if (isTeaserCard) {
            if (!isFocused) {
              goTo(i);
              return;
            }
            onAcademyTeaserClick?.();
            return;
          }

          if (!isFocused) {
            goTo(i);
            if (isLocked && isSubscriptionLock && allowLockedSelection && lessonNum != null) {
              onLockedClick(node.title, lessonNum);
            }
            return;
          }

          if (isLocked) {
            if (allowLockedSelection && lessonNum != null) {
              onLockedClick(node.title, lessonNum);
            }
            return;
          }

          if (lessonNum != null) {
            onStartLesson(lessonNum);
          }
        };

        let focusedCta: PathCarouselCardModel["focusedCta"] = null;
        if (isFocused) {
          if (isTeaserCard) {
            focusedCta = {
              kind: "teaser",
              label: "Elegir plan",
              onClick: () => onAcademyTeaserClick?.(),
            };
          } else if (isLocked) {
            focusedCta = { kind: "locked", label: "Bloqueada", onClick: () => {} };
          } else {
            focusedCta = {
              kind: "action",
              label: isCompleted ? "Repetir" : "Continuar",
              onClick: () => {
                if (lessonNum != null) onStartLesson(lessonNum);
              },
              completedStyle: isCompleted,
            };
          }
        }

        return {
          title: node.title,
          gradient,
          categoryLabel,
          stepNumber: lessonNum,
          isCompleted,
          isActive,
          isLocked,
          isTeaser: isTeaserCard,
          isSubscriptionLock,
          starsFilled: isCompleted ? 3 : 0,
          teaserDescription: isTeaserCard
            ? "Desbloquea el camino completo con un plan de academia."
            : null,
          durationText: meta?.videoDuration && !isLocked ? meta.videoDuration : null,
          lockedHint: isLocked
            ? isSubscriptionLock
              ? "Requiere plan de academia"
              : "Completa la clase anterior"
            : null,
          focusedCta,
          onCardClick: handleCardClick,
        };
      }),
    [
      nodes,
      allowLockedSelection,
      onAcademyTeaserClick,
      onLockedClick,
      onStartLesson,
    ]
  );

  return (
    <PathCarouselCards
      nodes={nodes}
      buildCardModels={buildCardModels}
      initialFocusIndex={initialFocusIndex}
      fullBleed={fullBleed}
      reviewCompleted={reviewCompleted}
      hintText={hintText}
      visualVariant="stage"
      buildFooterText={(focusedIdx, carouselNodes) => {
        if (carouselNodes.length <= 12) return null;
        const node = carouselNodes[focusedIdx];
        if (node && isAcademyTeaserNode(node.id)) {
          return `Más de ${DEMO_ACADEMY_MORE_COUNT} clases · camino completo`;
        }
        const lessonNum = node ? getLessonNumber(node.id) : null;
        const lessonNodes = carouselNodes.filter((n) => !isAcademyTeaserNode(n.id));
        return `Clase ${lessonNum ?? focusedIdx + 1} de ${lessonNodes.length}`;
      }}
      useDotFooter={nodes.length <= 12}
    />
  );
}
