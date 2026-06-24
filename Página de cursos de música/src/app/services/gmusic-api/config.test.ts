import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PRODUCTION_RENDER_API_BASE_URL,
  resolveApiBaseUrl,
} from "./config";

describe("resolveApiBaseUrl", () => {
  it("usa VITE_API_BASE_URL cuando está configurada", () => {
    assert.equal(
      resolveApiBaseUrl({
        configured: "https://example.com/api/v1/",
        hostname: "proyectogmusic.vercel.app",
      }),
      "https://example.com/api/v1"
    );
  });

  it("en Vercel prod apunta a Render si no hay env de build", () => {
    assert.equal(
      resolveApiBaseUrl({
        configured: null,
        hostname: "proyectogmusic.vercel.app",
      }),
      PRODUCTION_RENDER_API_BASE_URL
    );
  });

  it("en localhost usa /api/v1 por defecto", () => {
    assert.equal(
      resolveApiBaseUrl({
        configured: null,
        hostname: "localhost",
      }),
      "/api/v1"
    );
  });
});
