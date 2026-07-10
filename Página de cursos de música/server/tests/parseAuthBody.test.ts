import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../lib/errors.js";
import { parseRegisterBody, parseAdminResetPasswordBody } from "../lib/parseAuthBody.js";

describe("parseRegisterBody", () => {
  it("acepta registro sin celular", () => {
    const parsed = parseRegisterBody({
      name: "Juan",
      email: "Juan@Example.com",
      password: "password1",
    });
    assert.equal(parsed.name, "Juan");
    assert.equal(parsed.email, "juan@example.com");
    assert.equal(parsed.phone, null);
  });

  it("normaliza celular cuando se envía", () => {
    const parsed = parseRegisterBody({
      name: "Juan",
      email: "juan@example.com",
      phone: "+56 9 5342 9676",
      password: "password1",
    });
    assert.equal(parsed.phone, "+56953429676");
  });

  it("acepta correo con + en la parte local", () => {
    const parsed = parseRegisterBody({
      name: "Juan",
      email: "qa+tag@example.com",
      password: "password1",
    });
    assert.equal(parsed.email, "qa+tag@example.com");
  });
});

describe("parseAdminResetPasswordBody", () => {
  it("acepta email y contraseña válidos", () => {
    const parsed = parseAdminResetPasswordBody({
      email: "Admin@Gmusic.Academy",
      recoveryKey: "ops-recovery-key-24chars-min",
      newPassword: "new-pass-123",
    });
    assert.equal(parsed.email, "admin@gmusic.academy");
    assert.equal(parsed.recoveryKey, "ops-recovery-key-24chars-min");
    assert.equal(parsed.newPassword, "new-pass-123");
  });

  it("rechaza email inválido", () => {
    assert.throws(
      () =>
        parseAdminResetPasswordBody({
          email: "not-an-email",
          recoveryKey: "ops-recovery-key-24chars-min",
          newPassword: "new-pass-123",
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });

  it("rechaza contraseña corta", () => {
    assert.throws(
      () =>
        parseAdminResetPasswordBody({
          email: "admin@gmusic.academy",
          recoveryKey: "ops-recovery-key-24chars-min",
          newPassword: "short",
        }),
      (error: unknown) => error instanceof ApiError && error.code === "WEAK_PASSWORD"
    );
  });
});
