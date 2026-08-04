import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  checkProdMigrateGuard,
  parseMigrateStatusOutput,
  redactDatabaseUrl,
} from "./prisma-migrate-status-guard.mjs";

describe("parseMigrateStatusOutput", () => {
  it("PASS — schema up to date", () => {
    const stdout = `
8 migrations found in prisma/migrations
Database schema is up to date!
`.trim();
    const result = parseMigrateStatusOutput(stdout, 0);
    assert.equal(result.ok, true);
  });

  it("FAIL — migraciones pendientes (evidencia negativa mockeada)", () => {
    const stdout = `
8 migrations found in prisma/migrations
Following migration have not yet been applied:
20260717120000_pd2_durable_persistence_h1
`.trim();
    const result = parseMigrateStatusOutput(stdout, 1);
    assert.equal(result.ok, false);
    assert.equal(result.code, "MIGRATE_PENDING");
    assert.deepEqual(result.pending, ["20260717120000_pd2_durable_persistence_h1"]);
  });

  it("FAIL — exit code distinto de cero sin up to date", () => {
    const result = parseMigrateStatusOutput("FATAL: connection refused", 1, "ENOTFOUND");
    assert.equal(result.ok, false);
    assert.equal(result.code, "MIGRATE_STATUS_ERROR");
  });
});

describe("checkProdMigrateGuard", () => {
  it("FAIL — DATABASE_URL ausente (fail-closed)", () => {
    const result = checkProdMigrateGuard({ databaseUrl: "" });
    assert.equal(result.ok, false);
    assert.equal(result.code, "DATABASE_URL_MISSING");
  });

  it("PASS — spawn mockeado up to date", () => {
    const result = checkProdMigrateGuard({
      databaseUrl: "postgresql://u:p@localhost:5432/db",
      spawnSyncFn: () => ({
        status: 0,
        stdout: "Database schema is up to date!\n",
        stderr: "",
      }),
    });
    assert.equal(result.ok, true);
  });

  it("FAIL — spawn mockeado con migración pendiente", () => {
    const result = checkProdMigrateGuard({
      databaseUrl: "postgresql://u:p@localhost:5432/db",
      spawnSyncFn: () => ({
        status: 1,
        stdout: `Following migration have not yet been applied:\n20260717120000_pd2_durable_persistence_h1\n`,
        stderr: "",
      }),
    });
    assert.equal(result.ok, false);
    assert.equal(result.code, "MIGRATE_PENDING");
  });
});

describe("redactDatabaseUrl", () => {
  it("no expone password", () => {
    const redacted = redactDatabaseUrl(
      "postgresql://postgres:secret@aws-1-us-east-1.pooler.supabase.com:5432/postgres"
    );
    assert.match(redacted, /^postgresql:\/\/\*\*\*@/);
    assert.doesNotMatch(redacted, /secret/);
  });
});
