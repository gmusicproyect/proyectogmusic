import * as Sentry from "@sentry/node";

export function initSentryServer(): boolean {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return false;

  Sentry.init({
    dsn,
    environment:
      process.env.SENTRY_ENVIRONMENT ??
      process.env.NODE_ENV ??
      "development",
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,
  });

  return true;
}

export { Sentry };
