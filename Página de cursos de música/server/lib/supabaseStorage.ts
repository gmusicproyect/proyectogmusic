import { ApiError } from "./errors.js";

/** Buckets privados — acceso solo vía URL firmada (T1.4). */
export const PRIVATE_STORAGE_BUCKETS = [
  "clases-video",
  "clases-pdf",
  "ejercicios-media",
] as const;

export type PrivateStorageBucket = (typeof PRIVATE_STORAGE_BUCKETS)[number];

export const ADMIN_UPLOAD_BUCKETS = {
  video: "clases-video",
  pdf: "clases-pdf",
} as const;

export type AdminUploadKind = keyof typeof ADMIN_UPLOAD_BUCKETS;

const STORAGE_OBJECT_PATH_RE =
  /\/storage\/v1\/object(?:\/public|\/sign)?\/([^/?#]+)\/(.+)$/i;

export interface ParsedSupabaseStorageObject {
  bucket: string;
  objectPath: string;
}

export function parseSupabaseStorageUrl(
  url: string
): ParsedSupabaseStorageObject | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const match = parsed.pathname.match(STORAGE_OBJECT_PATH_RE);
    if (!match?.[1] || !match[2]) return null;

    const bucket = decodeURIComponent(match[1]);
    const objectPath = decodeURIComponent(match[2]);
    if (!bucket || !objectPath) return null;

    return { bucket, objectPath };
  } catch {
    return null;
  }
}

export function isPrivateSupabaseStorageUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return false;
  const parsed = parseSupabaseStorageUrl(url);
  if (!parsed) return false;
  return PRIVATE_STORAGE_BUCKETS.includes(parsed.bucket as PrivateStorageBucket);
}

export function buildSupabaseObjectUrl(
  supabaseUrl: string,
  bucket: string,
  objectPath: string
): string {
  const base = supabaseUrl.replace(/\/$/, "");
  const encodedPath = objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/${bucket}/${encodedPath}`;
}

export function resolveSupabaseConfig(): { url: string; serviceRoleKey: string } {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "") ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (!url || !serviceRoleKey) {
    throw new ApiError(
      503,
      "STORAGE_NOT_CONFIGURED",
      "Almacenamiento académico no configurado en el servidor."
    );
  }

  return { url, serviceRoleKey };
}

export async function createSignedStorageUrl(
  materialUrl: string,
  expiresInSeconds = 3600
): Promise<{ signedUrl: string; expiresIn: number }> {
  const parsed = parseSupabaseStorageUrl(materialUrl);
  if (!parsed) {
    throw new ApiError(400, "INVALID_STORAGE_URL", "URL de material inválida.");
  }

  if (!PRIVATE_STORAGE_BUCKETS.includes(parsed.bucket as PrivateStorageBucket)) {
    throw new ApiError(
      400,
      "INVALID_STORAGE_URL",
      "Solo se pueden firmar materiales de buckets privados."
    );
  }

  const { url, serviceRoleKey } = resolveSupabaseConfig();
  const encodedPath = parsed.objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetch(
    `${url}/storage/v1/object/sign/${parsed.bucket}/${encodedPath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: expiresInSeconds }),
    }
  );

  if (!response.ok) {
    throw new ApiError(
      502,
      "STORAGE_SIGN_FAILED",
      "No pudimos generar el enlace temporal del material."
    );
  }

  const body = (await response.json()) as { signedURL?: string; signedUrl?: string };
  const signedPath = body.signedURL ?? body.signedUrl;
  if (!signedPath) {
    throw new ApiError(
      502,
      "STORAGE_SIGN_FAILED",
      "Respuesta inválida al firmar el material."
    );
  }

  const signedUrl = signedPath.startsWith("http")
    ? signedPath
    : `${url}/storage/v1${signedPath.startsWith("/") ? "" : "/"}${signedPath}`;

  return { signedUrl, expiresIn: expiresInSeconds };
}

export async function uploadStorageObject(input: {
  bucket: string;
  objectPath: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  const { url, serviceRoleKey } = resolveSupabaseConfig();
  const encodedPath = input.objectPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetch(`${url}/storage/v1/object/${input.bucket}/${encodedPath}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": input.contentType,
      "x-upsert": "true",
    },
    body: input.body,
  });

  if (!response.ok) {
    throw new ApiError(
      502,
      "STORAGE_UPLOAD_FAILED",
      "No pudimos subir el archivo al almacenamiento."
    );
  }

  return buildSupabaseObjectUrl(url, input.bucket, input.objectPath);
}

export function sanitizeUploadFilename(name: string): string {
  const base = name.trim().split(/[/\\]/).pop() ?? "archivo";
  const normalized = base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);

  return normalized || "archivo";
}
