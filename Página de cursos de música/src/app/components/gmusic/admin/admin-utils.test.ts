import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeAdminStats, extractYoutubeId } from "./admin-utils";

describe("admin-utils", () => {
  it("extractYoutubeId parsea watch y youtu.be", () => {
    assert.equal(
      extractYoutubeId("https://www.youtube.com/watch?v=abc123XYZ"),
      "abc123XYZ"
    );
    assert.equal(extractYoutubeId("https://youtu.be/abc123XYZ"), "abc123XYZ");
    assert.equal(extractYoutubeId("not-a-url"), null);
  });

  it("computeAdminStats agrupa por estado", () => {
    const stats = computeAdminStats([
      { listStatus: "published" } as never,
      { listStatus: "draft" } as never,
      { listStatus: "empty" } as never,
    ]);
    assert.equal(stats.total, 3);
    assert.equal(stats.published, 1);
    assert.equal(stats.draft, 1);
    assert.equal(stats.empty, 1);
  });
});
