import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveApiBaseUrl } from "./config";

describe("resolveApiBaseUrl", () => {
  it("usa VITE_API_BASE_URL cuando está configurada (fuera de Vercel)", () => {
    assert.equal(
      resolveApiBaseUrl({
        configured: "https://example.com/api/v1/",
        hostname: "app.example.com",
      }),
      "https://example.com/api/v1"
    );
  });

  it("en localhost con API remota usa /api/v1 (proxy Vite, evita CORS)", () => {
    assert.equal(
      resolveApiBaseUrl({
        configured: "https://gmusic-api.onrender.com/api/v1",
        hostname: "127.0.0.1",
      }),
      "/api/v1"
    );
    assert.equal(
      resolveApiBaseUrl({
        configured: "https://gmusic-api.onrender.com/api/v1",
        hostname: "localhost",
      }),
      "/api/v1"
    );
  });

  it("en Vercel prod usa /api/v1 same-origin (proxy vercel.json → Render)", () => {
    assert.equal(
      resolveApiBaseUrl({
        configured: "https://gmusic-api.onrender.com/api/v1",
        hostname: "proyectogmusic.vercel.app",
      }),
      "/api/v1"
    );
    assert.equal(
      resolveApiBaseUrl({
        configured: null,
        hostname: "preview-abc123.vercel.app",
      }),
      "/api/v1"
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
