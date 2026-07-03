import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../lib/errors.js";
import { normalizeMaterialUrl } from "../lib/normalizeMaterialUrl.js";

describe("normalizeMaterialUrl", () => {
  it("acepta http y https", () => {
    assert.equal(
      normalizeMaterialUrl("https://example.com/material.pdf"),
      "https://example.com/material.pdf"
    );
  });

  it("normaliza null y vacío", () => {
    assert.equal(normalizeMaterialUrl(null), null);
    assert.equal(normalizeMaterialUrl("   "), null);
  });

  it("rechaza javascript", () => {
    assert.throws(
      () => normalizeMaterialUrl("javascript:alert(1)"),
      (error: unknown) => error instanceof ApiError && error.code === "INVALID_MATERIAL_URL"
    );
  });
});
