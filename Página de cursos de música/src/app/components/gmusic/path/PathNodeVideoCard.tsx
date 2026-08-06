import { useMemo } from "react";
import { VideoPlayerLesson } from "../../dashboard/VideoPlayerLesson";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import { useSignedMaterialUrl } from "../../../hooks/useSignedMaterialUrl";
import { isSupabaseStorageVideoUrl } from "../../../utils/supabase-storage";
import { isLessonVideoUrl, toYoutubeEmbedUrl } from "../../../utils/youtube-embed";
import {
  lessonStageLabelForSlot,
  resolveLessonStageSlot,
} from "../lesson/lesson-stage";
import { GM_BORDER, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface PathNodeVideoCardProps {
  node: Pick<
    PathNodeData,
    "title" | "description" | "duration" | "videoUrl" | "stageType" | "order" | "guideText"
  >;
}

export function PathNodeVideoCard({ node }: PathNodeVideoCardProps) {
  const hasVideo = isLessonVideoUrl(node.videoUrl);
  const isStorageVideo = isSupabaseStorageVideoUrl(node.videoUrl);
  const signedVideo = useSignedMaterialUrl(isStorageVideo ? node.videoUrl : null);

  const embedUrl = useMemo(() => {
    if (!hasVideo || !node.videoUrl || isStorageVideo) return null;
    return toYoutubeEmbedUrl(node.videoUrl);
  }, [hasVideo, isStorageVideo, node.videoUrl]);

  const stageSlot = resolveLessonStageSlot(node.stageType, node.order);
  const stageLabel = lessonStageLabelForSlot(stageSlot);
  const durationLabel = node.duration?.trim() || "Lección";
  const description =
    node.guideText?.trim() || node.description?.trim() || "Mira la lección de esta etapa.";

  const nativeVideoSrc = isStorageVideo ? signedVideo.resolvedUrl : null;
  const hasVideoPlayer = Boolean(embedUrl || nativeVideoSrc);

  return (
    <div className="space-y-4">
      {signedVideo.error ? (
        <p
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ color: GM_TEXT_SEC, borderColor: GM_BORDER }}
        >
          {signedVideo.error}
        </p>
      ) : null}

      {signedVideo.loading ? (
        <div
          className="rounded-lg border px-4 py-10 text-center"
          style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
        >
          <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
            Preparando el video protegido…
          </p>
        </div>
      ) : hasVideoPlayer ? (
        <VideoPlayerLesson
          title={node.title}
          subtitle={description}
          duration={durationLabel}
          lessonLabel={stageLabel}
          videoUrl={embedUrl ?? undefined}
          nativeVideoSrc={nativeVideoSrc ?? undefined}
        />
      ) : (
        <div
          className="rounded-lg border px-4 py-10 text-center"
          style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
        >
          <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
            {hasVideo
              ? "No pudimos cargar el video de esta etapa."
              : "Esta etapa aún no tiene video publicado."}
          </p>
        </div>
      )}

      <div className="space-y-1">
        <h2
          className="text-xl font-medium leading-snug"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GM_TEXT }}
        >
          {node.title}
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
          {description}
        </p>
      </div>
    </div>
  );
}
