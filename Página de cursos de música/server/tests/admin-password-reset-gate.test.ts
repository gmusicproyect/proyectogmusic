import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminRecoveryKeysMatch,
  getConfiguredAdminPasswordResetKey,
  isAdminPasswordResetKeyConfigured,
} from "../lib/adminPasswordResetGate.js";

describe("adminPasswordResetGate", () => {
  it("rechaza claves cortas o placeholder", () => {
    assert.equal(isAdminPasswordResetKeyConfigured(undefined), false);
    assert.equal(isAdminPasswordResetKeyConfigured(""), false);
    assert.equal(isAdminPasswordResetKeyConfigured("change-me-admin-reset-key"), false);
    assert.equal(isAdminPasswordResetKeyConfigured("short-key"), false);
    assert.equal(isAdminPasswordResetKeyConfigured("valid-admin-reset-key-24chars"), true);
  });

  it("compara claves con timing-safe equality", () => {
    const key = "valid-admin-reset-key-24chars";
    assert.equal(adminRecoveryKeysMatch(key, key), true);
    assert.equal(adminRecoveryKeysMatch(key, "wrong-admin-reset-key-24char"), false);
  });

  it("getConfiguredAdminPasswordResetKey lee env válida", () => {
    const previous = process.env.ADMIN_PASSWORD_RESET_KEY;
    process.env.ADMIN_PASSWORD_RESET_KEY = "valid-admin-reset-key-24chars";
    assert.equal(getConfiguredAdminPasswordResetKey(), "valid-admin-reset-key-24chars");

    if (previous === undefined) {
      delete process.env.ADMIN_PASSWORD_RESET_KEY;
    } else {
      process.env.ADMIN_PASSWORD_RESET_KEY = previous;
    }
  });
});
