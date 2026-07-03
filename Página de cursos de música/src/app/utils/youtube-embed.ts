import { extractYoutubeId, isSafeMaterialUrl } from "../components/gmusic/admin/admin-utils";

export function toYoutubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }

  const videoId = extractYoutubeId(trimmed);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

export function isLessonVideoUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  if (!isSafeMaterialUrl(url)) return false;
  return toYoutubeEmbedUrl(url) !== null;
}
