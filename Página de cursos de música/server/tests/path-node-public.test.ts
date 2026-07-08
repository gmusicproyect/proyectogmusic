import assert from "node:assert/strict";
import { StageType } from "@prisma/client";
import { describe, it } from "node:test";
import {
  buildPublicPathNodeFields,
  publicHttpsMaterialUrl,
  publicNullableText,
  resolvePublicStageSlot,
} from "../lib/pathNodePublic.js";

describe("pathNodePublic", () => {
  it("publicHttpsMaterialUrl solo acepta https", () => {
    assert.equal(publicHttpsMaterialUrl("https://cdn.example.com/guide.pdf"), "https://cdn.example.com/guide.pdf");
    assert.equal(publicHttpsMaterialUrl("http://insecure.example.com/x.pdf"), null);
    assert.equal(publicHttpsMaterialUrl(""), null);
    assert.equal(publicHttpsMaterialUrl(null), null);
  });

  it("publicNullableText recorta y descarta vacíos", () => {
    assert.equal(publicNullableText("  hola  "), "hola");
    assert.equal(publicNullableText("   "), null);
    assert.equal(publicNullableText(undefined), null);
  });

  it("resolvePublicStageSlot usa stageType cuando existe", () => {
    assert.equal(resolvePublicStageSlot(StageType.PRACTICA, 99), 4);
    assert.equal(resolvePublicStageSlot(null, 3), 3);
    assert.equal(resolvePublicStageSlot(null, 9), 1);
  });

  it("buildPublicPathNodeFields mapea campos read-only del PathNode", () => {
    const fields = buildPublicPathNodeFields({
      stageType: StageType.FUNDAMENTO_UNO,
      order: 1,
      guideText: " Observa tu postura ",
      guidePdfUrl: "https://cdn.example.com/am.pdf",
      completionCriteria: "Puede nombrar las partes",
      ctaLabel: " Practicar ",
    });

    assert.equal(fields.stageType, StageType.FUNDAMENTO_UNO);
    assert.equal(fields.order, 1);
    assert.equal(fields.guideText, "Observa tu postura");
    assert.equal(fields.guidePdfUrl, "https://cdn.example.com/am.pdf");
    assert.equal(fields.completionCriteria, "Puede nombrar las partes");
    assert.equal(fields.ctaLabel, "Practicar");
  });
});
