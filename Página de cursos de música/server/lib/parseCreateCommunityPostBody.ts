import type { CommunityPostType, ExternalLinkProvider } from "@prisma/client";
import { ApiError } from "./errors.js";
import { normalizeMaterialUrl } from "./normalizeMaterialUrl.js";

const FEED_POST_TYPES = new Set<string>(["question", "progress", "music", "feedback"]);
const EXTERNAL_PROVIDERS = new Set<string>([
  "drive",
  "youtube",
  "soundcloud",
  "spotify",
  "facebook",
  "other",
]);

const MAX_CONTENT_LENGTH = 2000;
const MAX_TOPIC_LENGTH = 80;
const MAX_URL_LENGTH = 2048;

export interface CreateCommunityPostInput {
  postType: CommunityPostType;
  content: string;
  topicLabel: string | null;
  externalUrl: string | null;
  externalProvider: ExternalLinkProvider | null;
  /** Ignorado en persistencia — el servidor usa enrollment activo. */
  clientRequestedLevel: string | null;
}

function readOptionalString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "Campo de texto inválido.");
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    throw new ApiError(400, "VALIDATION_ERROR", "Texto demasiado largo.");
  }
  return trimmed;
}

export function parseCreateCommunityPostBody(body: unknown): CreateCommunityPostInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Datos de publicación inválidos.");
  }

  const record = body as Record<string, unknown>;
  const postTypeRaw =
    typeof record.post_type === "string"
      ? record.post_type.trim()
      : typeof record.postType === "string"
        ? record.postType.trim()
        : "";

  if (!FEED_POST_TYPES.has(postTypeRaw)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Tipo de publicación inválido.");
  }

  const content = readOptionalString(record.content, MAX_CONTENT_LENGTH);
  if (!content) {
    throw new ApiError(400, "VALIDATION_ERROR", "El contenido es obligatorio.");
  }

  const topicLabel = readOptionalString(record.topic_label ?? record.topicLabel, MAX_TOPIC_LENGTH);
  const externalUrlRaw = readOptionalString(
    record.external_url ?? record.externalUrl,
    MAX_URL_LENGTH
  );
  const externalUrl = externalUrlRaw
    ? normalizeMaterialUrl(externalUrlRaw, "Enlace externo")
    : null;

  let externalProvider: ExternalLinkProvider | null = null;
  const providerRaw =
    typeof record.external_provider === "string"
      ? record.external_provider.trim()
      : typeof record.externalProvider === "string"
        ? record.externalProvider.trim()
        : null;

  if (providerRaw) {
    if (!EXTERNAL_PROVIDERS.has(providerRaw)) {
      throw new ApiError(400, "VALIDATION_ERROR", "Proveedor de enlace inválido.");
    }
    externalProvider = providerRaw as ExternalLinkProvider;
  }

  if (externalUrl && !externalProvider) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Indica el proveedor del enlace externo."
    );
  }

  if (postTypeRaw === "music" && !externalUrl) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Las publicaciones de música requieren un enlace externo."
    );
  }

  const clientRequestedLevel =
    typeof record.level === "string"
      ? record.level.trim() || null
      : typeof record.client_requested_level === "string"
        ? record.client_requested_level.trim() || null
        : null;

  return {
    postType: postTypeRaw as CommunityPostType,
    content,
    topicLabel,
    externalUrl,
    externalProvider,
    clientRequestedLevel,
  };
}
