import { ApiError } from "./errors.js";

/** Acepta solo http(s) — PDF, Supabase Storage, Drive público, etc. */
export function normalizeMaterialUrl(
  value: string | null | undefined,
  fieldLabel = "URL"
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new ApiError(
        400,
        "INVALID_MATERIAL_URL",
        `${fieldLabel} debe usar http o https.`
      );
    }
    return trimmed;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "INVALID_MATERIAL_URL", `${fieldLabel} inválida.`);
  }
}
