import { VideoOff } from "lucide-react";
import { VideoPlayerLesson } from "../../dashboard/VideoPlayerLesson";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import {
  lessonStageLabelForSlot,
  resolveLessonStageSlot,
} from "../lesson/lesson-stage";
import { GM_BORDER, GM_GOLD_MATT, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";
import { usePathNodeVideoSources } from "./use-path-node-video-sources";

export interface PathNodeVideoCardProps {
  node: Pick<
    PathNodeData,
    "title" | "description" | "duration" | "videoUrl" | "stageType" | "order" | "guideText"
  >;
  /** Índice global del camino (1…N), alineado con el carrusel. */
  stepNumber?: number;
}

function PathNodeVideoEmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border px-6 py-12 text-center space-y-3"
      style={{
        borderColor: GM_GOLD_MATT,
        background: "rgba(212, 175, 55, 0.04)",
      }}
      role="status"
    >
      <div
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border"
        style={{ borderColor: "rgba(212, 175, 55, 0.35)", background: GM_SURFACE }}
      >
        <VideoOff
          className="h-5 w-5"
          style={{ color: "rgba(212, 175, 55, 0.75)" }}
          aria-hidden="true"
        />
      </div>
      <p className="text-sm font-medium tracking-wide" style={{ color: GM_TEXT }}>
        Video de la etapa
      </p>
      <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: GM_TEXT_SEC }}>
        {message}
      </p>
    </div>
  );
}

/** @deprecated Preferir video embebido en tarjeta vía PathCarouselCardHero. */
export function PathNodeVideoCard({ node, stepNumber }: PathNodeVideoCardProps) {
  const video = usePathNodeVideoSources(node.videoUrl);

  const stageSlot = resolveLessonStageSlot(node.stageType, stepNumber ?? node.order);
  const stageLabel = lessonStageLabelForSlot(stageSlot);
  const durationLabel = node.duration?.trim() || "Lección";
  const description =
    node.guideText?.trim() || node.description?.trim() || "Mira la lección de esta etapa.";

  return (
    <div className="space-y-4">
      {video.error ? (
        <p
          className="rounded-lg border px-4 py-3 text-sm"
          style={{ color: GM_TEXT_SEC, borderColor: GM_BORDER }}
        >
          {video.error}
        </p>
      ) : null}

      {video.loading ? (
        <div
          className="rounded-lg border px-4 py-10 text-center"
          style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
        >
          <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
            Preparando el video protegido…
          </p>
        </div>
      ) : video.hasVideoPlayer ? (
        <VideoPlayerLesson
          title={node.title}
          subtitle={description}
          duration={durationLabel}
          lessonLabel={stageLabel}
          videoUrl={video.embedUrl ?? undefined}
          nativeVideoSrc={video.nativeVideoSrc ?? undefined}
        />
      ) : (
        <PathNodeVideoEmptyState
          message={
            video.hasVideo
              ? "No pudimos cargar el video de esta etapa."
              : "Esta etapa aún no tiene video publicado. Cuando esté listo, lo verás aquí."
          }
        />
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
