import type { ExternalLinkProvider } from "../data/community-post-types";

export interface ExternalLinkCardCopy {
  provider: ExternalLinkProvider;
  headline: string;
  ctaLabel: string;
}

const PROVIDER_PATTERNS: { provider: ExternalLinkProvider; pattern: RegExp }[] = [
  { provider: "drive", pattern: /(?:drive\.google\.com|docs\.google\.com)/i },
  { provider: "youtube", pattern: /(?:youtube\.com|youtu\.be)/i },
  { provider: "soundcloud", pattern: /soundcloud\.com/i },
  { provider: "spotify", pattern: /open\.spotify\.com/i },
  { provider: "facebook", pattern: /(?:facebook\.com|fb\.watch)/i },
];

export function detectExternalLinkProvider(url: string): ExternalLinkProvider {
  const trimmed = url.trim();
  for (const { provider, pattern } of PROVIDER_PATTERNS) {
    if (pattern.test(trimmed)) return provider;
  }
  return "other";
}

function externalLinkCtaLabel(
  provider: ExternalLinkProvider,
  postType: "progress" | "music" | "feedback" | "admin_featured"
): string {
  if (postType === "admin_featured") {
    if (provider === "youtube") return "Escuchar referencia";
    if (provider === "spotify") return "Escuchar canción";
    if (provider === "soundcloud") return "Escuchar audio";
    if (provider === "drive") return "Ver archivo";
    return "Ver referencia";
  }

  switch (provider) {
    case "drive":
      return "Ver archivo";
    case "youtube":
      return postType === "progress" ? "Ver práctica" : "Ver video";
    case "soundcloud":
      return "Escuchar audio";
    case "spotify":
      return "Escuchar canción";
    case "facebook":
      return "Ver video";
    default:
      return "Abrir enlace";
  }
}

export function externalLinkCardCopy(
  provider: ExternalLinkProvider,
  postType: "progress" | "music" | "feedback" | "admin_featured"
): ExternalLinkCardCopy {
  const progressHeadlines: Record<ExternalLinkProvider, string> = {
    drive: "Video en Google Drive",
    youtube: "Progreso compartido por YouTube",
    soundcloud: "Audio en SoundCloud",
    spotify: "Referencia en Spotify",
    facebook: "Video en Facebook",
    other: "Enlace externo de progreso",
  };

  const musicHeadlines: Record<ExternalLinkProvider, string> = {
    drive: "Archivo en Google Drive",
    youtube: "Música en YouTube",
    soundcloud: "Pista en SoundCloud",
    spotify: "Canción en Spotify",
    facebook: "Audio/video en Facebook",
    other: "Enlace musical externo",
  };

  const adminHeadlines: Record<ExternalLinkProvider, string> = {
    drive: "Material curado en Drive",
    youtube: "Referencia en YouTube",
    soundcloud: "Selección en SoundCloud",
    spotify: "Selección en Spotify",
    facebook: "Contenido en Facebook",
    other: "Contenido curado externo",
  };

  const headlines =
    postType === "music"
      ? musicHeadlines
      : postType === "admin_featured"
        ? adminHeadlines
        : progressHeadlines;

  return {
    provider,
    headline: headlines[provider],
    ctaLabel: externalLinkCtaLabel(provider, postType),
  };
}

export function isAllowedExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
