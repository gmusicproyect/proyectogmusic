import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import {
  createDevActivationProxyConfigure,
  resolveDevActivationKeyFromLoadedEnv,
} from './vite/devActivationProxy.ts'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

function resolveDevApiProxyTarget(env: Record<string, string>): string {
  const explicit = env.VITE_DEV_API_PROXY_TARGET?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const configuredApi = env.VITE_API_BASE_URL?.trim();
  if (configuredApi?.startsWith("http")) {
    try {
      return new URL(configuredApi).origin;
    } catch {
      // Ignorar URL mal formada; caer al backend local.
    }
  }

  return "http://localhost:3001";
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devActivationKey = resolveDevActivationKeyFromLoadedEnv(env);
  const devApiProxyTarget = resolveDevApiProxyTarget(env);
  const sentryAuthToken = env.SENTRY_AUTH_TOKEN;
  const sentryUploadEnabled = Boolean(
    sentryAuthToken && env.SENTRY_ORG && env.SENTRY_PROJECT
  );

  return {
    build: {
      sourcemap: sentryUploadEnabled ? true : "hidden",
    },
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      ...(sentryUploadEnabled
        ? [
            sentryVitePlugin({
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              authToken: sentryAuthToken,
              sourcemaps: {
                filesToDeleteAfterUpload: ["./dist/**/*.map"],
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      proxy: {
        "/api": {
          target: devApiProxyTarget,
          changeOrigin: true,
          secure: devApiProxyTarget.startsWith("https://"),
          configure: createDevActivationProxyConfigure(devActivationKey),
        },
      },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  };
})
