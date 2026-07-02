import { ApiError } from "./errors.js";

export type UpdateAdminSlotBody = {
  title: string;
  videoUrl?: string | null;
  guideText?: string | null;
  completionCriteria?: string | null;
  ctaLabel?: string | null;
};

export type CreateAdminModuleBody = {
  title: string;
  courseSlug?: string;
};

function readOptionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") {
    throw new ApiError(400, "INVALID_BODY", "Se esperaba un texto.");
  }
  return value;
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, "INVALID_BODY", `${field} es obligatorio.`);
  }
  return value.trim();
}

export function parseCreateAdminModuleBody(body: unknown): CreateAdminModuleBody {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "INVALID_BODY", "Cuerpo JSON inválido.");
  }

  const record = body as Record<string, unknown>;
  const title = readRequiredString(record.title, "title");
  const courseSlug =
    record.courseSlug === undefined
      ? undefined
      : readRequiredString(record.courseSlug, "courseSlug");

  return { title, courseSlug };
}

export function parseUpdateAdminSlotBody(body: unknown): UpdateAdminSlotBody {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "INVALID_BODY", "Cuerpo JSON inválido.");
  }

  const record = body as Record<string, unknown>;

  return {
    title: readRequiredString(record.title, "title"),
    videoUrl: readOptionalString(record.videoUrl),
    guideText: readOptionalString(record.guideText),
    completionCriteria: readOptionalString(record.completionCriteria),
    ctaLabel: readOptionalString(record.ctaLabel),
  };
}

export function parseSlotOrderParam(value: string): number {
  const order = Number.parseInt(value, 10);
  if (!Number.isInteger(order) || order < 1 || order > 5) {
    throw new ApiError(400, "INVALID_SLOT_ORDER", "El slot debe estar entre 1 y 5.");
  }
  return order;
}
