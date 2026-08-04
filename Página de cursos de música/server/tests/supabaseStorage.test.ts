import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSupabaseObjectUrl,
  isPrivateSupabaseStorageUrl,
  parseSupabaseStorageUrl,
  sanitizeUploadFilename,
} from "../lib/supabaseStorage.js";

describe("parseSupabaseStorageUrl", () => {
  it("parsea URL privada sin /public", () => {
    const parsed = parseSupabaseStorageUrl(
      "https://tosbwmqijmtxchvcgrkj.supabase.co/storage/v1/object/clases-video/pilot/foo.mp4"
    );
    assert.deepEqual(parsed, {
      bucket: "clases-video",
      objectPath: "pilot/foo.mp4",
    });
  });

  it("parsea URL con /public", () => {
    const parsed = parseSupabaseStorageUrl(
      "https://example.supabase.co/storage/v1/object/public/clases-pdf/guia.pdf"
    );
    assert.deepEqual(parsed, {
      bucket: "clases-pdf",
      objectPath: "guia.pdf",
    });
  });

  it("rechaza URL no storage", () => {
    assert.equal(parseSupabaseStorageUrl("https://youtube.com/watch?v=abc"), null);
  });
});

describe("isPrivateSupabaseStorageUrl", () => {
  it("detecta buckets privados", () => {
    assert.equal(
      isPrivateSupabaseStorageUrl(
        "https://x.supabase.co/storage/v1/object/clases-video/a.mp4"
      ),
      true
    );
    assert.equal(
      isPrivateSupabaseStorageUrl(
        "https://x.supabase.co/storage/v1/object/demo-media/a.mp4"
      ),
      false
    );
  });
});

describe("buildSupabaseObjectUrl", () => {
  it("construye URL canónica sin /public", () => {
    assert.equal(
      buildSupabaseObjectUrl(
        "https://x.supabase.co/",
        "clases-video",
        "pilot/foo.mp4"
      ),
      "https://x.supabase.co/storage/v1/object/clases-video/pilot/foo.mp4"
    );
  });
});

describe("sanitizeUploadFilename", () => {
  it("normaliza nombres inseguros", () => {
    assert.equal(sanitizeUploadFilename("  Mi Guía (v1).pdf  "), "Mi-Guia-v1-.pdf");
  });
});
