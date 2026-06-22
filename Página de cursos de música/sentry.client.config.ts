import * as Sentry from "@sentry/react";

function resolveClientDsn(): string | undefined {
  return import.meta.env.VITE_SENTRY_DSN ?? import.meta.env.NEXT_PUBLIC_SENTRY_DSN;
}

export function initSentryClient(): boolean {
  const dsn = resolveClientDsn();
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT ??
      import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1,
    enabled: import.meta.env.PROD || Boolean(dsn),
  });

  return true;
}

export { Sentry };
