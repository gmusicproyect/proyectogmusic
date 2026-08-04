import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLASE_GRATUITA_MAP_PAGE } from "../../utils/clase-gratuita-routing";
import { resolvePostLoginPage } from "./resolve-post-login-page";

describe("resolvePostLoginPage", () => {
  it("authenticated → mi-camino", () => {
    assert.deepEqual(
      resolvePostLoginPage({
        type: "authenticated",
        user: { id: "1", name: "A", email: "a@test.com" },
        subscription: { status: "ACTIVE", planId: "plan", endsAt: null },
      }),
      { type: "navigate", page: "mi-camino" }
    );
  });

  it("registered_no_sub → clase-gratuita", () => {
    assert.deepEqual(
      resolvePostLoginPage({
        type: "registered_no_sub",
        user: { id: "1", name: "A", email: "a@test.com" },
      }),
      { type: "navigate", page: CLASE_GRATUITA_MAP_PAGE }
    );
  });

  it("anonymous → stay con mensaje", () => {
    const result = resolvePostLoginPage({ type: "anonymous" });
    assert.equal(result.type, "stay");
    if (result.type === "stay") {
      assert.match(result.message, /cookies/i);
    }
  });

  it("error → stay con mensaje del outcome", () => {
    assert.deepEqual(resolvePostLoginPage({ type: "error", message: "Fallo de red" }), {
      type: "stay",
      message: "Fallo de red",
    });
  });

  it("ADMIN authenticated → admin (T-FLOW-01)", () => {
    assert.deepEqual(
      resolvePostLoginPage({
        type: "authenticated",
        user: { id: "1", name: "A", email: "a@test.com", role: "ADMIN" },
        subscription: { status: "ACTIVE", planId: "plan", endsAt: null },
      }),
      { type: "navigate", page: "admin" }
    );
  });

  it("ADMIN registered_no_sub → admin (T-FLOW-01)", () => {
    assert.deepEqual(
      resolvePostLoginPage({
        type: "registered_no_sub",
        user: { id: "1", name: "A", email: "a@test.com", role: "ADMIN" },
      }),
      { type: "navigate", page: "admin" }
    );
  });

  it("role STUDENT no altera destino authenticated (T-FLOW-01)", () => {
    assert.deepEqual(
      resolvePostLoginPage({
        type: "authenticated",
        user: { id: "1", name: "A", email: "a@test.com", role: "STUDENT" },
        subscription: { status: "ACTIVE", planId: "plan", endsAt: null },
      }),
      { type: "navigate", page: "mi-camino" }
    );
  });

  it("aborted → stay con mensaje genérico", () => {
    const result = resolvePostLoginPage({ type: "aborted" });
    assert.equal(result.type, "stay");
  });
});
