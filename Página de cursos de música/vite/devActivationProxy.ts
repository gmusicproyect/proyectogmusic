import type { ClientRequest } from "node:http";
import type { IncomingMessage } from "node:http";

const PROXY_INJECT_PATHS = new Set([
  "/api/v1/dev/activate-semestral",
  "/api/v1/dev/logout",
]);

export const DEV_ACTIVATION_PLACEHOLDER = "change-me-in-local-env";
export const DEV_ACTIVATION_KEY_MIN_LENGTH = 24;
export const DEV_ACTIVATION_HEADER = "X-Gmusic-Dev-Activation-Key";

export function isDevActivationKeyConfigured(
  rawKey: string | undefined
): rawKey is string {
  const key = rawKey?.trim();
  if (!key) return false;
  if (key === DEV_ACTIVATION_PLACEHOLDER) return false;
  if (key.length < DEV_ACTIVATION_KEY_MIN_LENGTH) return false;
  return true;
}

export function resolveDevActivationKeyFromLoadedEnv(
  env: Record<string, string | undefined>
): string | undefined {
  const key = env.GMUSIC_DEV_ACTIVATION_KEY;
  return isDevActivationKeyConfigured(key) ? key.trim() : undefined;
}

export function shouldInjectDevActivationHeader(
  requestUrl: string | undefined,
  method: string | undefined
): boolean {
  if (!requestUrl || method?.toUpperCase() !== "POST") return false;
  const path = requestUrl.split("?")[0] ?? "";
  return PROXY_INJECT_PATHS.has(path);
}

export function applyDevActivationProxyHeaders(
  proxyReq: ClientRequest,
  requestUrl: string | undefined,
  method: string | undefined,
  devActivationKey: string | undefined
): void {
  if (!shouldInjectDevActivationHeader(requestUrl, method)) return;
  if (!isDevActivationKeyConfigured(devActivationKey)) return;
  proxyReq.setHeader(DEV_ACTIVATION_HEADER, devActivationKey.trim());
}

export function createDevActivationProxyConfigure(devActivationKey?: string) {
  const configuredKey = isDevActivationKeyConfigured(devActivationKey)
    ? devActivationKey.trim()
    : undefined;

  return (proxy: {
    on(
      event: "proxyReq",
      listener: (proxyReq: ClientRequest, req: IncomingMessage) => void
    ): void;
  }) => {
    proxy.on("proxyReq", (proxyReq, req) => {
      applyDevActivationProxyHeaders(
        proxyReq,
        req.url,
        req.method,
        configuredKey
      );
    });
  };
}
