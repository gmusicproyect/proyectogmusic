import { extractYoutubeId, isSafeMaterialUrl } from "../components/gmusic/admin/admin-utils";
import { isSupabaseStorageVideoUrl } from "./supabase-storage";

export function toYoutubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.includes("youtube.com/embed/") || trimmed.includes("youtube-nocookie.com/embed/")) {
    return trimmed;
  }

  const videoId = extractYoutubeId(trimmed);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}`;
}

/** Embed demo con menos chrome de YouTube (solo clases gratuitas). */
export function toYoutubeNocookieEmbedUrl(url: string): string | null {
  const embed = toYoutubeEmbedUrl(url);
  if (!embed) return null;
  return embed.replace("www.youtube.com/embed/", "www.youtube-nocookie.com/embed/");
}

export function isLessonVideoUrl(url: string | null | undefined): url is string {
  if (!url?.trim()) return false;
  if (!isSafeMaterialUrl(url)) return false;
  if (isSupabaseStorageVideoUrl(url)) return true;
  return toYoutubeEmbedUrl(url) !== null;
}
