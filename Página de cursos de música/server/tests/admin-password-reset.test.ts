import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import request from "supertest";
import bcrypt from "bcrypt";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";
import { hasDatabase } from "./helpers/db.js";

const integration = hasDatabase ? describe : describe.skip;
const ADMIN_EMAIL = "admin@gmusic.academy";
const TEST_RESET_KEY = "test-admin-reset-key-24chars-min";
const NEW_PASSWORD = "admin-reset-pass-123";
const ORIGINAL_PASSWORD = "admin-original-pass-123";

integration("POST /api/v1/auth/admin/reset-password", () => {
  const app = createApp();
  let previousResetKey: string | undefined;
  let originalPasswordHash: string | null = null;
  let dbReady = false;

  before(async () => {
    previousResetKey = process.env.ADMIN_PASSWORD_RESET_KEY;
    process.env.ADMIN_PASSWORD_RESET_KEY = TEST_RESET_KEY;

    try {
      const admin = await prisma.user.findUniqueOrThrow({
        where: { email: ADMIN_EMAIL },
        select: { passwordHash: true },
      });
      originalPasswordHash = admin.passwordHash;
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { passwordHash: await bcrypt.hash(ORIGINAL_PASSWORD, 10) },
      });
      dbReady = true;
    } catch {
      dbReady = false;
    }
  });

  after(async () => {
    if (dbReady && originalPasswordHash) {
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { passwordHash: originalPasswordHash },
      });
    }

    if (previousResetKey === undefined) {
      delete process.env.ADMIN_PASSWORD_RESET_KEY;
    } else {
      process.env.ADMIN_PASSWORD_RESET_KEY = previousResetKey;
    }
  });

  it("reset OK con clave correcta → login con nueva contraseña", async (t) => {
    if (!dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const reset = await request(app).post("/api/v1/auth/admin/reset-password").send({
      email: ADMIN_EMAIL,
      recoveryKey: TEST_RESET_KEY,
      newPassword: NEW_PASSWORD,
    });
    assert.equal(reset.status, 204);

    const login = await request(app).post("/api/v1/auth/login").send({
      email: ADMIN_EMAIL,
      password: NEW_PASSWORD,
    });
    assert.equal(login.status, 200);
    assert.equal(login.body.user.email, ADMIN_EMAIL);
  });

  it("clave incorrecta → 401 INVALID_RESET", async (t) => {
    if (!dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const response = await request(app).post("/api/v1/auth/admin/reset-password").send({
      email: ADMIN_EMAIL,
      recoveryKey: "wrong-recovery-key-24chars-x",
      newPassword: NEW_PASSWORD,
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "INVALID_RESET");
  });

  it("email STUDENT → 401 INVALID_RESET", async (t) => {
    if (!dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    const response = await request(app).post("/api/v1/auth/admin/reset-password").send({
      email: "carlos@gmusic.academy",
      recoveryKey: TEST_RESET_KEY,
      newPassword: NEW_PASSWORD,
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "INVALID_RESET");
  });

  it("sin ADMIN_PASSWORD_RESET_KEY → 503 RESET_NOT_CONFIGURED", async (t) => {
    if (!dbReady) {
      t.skip("DATABASE_URL no disponible");
      return;
    }

    delete process.env.ADMIN_PASSWORD_RESET_KEY;
    const response = await request(app).post("/api/v1/auth/admin/reset-password").send({
      email: ADMIN_EMAIL,
      recoveryKey: TEST_RESET_KEY,
      newPassword: NEW_PASSWORD,
    });
    assert.equal(response.status, 503);
    assert.equal(response.body.error.code, "RESET_NOT_CONFIGURED");

    process.env.ADMIN_PASSWORD_RESET_KEY = TEST_RESET_KEY;
  });
});
