import { ApiError } from "./errors.js";

export function parseSignedMaterialUrlBody(body: unknown): { materialUrl: string } {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "INVALID_BODY", "Cuerpo de solicitud inválido.");
  }

  const record = body as Record<string, unknown>;
  const materialUrl =
    typeof record.materialUrl === "string" ? record.materialUrl.trim() : "";

  if (!materialUrl) {
    throw new ApiError(400, "INVALID_BODY", "materialUrl es obligatorio.");
  }

  try {
    const parsed = new URL(materialUrl);
    if (parsed.protocol !== "https:") {
      throw new ApiError(400, "INVALID_STORAGE_URL", "materialUrl debe ser https.");
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "INVALID_STORAGE_URL", "materialUrl inválida.");
  }

  return { materialUrl };
}
