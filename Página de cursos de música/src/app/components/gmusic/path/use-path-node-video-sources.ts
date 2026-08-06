import { useMemo } from "react";
import { useSignedMaterialUrl } from "../../../hooks/useSignedMaterialUrl";
import { isSupabaseStorageVideoUrl } from "../../../utils/supabase-storage";
import { isLessonVideoUrl, toYoutubeEmbedUrl } from "../../../utils/youtube-embed";

export function usePathNodeVideoSources(
  videoUrl: string | null | undefined,
  enabled = true
) {
  const hasVideo = enabled && isLessonVideoUrl(videoUrl);
  const isStorageVideo = enabled && isSupabaseStorageVideoUrl(videoUrl);
  const signedVideo = useSignedMaterialUrl(isStorageVideo ? videoUrl : null);

  const embedUrl = useMemo(() => {
    if (!hasVideo || !videoUrl || isStorageVideo) return null;
    return toYoutubeEmbedUrl(videoUrl);
  }, [hasVideo, isStorageVideo, videoUrl]);

  const nativeVideoSrc = isStorageVideo ? signedVideo.resolvedUrl : null;
  const hasVideoPlayer = Boolean(embedUrl || nativeVideoSrc);

  return {
    hasVideo,
    embedUrl,
    nativeVideoSrc,
    hasVideoPlayer,
    loading: isStorageVideo ? signedVideo.loading : false,
    error: isStorageVideo ? signedVideo.error : null,
  };
}
