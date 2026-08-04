const SUPABASE_STORAGE_OBJECT_RE =
  /\/storage\/v1\/object(?:\/public|\/sign)?\/([^/?#]+)\/(.+)$/i;

export function isSupabaseStorageMaterialUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return SUPABASE_STORAGE_OBJECT_RE.test(parsed.pathname);
  } catch {
    return false;
  }
}

export function isPrivateSupabaseStorageMaterialUrl(
  url: string | null | undefined
): boolean {
  if (!isSupabaseStorageMaterialUrl(url)) return false;
  const match = new URL(url!.trim()).pathname.match(SUPABASE_STORAGE_OBJECT_RE);
  const bucket = match?.[1] ?? "";
  return bucket === "clases-video" || bucket === "clases-pdf" || bucket === "ejercicios-media";
}

export function isSupabaseStorageVideoUrl(url: string | null | undefined): boolean {
  if (!isPrivateSupabaseStorageMaterialUrl(url)) return false;
  const match = new URL(url!.trim()).pathname.match(SUPABASE_STORAGE_OBJECT_RE);
  return match?.[1] === "clases-video";
}

export function isYoutubeEmbedUrl(url: string): boolean {
  return url.includes("youtube.com/embed/");
}
