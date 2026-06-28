import { initSentryClient, Sentry } from "../sentry.client.config";
import posthog from "posthog-js";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AuthProvider } from "./app/hooks/useAuth.tsx";
import "./styles/index.css";
import "./app/components/gmusic/path-carousel-stage.css";

initSentryClient();

if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host:
      import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com",
    loaded: (ph) => {
      if (import.meta.env.DEV) ph.debug();
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>Algo salió mal. Intenta recargar la página.</p>}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Sentry.ErrorBoundary>
);
