import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "../lib/errors.js";
import { parseCreateCommunityPostBody } from "../lib/parseCreateCommunityPostBody.js";

const VALID_BODY = {
  post_type: "question",
  content: "¿Cómo cambio de G a C sin perder el pulso?",
  topic_label: "Acordes",
};

describe("parseCreateCommunityPostBody", () => {
  it("acepta payload válido de pregunta", () => {
    const parsed = parseCreateCommunityPostBody(VALID_BODY);
    assert.equal(parsed.postType, "question");
    assert.equal(parsed.content, VALID_BODY.content);
    assert.equal(parsed.topicLabel, "Acordes");
  });

  it("requiere enlace para publicaciones de música", () => {
    assert.throws(
      () =>
        parseCreateCommunityPostBody({
          post_type: "music",
          content: "Mi cover",
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });

  it("acepta música con enlace y proveedor", () => {
    const parsed = parseCreateCommunityPostBody({
      post_type: "music",
      content: "Mi cover",
      external_url: "https://youtube.com/watch?v=abc",
      external_provider: "youtube",
    });
    assert.equal(parsed.postType, "music");
    assert.equal(parsed.externalUrl, "https://youtube.com/watch?v=abc");
    assert.equal(parsed.externalProvider, "youtube");
  });

  it("rechaza tipo de publicación no permitido en feed", () => {
    assert.throws(
      () =>
        parseCreateCommunityPostBody({
          post_type: "admin_featured",
          content: "Curado",
        }),
      (error: unknown) => error instanceof ApiError && error.code === "VALIDATION_ERROR"
    );
  });
});
