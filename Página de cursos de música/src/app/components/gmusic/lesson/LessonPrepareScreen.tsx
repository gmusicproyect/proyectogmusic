import { useMemo, useState } from "react";
import { Button } from "../../ui/button";
import { LessonMaterialTabs } from "./LessonMaterialTabs";
import { LessonPracticeChecklist } from "./LessonPracticeChecklist";
import { LessonStageIndicator } from "./LessonStageIndicator";
import {
  buildMockPracticeChecklist,
  lessonStageLabelForSlot,
  resolveLessonStageSlot,
} from "./lesson-stage";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import { isLessonVideoUrl, toYoutubeEmbedUrl } from "../../../utils/youtube-embed";
import { GM_GOLD, GM_TEXT_SEC } from "../tokens";

export interface LessonPrepareScreenProps {
  node: Pick<
    PathNodeData,
    | "title"
    | "description"
    | "duration"
    | "videoUrl"
    | "stageType"
    | "order"
    | "guideText"
    | "guidePdfUrl"
    | "completionCriteria"
  >;
  onContinueToPractice: () => void;
}

export function LessonPrepareScreen({ node, onContinueToPractice }: LessonPrepareScreenProps) {
  const [videoReady, setVideoReady] = useState(false);

  const stageSlot = resolveLessonStageSlot(node.stageType, node.order);
  const stageLabel = lessonStageLabelForSlot(stageSlot);
  const hasVideo = isLessonVideoUrl(node.videoUrl);
  const embedUrl = useMemo(
    () => (hasVideo && node.videoUrl ? toYoutubeEmbedUrl(node.videoUrl) : null),
    [hasVideo, node.videoUrl]
  );

  const checklistItems = useMemo(
    () => buildMockPracticeChecklist(stageLabel, node.title),
    [stageLabel, node.title]
  );

  const description =
    node.guideText?.trim() ||
    node.description?.trim() ||
    node.completionCriteria?.trim() ||
    null;

  const canContinue = hasVideo ? videoReady : true;
  const durationLabel = node.duration?.trim() || null;

  return (
    <div className="space-y-6">
      <LessonStageIndicator activeSlot={stageSlot} />

      <LessonMaterialTabs
        nodeTitle={node.title}
        nodeDescription={description}
        stageLabel={stageLabel}
        durationLabel={durationLabel}
        videoUrl={node.videoUrl}
        embedUrl={embedUrl}
        guidePdfUrl={node.guidePdfUrl ?? null}
        onVideoPlaybackComplete={() => setVideoReady(true)}
      />

      <LessonPracticeChecklist items={checklistItems} />

      <div className="space-y-2 pt-1">
        <Button
          type="button"
          disabled={!canContinue}
          onClick={onContinueToPractice}
          className="min-h-[48px] w-full font-medium tracking-wide"
          style={{ background: GM_GOLD, color: "#0A0A0A" }}
        >
          Continuar a la práctica
        </Button>
        <p className="text-center text-xs leading-relaxed" style={{ color: GM_TEXT_SEC }}>
          {hasVideo && !videoReady
            ? "Marca el video como visto para continuar al ejercicio evaluado."
            : "La evaluación con ejercicios obligatorios sigue en la siguiente pantalla."}
        </p>
      </div>
    </div>
  );
}
