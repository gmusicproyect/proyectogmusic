import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PathModuleData, PathNodeData } from "../data/gmusic-path-types";
import { mapPathToViewModel } from "../services/gmusic-api/map-path";
import type { PathResponse } from "../services/gmusic-api/types";
import {
  flattenPathNodesWithStep,
  pathNodesFromEntries,
} from "./path-student-entries";
import { resolveLessonStageSlot } from "../components/gmusic/lesson/lesson-stage";

function node(
  partial: Partial<PathNodeData> & Pick<PathNodeData, "id" | "title">
): PathNodeData {
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

const STAGE_TYPES = [
  "FUNDAMENTO_UNO",
  "FUNDAMENTO_DOS",
  "TECNICA",
  "PRACTICA",
  "TOCAR",
] as const;

describe("path-student-entries — F1 regresión Tarjetas / Resumen PDF", () => {
  it("5 nodos H1: mismo orden, stepNumber global y guidePdfUrl 1:1 en entries", () => {
    const modules: PathModuleData[] = [
      {
        id: "h1",
        index: 1,
        title: "Habilidad 1",
        focus: "",
        nodes: STAGE_TYPES.map((stageType, index) =>
          node({
            id: `h1-n${index + 1}`,
            title: `Etapa ${index + 1}`,
            order: index + 1,
            stageType,
            guidePdfUrl: `https://cdn.example.com/h1-etapa-${index + 1}.pdf`,
          })
        ),
      },
    ];

    const entries = flattenPathNodesWithStep(modules);
    const carouselNodes = pathNodesFromEntries(entries);

    assert.equal(entries.length, 5);
    assert.equal(carouselNodes.length, 5);

    for (let i = 0; i < 5; i += 1) {
      const step = i + 1;
      assert.equal(entries[i].stepNumber, step);
      assert.equal(entries[i].node.id, `h1-n${step}`);
      assert.equal(entries[i].node.guidePdfUrl, `https://cdn.example.com/h1-etapa-${step}.pdf`);
      assert.equal(carouselNodes[i].id, entries[i].node.id);
      assert.equal(carouselNodes[i].guidePdfUrl, entries[i].node.guidePdfUrl);
    }

    const practica = entries[3];
    const tocar = entries[4];
    assert.equal(practica.stepNumber, 4);
    assert.equal(tocar.stepNumber, 5);
    assert.equal(resolveLessonStageSlot(practica.node.stageType, practica.stepNumber), 4);
    assert.equal(resolveLessonStageSlot(tocar.node.stageType, tocar.stepNumber), 5);
    assert.equal(practica.node.guidePdfUrl, "https://cdn.example.com/h1-etapa-4.pdf");
    assert.equal(tocar.node.guidePdfUrl, "https://cdn.example.com/h1-etapa-5.pdf");
  });

  it("mapPathToViewModel expone entries alineadas con el carrusel", () => {
    const response: PathResponse = {
      course: {
        id: "course-1",
        title: "Guitarra",
        slug: "guitarra",
        badge: { instrument: "Guitarra", month: "Mes 1", level: "H1" },
      },
      modules: [
        {
          id: "m1",
          index: 1,
          title: "Bloque 1",
          focus: "",
          nodesCompleted: 0,
          nodesTotal: 2,
          nodes: [
            {
              id: "n1",
              title: "A",
              order: 1,
              status: "completed",
              duration: "5 min",
              contentKind: "video",
              videoUrl: null,
              stageType: "FUNDAMENTO_UNO",
              guideText: null,
              guidePdfUrl: "https://cdn.example.com/a.pdf",
              completionCriteria: null,
              ctaLabel: null,
            },
            {
              id: "n2",
              title: "B",
              order: 2,
              status: "active",
              duration: "5 min",
              contentKind: "video",
              videoUrl: null,
              stageType: "FUNDAMENTO_DOS",
              guideText: null,
              guidePdfUrl: "https://cdn.example.com/b.pdf",
              completionCriteria: null,
              ctaLabel: null,
            },
          ],
        },
        {
          id: "m2",
          index: 2,
          title: "Bloque 2",
          focus: "",
          nodesCompleted: 0,
          nodesTotal: 3,
          nodes: [
            {
              id: "n3",
              title: "C",
              order: 1,
              status: "locked",
              duration: "5 min",
              contentKind: "video",
              videoUrl: null,
              stageType: "TECNICA",
              guideText: null,
              guidePdfUrl: "https://cdn.example.com/c.pdf",
              completionCriteria: null,
              ctaLabel: null,
            },
            {
              id: "n4",
              title: "D",
              order: 2,
              status: "locked",
              duration: "5 min",
              contentKind: "video",
              videoUrl: null,
              stageType: "PRACTICA",
              guideText: null,
              guidePdfUrl: "https://cdn.example.com/d.pdf",
              completionCriteria: null,
              ctaLabel: null,
            },
            {
              id: "n5",
              title: "E",
              order: 3,
              status: "locked",
              duration: "5 min",
              contentKind: "video",
              videoUrl: null,
              stageType: "TOCAR",
              guideText: null,
              guidePdfUrl: "https://cdn.example.com/e.pdf",
              completionCriteria: null,
              ctaLabel: null,
            },
          ],
        },
      ],
      activeNodeId: "n2",
    };

    const viewModel = mapPathToViewModel(response);
    const carouselNodes = pathNodesFromEntries(viewModel.entries);

    assert.equal(viewModel.entries.length, 5);
    assert.deepEqual(
      viewModel.entries.map((entry) => entry.node.id),
      carouselNodes.map((n) => n.id)
    );
    assert.deepEqual(
      viewModel.entries.map((entry) => entry.node.guidePdfUrl),
      [
        "https://cdn.example.com/a.pdf",
        "https://cdn.example.com/b.pdf",
        "https://cdn.example.com/c.pdf",
        "https://cdn.example.com/d.pdf",
        "https://cdn.example.com/e.pdf",
      ]
    );
    assert.equal(viewModel.entries[3].stepNumber, 4);
    assert.equal(viewModel.entries[4].stepNumber, 5);
  });
});
