import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { getCorsAllowedOriginsFromEnv } from "../lib/cors.js";

const ORIGIN = "https://proyectogmusic.vercel.app";

describe("CORS — frontend cross-origin", () => {
  after(() => {
    delete process.env.CORS_ALLOWED_ORIGINS;
  });

  it("getCorsAllowedOriginsFromEnv parsea lista separada por comas", () => {
    const origins = getCorsAllowedOriginsFromEnv({
      CORS_ALLOWED_ORIGINS: "https://a.test, http://localhost:5173 ",
    });
    assert.deepEqual(origins, ["https://a.test", "http://localhost:5173"]);
  });

  it("OPTIONS devuelve Access-Control-Allow-Origin para origen permitido", async () => {
    process.env.CORS_ALLOWED_ORIGINS = `${ORIGIN},http://localhost:5173`;
    const { createApp } = await import("../app.js");
    const app = createApp();

    const response = await request(app)
      .options("/api/v1/onboarding/temperament-quiz")
      .set("Origin", ORIGIN)
      .set("Access-Control-Request-Method", "POST");

    assert.equal(response.status, 204);
    assert.equal(response.headers["access-control-allow-origin"], ORIGIN);
    assert.match(String(response.headers["access-control-allow-methods"] ?? ""), /POST/);
  });

  it("OPTIONS no refleja origen no listado", async () => {
    process.env.CORS_ALLOWED_ORIGINS = ORIGIN;
    const { createApp } = await import("../app.js");
    const app = createApp();

    const response = await request(app)
      .options("/api/v1/health")
      .set("Origin", "https://evil.example")
      .set("Access-Control-Request-Method", "GET");

    assert.equal(response.status, 204);
    assert.equal(response.headers["access-control-allow-origin"], undefined);
  });
});
