import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { User } from "@prisma/client";
import { AccountTier, Role } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import {
  assertProfileAccess,
  resolveLearnerContext,
  toAccountId,
  toImplicitProfileH1,
  toProfileId,
} from "../lib/learnerContextH1.js";

function fakeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-h1-001",
    email: "h1@gmusic.test",
    name: "Alumno H1",
    role: Role.STUDENT,
    accountTier: AccountTier.DEMO,
    passwordHash: null,
    phone: null,
    timezone: "America/Santiago",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

describe("P0-01 LearnerContextH1 (unit)", () => {
  it("T-H1-01: toProfileId(userId) === userId", () => {
    assert.equal(toProfileId("abc"), "abc");
    assert.equal(toAccountId("abc"), "abc");
  });

  it("T-H1-02: resolveLearnerContext setea profileId = accountId = user.id", () => {
    const user = fakeUser();
    const ctx = resolveLearnerContext(user);
    assert.equal(ctx.profileId, user.id);
    assert.equal(ctx.accountId, user.id);
    assert.equal(ctx.email, user.email);
    assert.equal(ctx.displayName, user.name);
    assert.equal(ctx.role, Role.STUDENT);
    assert.equal(ctx.accountTier, AccountTier.DEMO);
    assert.equal(ctx.onboardingCompleted, false);
    assert.equal(ctx.instrument, null);
  });

  it("T-H1-04 unit: assertProfileAccess rechaza otro profileId", () => {
    assert.throws(
      () => assertProfileAccess("user-h1-001", "other-profile"),
      (err: unknown) => err instanceof ApiError && err.status === 403 && err.code === "FORBIDDEN"
    );
  });

  it("assertProfileAccess acepta profileId = session userId", () => {
    assert.doesNotThrow(() => assertProfileAccess("user-h1-001", "user-h1-001"));
  });

  it("toImplicitProfileH1 expone id = profileId", () => {
    const profile = toImplicitProfileH1(resolveLearnerContext(fakeUser()));
    assert.equal(profile.id, "user-h1-001");
    assert.equal(profile.accountId, "user-h1-001");
  });
});
