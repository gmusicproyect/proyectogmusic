import { VideoOff } from "lucide-react";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import { GM_TEXT_SEC } from "../tokens";
import { usePathNodeVideoSources } from "./use-path-node-video-sources";

export interface PathCarouselCardHeroProps {
  node: Pick<PathNodeData, "title" | "videoUrl">;
  isFocused: boolean;
  fallbackPhoto: string;
  stageLabel: string;
}

export function PathCarouselCardHero({
  node,
  isFocused,
  fallbackPhoto,
  stageLabel,
}: PathCarouselCardHeroProps) {
  const video = usePathNodeVideoSources(node.videoUrl, isFocused);

  if (!isFocused) {
    return (
      <div className="path-carousel__card-hero">
        <img
          src={fallbackPhoto}
          alt=""
          className="path-carousel__card-hero-img"
          loading="lazy"
          decoding="async"
        />
        <div className="path-carousel__card-hero-overlay" aria-hidden="true" />
        <span className="path-carousel__hero-stage-label">{stageLabel}</span>
      </div>
    );
  }

  if (video.loading) {
    return (
      <div className="path-carousel__card-hero path-carousel__card-hero--video" role="status">
        <p className="path-carousel__card-hero-status">Preparando el video…</p>
        <span className="path-carousel__hero-stage-label">{stageLabel}</span>
      </div>
    );
  }

  if (video.error) {
    return (
      <div className="path-carousel__card-hero path-carousel__card-hero--video" role="alert">
        <p className="path-carousel__card-hero-status">{video.error}</p>
        <span className="path-carousel__hero-stage-label">{stageLabel}</span>
      </div>
    );
  }

  if (video.hasVideoPlayer) {
    return (
      <div className="path-carousel__card-hero path-carousel__card-hero--video">
        {video.nativeVideoSrc ? (
          <video
            src={video.nativeVideoSrc}
            controls
            playsInline
            className="path-carousel__card-hero-video"
            title={node.title}
          />
        ) : (
          <iframe
            src={`${video.embedUrl}?rel=0&modestbranding=1`}
            className="path-carousel__card-hero-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            title={node.title}
          />
        )}
        <span className="path-carousel__hero-stage-label">{stageLabel}</span>
      </div>
    );
  }

  if (video.hasVideo) {
    return (
      <div className="path-carousel__card-hero path-carousel__card-hero--video" role="status">
        <p className="path-carousel__card-hero-status">No pudimos cargar el video de esta etapa.</p>
        <span className="path-carousel__hero-stage-label">{stageLabel}</span>
      </div>
    );
  }

  return (
    <div className="path-carousel__card-hero path-carousel__card-hero--empty">
      <VideoOff className="path-carousel__card-hero-empty-icon" aria-hidden="true" />
      <p className="path-carousel__card-hero-empty-text" style={{ color: GM_TEXT_SEC }}>
        Video próximamente
      </p>
      <span className="path-carousel__hero-stage-label">{stageLabel}</span>
    </div>
  );
}
