/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_DASHBOARD_MOCK?: string;
  readonly VITE_USE_PATH_MOCK?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
