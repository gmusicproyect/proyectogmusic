import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PathModuleData, PathNodeData } from "../../../data/gmusic-path-types";
import { flattenPathNodesWithStep } from "./path-node-step";
import { resolveLessonStageSlot } from "../lesson/lesson-stage";

function node(partial: Partial<PathNodeData> & Pick<PathNodeData, "id" | "title">): PathNodeData {
  return {
    type: "video",
    status: "active",
    lane: "center",
    order: partial.order ?? 1,
    duration: "5 min",
    typeLabel: "Lección",
    description: "",
    videoUrl: null,
    stageType: null,
    guideText: null,
    guidePdfUrl: null,
    completionCriteria: null,
    ctaLabel: null,
    ...partial,
  };
}

describe("path-node-step — alineación Tarjetas / Resumen PDF", () => {
  it("asigna stepNumber global aunque node.order sea local al módulo", () => {
    const modules: PathModuleData[] = [
      {
        id: "m1",
        index: 0,
        title: "Bloque 1",
        focus: "",
        nodes: [
          node({ id: "n1", title: "A", order: 1 }),
          node({ id: "n2", title: "B", order: 2 }),
        ],
      },
      {
        id: "m2",
        index: 1,
        title: "Bloque 2",
        focus: "",
        nodes: [
          node({ id: "n3", title: "C", order: 1, stageType: "PRACTICA" }),
          node({ id: "n4", title: "D", order: 2, stageType: "TOCAR" }),
        ],
      },
    ];

    const flattened = flattenPathNodesWithStep(modules);
    assert.equal(flattened.length, 4);
    assert.deepEqual(
      flattened.map((entry) => entry.stepNumber),
      [1, 2, 3, 4]
    );

    const practica = flattened[2];
    assert.equal(practica.stepNumber, 3);
    assert.equal(resolveLessonStageSlot(practica.node.stageType, practica.stepNumber), 4);

    const tocar = flattened[3];
    assert.equal(tocar.stepNumber, 4);
    assert.equal(resolveLessonStageSlot(tocar.node.stageType, tocar.stepNumber), 5);
  });
});
