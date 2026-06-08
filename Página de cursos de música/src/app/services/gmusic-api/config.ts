const DEFAULT_API_BASE_URL = "/api/v1";

export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configured) {
    return DEFAULT_API_BASE_URL;
  }
  return configured.replace(/\/+$/, "");
}

export function isDashboardMockEnabled(): boolean {
  return import.meta.env.VITE_USE_DASHBOARD_MOCK === "true";
}

export function isPathMockEnabled(): boolean {
  return import.meta.env.VITE_USE_PATH_MOCK === "true";
}
