import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ALLOWED_CI_SUPABASE_HOST,
  ALLOWED_CI_SUPABASE_PROJECT_REF,
  ALLOWED_LOCAL_DATABASE_NAME,
  PRODUCTION_SUPABASE_PROJECT_REF,
  assertSafeDatabaseUrlForTests,
  classifyDatabaseUrl,
  extractDatabaseUrlFromEnvText,
  redactDatabaseUrl,
} from "./db-env-guard.mjs";

const PROD_URL = `postgresql://postgres.${PRODUCTION_SUPABASE_PROJECT_REF}:secret-password-PROD@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require`;
const CI_URL = `postgresql://postgres.${ALLOWED_CI_SUPABASE_PROJECT_REF}:secret-password-CI@${ALLOWED_CI_SUPABASE_HOST}:5432/postgres?sslmode=require`;
const LOCAL_URL = `postgresql://gmusic_admin:gmusic_secure_password@localhost:5432/${ALLOWED_LOCAL_DATABASE_NAME}?schema=public`;

describe("db-env-guard classifyDatabaseUrl", () => {
  it("permite CI ref + host CI correcto", () => {
    const r = classifyDatabaseUrl(CI_URL);
    assert.equal(r.ok, true);
    assert.equal(r.kind, "ci");
    assert.equal(r.projectRef, ALLOWED_CI_SUPABASE_PROJECT_REF);
    assert.equal(r.host, ALLOWED_CI_SUPABASE_HOST);
  });

  it("rechaza CI ref + supabase.com.evil.example", () => {
    const u = `postgresql://postgres.${ALLOWED_CI_SUPABASE_PROJECT_REF}:x@supabase.com.evil.example:5432/postgres`;
    const r = classifyDatabaseUrl(u);
    assert.equal(r.ok, false);
    assert.equal(r.kind, "unknown_supabase");
  });

  it("rechaza CI ref + evil-supabase.com", () => {
    const u = `postgresql://postgres.${ALLOWED_CI_SUPABASE_PROJECT_REF}:x@evil-supabase.com:5432/postgres`;
    const r = classifyDatabaseUrl(u);
    assert.equal(r.ok, false);
    assert.equal(r.kind, "unknown_supabase");
  });

  it("rechaza CI ref + host Supabase de otra región", () => {
    const u = `postgresql://postgres.${ALLOWED_CI_SUPABASE_PROJECT_REF}:x@aws-1-us-east-1.pooler.supabase.com:5432/postgres`;
    const r = classifyDatabaseUrl(u);
    // Host east-1 es producción → production (o unknown si no matchea prod ref)
    assert.equal(r.ok, false);
    assert.ok(r.kind === "production" || r.kind === "unknown_supabase");
  });

  it("rechaza prod ref", () => {
    const r = classifyDatabaseUrl(PROD_URL);
    assert.equal(r.ok, false);
    assert.equal(r.kind, "production");
  });

  it("permite localhost Docker estricto", () => {
    const r = classifyDatabaseUrl(LOCAL_URL);
    assert.equal(r.ok, true);
    assert.equal(r.kind, "local");
  });

  it("permite 127.0.0.1 Docker estricto", () => {
    const r = classifyDatabaseUrl(
      `postgresql://gmusic_admin:x@127.0.0.1:5432/${ALLOWED_LOCAL_DATABASE_NAME}`
    );
    assert.equal(r.ok, true);
    assert.equal(r.kind, "local");
  });

  it("permite IPv6 [::1]", () => {
    const r = classifyDatabaseUrl(
      `postgresql://gmusic_admin:x@[::1]:5432/${ALLOWED_LOCAL_DATABASE_NAME}`
    );
    assert.equal(r.ok, true);
    assert.equal(r.kind, "local");
    assert.equal(r.host, "::1");
  });

  it("rechaza localhost con otra base", () => {
    const r = classifyDatabaseUrl(
      "postgresql://gmusic_admin:x@localhost:5432/postgres"
    );
    assert.equal(r.ok, false);
    assert.equal(r.kind, "local_mismatch");
  });

  it("rechaza localhost con puerto distinto", () => {
    const r = classifyDatabaseUrl(
      `postgresql://gmusic_admin:x@localhost:5433/${ALLOWED_LOCAL_DATABASE_NAME}`
    );
    assert.equal(r.ok, false);
    assert.equal(r.kind, "local_mismatch");
  });

  it("rechaza Supabase desconocido", () => {
    const r = classifyDatabaseUrl(
      "postgresql://postgres.abcdefghijklmnopqr:x@aws-1-us-west-1.pooler.supabase.com:5432/postgres"
    );
    assert.equal(r.ok, false);
    assert.equal(r.kind, "unknown_supabase");
  });

  it("rechaza host remoto no-supabase", () => {
    const r = classifyDatabaseUrl(
      "postgresql://user:pass@db.example.com:5432/postgres"
    );
    assert.equal(r.ok, false);
    assert.equal(r.kind, "unknown_remote");
  });

  it("rechaza URL ausente", () => {
    assert.equal(classifyDatabaseUrl(undefined).kind, "missing");
    assert.equal(classifyDatabaseUrl("").kind, "missing");
  });

  it("rechaza URL inválida", () => {
    assert.equal(classifyDatabaseUrl("not-a-url").kind, "invalid");
  });
});

describe("db-env-guard extractDatabaseUrlFromEnvText", () => {
  it("carga solo DATABASE_URL e ignora secretos", () => {
    const text = [
      "JWT_SECRET=super-secret-jwt",
      "SENTRY_AUTH_TOKEN=sentry-token-xyz",
      "SENTRY_DSN=https://example.ingest.sentry.io/1",
      "VITE_API_BASE_URL=/api/v1",
      "ADMIN_PASSWORD_RESET_KEY=admin-key-should-ignore",
      `DATABASE_URL=${CI_URL}`,
      "GMUSIC_DEV_ACTIVATION_KEY=activation-key",
    ].join("\n");

    const only = extractDatabaseUrlFromEnvText(text);
    assert.equal(only, CI_URL);
    assert.equal(only?.includes("JWT_SECRET"), false);
    assert.equal(only?.includes("sentry-token"), false);
    assert.equal(only?.includes("admin-key"), false);
  });

  it("devuelve null si no hay DATABASE_URL", () => {
    assert.equal(extractDatabaseUrlFromEnvText("JWT_SECRET=x\n"), null);
  });
});

describe("db-env-guard redactDatabaseUrl", () => {
  it("no incluye la contraseña", () => {
    const redacted = redactDatabaseUrl(PROD_URL);
    assert.equal(redacted.includes("secret-password-PROD"), false);
    assert.equal(redacted.includes("***"), true);
  });

  it("mensajes de error no filtran password", () => {
    try {
      assertSafeDatabaseUrlForTests(PROD_URL);
      assert.fail("debió lanzar");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      assert.equal(msg.includes("secret-password-PROD"), false);
      assert.match(msg, /PRODUCCIÓN|production/i);
    }
  });
});

describe("db-env-guard assertSafeDatabaseUrlForTests", () => {
  it("exige CI en modo requireKind=ci", () => {
    assert.doesNotThrow(() =>
      assertSafeDatabaseUrlForTests(CI_URL, { requireKind: "ci" })
    );
    assert.throws(() =>
      assertSafeDatabaseUrlForTests(LOCAL_URL, { requireKind: "ci" })
    );
  });

  it("exige local en modo requireKind=local", () => {
    assert.doesNotThrow(() =>
      assertSafeDatabaseUrlForTests(LOCAL_URL, { requireKind: "local" })
    );
    assert.throws(() =>
      assertSafeDatabaseUrlForTests(CI_URL, { requireKind: "local" })
    );
  });
});
