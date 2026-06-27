const DEFAULT_API_BASE_URL = "/api/v1";

/** API Render en prod cuando el build no incluye VITE_API_BASE_URL (Track A / Vercel). */
export const PRODUCTION_RENDER_API_BASE_URL = "https://gmusic-api.onrender.com/api/v1";

export function resolveApiBaseUrl(options: {
  configured?: string | null;
  hostname?: string | null;
  defaultBaseUrl?: string;
}): string {
  const hostname = options.hostname?.trim();

  // Vercel: same-origin /api/v1 proxy (vercel.json → Render). Evita bloqueo de cookies
  // third-party en navegadores reales; curl directo a Render sigue válido para smoke API.
  if (hostname === "proyectogmusic.vercel.app" || hostname?.endsWith(".vercel.app")) {
    return "/api/v1";
  }

  const configured = options.configured?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return options.defaultBaseUrl ?? DEFAULT_API_BASE_URL;
}

export function getApiBaseUrl(): string {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : null;

  return resolveApiBaseUrl({
    configured: import.meta.env?.VITE_API_BASE_URL,
    hostname,
  });
}

export function isDashboardMockEnabled(): boolean {
  return import.meta.env?.VITE_USE_DASHBOARD_MOCK === "true";
}

export function isPathMockEnabled(): boolean {
  return import.meta.env?.VITE_USE_PATH_MOCK === "true";
}
