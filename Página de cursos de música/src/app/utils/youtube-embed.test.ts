import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isLessonVideoUrl, toYoutubeEmbedUrl } from "./youtube-embed";

describe("youtube-embed", () => {
  it("convierte watch URL a embed", () => {
    assert.equal(
      toYoutubeEmbedUrl("https://www.youtube.com/watch?v=abc123XYZ12"),
      "https://www.youtube.com/embed/abc123XYZ12"
    );
  });

  it("acepta embed URL existente", () => {
    assert.equal(
      toYoutubeEmbedUrl("https://www.youtube.com/embed/abc123XYZ12"),
      "https://www.youtube.com/embed/abc123XYZ12"
    );
  });

  it("rechaza javascript y URLs inválidas", () => {
    assert.equal(isLessonVideoUrl("javascript:alert(1)"), false);
    assert.equal(isLessonVideoUrl(""), false);
    assert.equal(isLessonVideoUrl("   "), false);
    assert.equal(isLessonVideoUrl(null), false);
    assert.equal(isLessonVideoUrl(undefined), false);
  });
});
