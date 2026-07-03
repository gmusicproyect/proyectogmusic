import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PublishStatus, StageType } from "@prisma/client";
import {
  STAGE_TYPES_BY_ORDER,
  isNodeSlotComplete,
  validateModuleForPublish,
} from "../services/curriculum.js";

describe("curriculum publish rules", () => {
  const completeNodes = STAGE_TYPES_BY_ORDER.map((stageType, index) => ({
    id: `node-${index + 1}`,
    order: index + 1,
    title: `Etapa ${index + 1}`,
    status: PublishStatus.DRAFT,
    stageType,
    videoUrl: null,
    guidePdfUrl: null,
    guideText: "Guía",
    completionCriteria: "Completar la etapa",
    ctaLabel: "Continuar",
  }));

  it("acepta bloque con 5 etapas completas y stageType distintos", () => {
    const result = validateModuleForPublish(completeNodes);
    assert.equal(result.ok, true);
  });

  it("rechaza bloque con menos de 5 etapas", () => {
    const result = validateModuleForPublish(completeNodes.slice(0, 4));
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.reason, /5 etapas/);
    }
  });

  it("rechaza etapa sin criterio de completado", () => {
    const incomplete = completeNodes.map((node, index) =>
      index === 2 ? { ...node, completionCriteria: null } : node
    );
    assert.equal(isNodeSlotComplete(incomplete[2]!), false);
    const result = validateModuleForPublish(incomplete);
    assert.equal(result.ok, false);
  });

  it("stageTypeForOrder cubre los 5 slots", () => {
    assert.equal(STAGE_TYPES_BY_ORDER.length, 5);
    assert.equal(STAGE_TYPES_BY_ORDER[0], StageType.FUNDAMENTO_UNO);
    assert.equal(STAGE_TYPES_BY_ORDER[4], StageType.TOCAR);
  });
});
