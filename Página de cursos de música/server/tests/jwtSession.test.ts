import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSessionClearCookie,
  buildSessionCookie,
  resolveSessionCookieSameSite,
} from "../lib/jwtSession.js";

describe("jwtSession cookie attributes", () => {
  it("prod usa SameSite=None y Secure para SPA cross-origin", () => {
    assert.equal(resolveSessionCookieSameSite(true), "None");
    const cookie = buildSessionCookie("token-prod", true);
    assert.match(cookie, /SameSite=None/);
    assert.match(cookie, /Secure/);
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Path=\/api\/v1/);
  });

  it("dev usa SameSite=Lax sin Secure", () => {
    assert.equal(resolveSessionCookieSameSite(false), "Lax");
    const cookie = buildSessionCookie("token-dev", false);
    assert.match(cookie, /SameSite=Lax/);
    assert.equal(cookie.includes("Secure"), false);
  });

  it("clear cookie respeta mismo SameSite que sesión activa", () => {
    const cleared = buildSessionClearCookie(true);
    assert.match(cleared, /Max-Age=0/);
    assert.match(cleared, /SameSite=None/);
  });
});
