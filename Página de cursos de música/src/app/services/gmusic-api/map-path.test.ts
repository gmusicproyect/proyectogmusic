import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  deriveLane,
  derivePathNodeDescription,
  mapPathToViewModel,
  findPathNodeById,
} from "./map-path";
import type { PathResponse } from "./types";

const BASE_RESPONSE: PathResponse = {
  course: {
    id: "course-1",
    title: "Guitarra",
    slug: "guitarra-fundamentos",
    badge: { instrument: "Guitarra", month: "Mes 1", level: "Fundamento" },
  },
  modules: [
    {
      id: "m1",
      index: 1,
      title: "Fundamentos",
      focus: "Postura y primeros acordes",
      nodesCompleted: 1,
      nodesTotal: 3,
      nodes: [
        {
          id: "n1",
          title: "Postura",
          order: 1,
          status: "completed",
          duration: "8 min",
          contentKind: "video",
        },
        {
          id: "n2",
          title: "Primer acorde",
          order: 2,
          status: "active",
          duration: "5 min",
          contentKind: "audio_lab",
        },
        {
          id: "n3",
          title: "Siguiente paso",
          order: 3,
          status: "available",
          duration: "6 min",
          contentKind: "video",
        },
      ],
    },
    {
      id: "m2",
      index: 2,
      title: "Ritmo",
      focus: "Pulso estable",
      nodesCompleted: 0,
      nodesTotal: 1,
      nodes: [
        {
          id: "n4",
          title: "Metrónomo",
          order: 1,
          status: "locked",
          duration: "7 min",
          contentKind: "audio_lab",
        },
      ],
    },
  ],
  activeNodeId: "n2",
};

describe("mapPathToViewModel", () => {
  it("mapea módulos y nodos completos", () => {
    const viewModel = mapPathToViewModel(BASE_RESPONSE);

    assert.equal(viewModel.modules.length, 2);
    assert.equal(viewModel.modules[0]?.nodes.length, 3);
    assert.equal(viewModel.activeNodeId, "n2");
    assert.equal(viewModel.completedSteps, 1);
    assert.equal(viewModel.totalSteps, 4);
    assert.equal(viewModel.isEmpty, false);
    assert.equal(viewModel.isComplete, false);
    assert.equal(viewModel.defaultPanelNodeId, "n2");
  });

  it("preserva available y locked sin convertirlos", () => {
    const viewModel = mapPathToViewModel(BASE_RESPONSE);
    const available = findPathNodeById(viewModel.modules, "n3");
    const locked = findPathNodeById(viewModel.modules, "n4");

    assert.equal(available?.status, "available");
    assert.equal(locked?.status, "locked");
  });

  it("marca camino completado cuando activeNodeId es null", () => {
    const viewModel = mapPathToViewModel({
      ...BASE_RESPONSE,
      activeNodeId: null,
      modules: [
        {
          ...BASE_RESPONSE.modules[0],
          nodesCompleted: 3,
          nodesTotal: 3,
          nodes: BASE_RESPONSE.modules[0].nodes.map((node) => ({
            ...node,
            status: "completed",
          })),
        },
      ],
    });

    assert.equal(viewModel.activeNodeId, null);
    assert.equal(viewModel.isComplete, true);
    assert.equal(viewModel.defaultPanelNodeId, null);
  });

  it("marca camino vacío sin módulos", () => {
    const viewModel = mapPathToViewModel({
      ...BASE_RESPONSE,
      modules: [],
      activeNodeId: null,
    });

    assert.equal(viewModel.isEmpty, true);
    assert.equal(viewModel.totalSteps, 0);
  });

  it("normaliza números no finitos en índices y progreso", () => {
    const viewModel = mapPathToViewModel({
      ...BASE_RESPONSE,
      modules: [
        {
          ...BASE_RESPONSE.modules[0],
          index: Number.NaN,
          nodesCompleted: Number.POSITIVE_INFINITY,
          nodesTotal: Number.NEGATIVE_INFINITY,
          nodes: BASE_RESPONSE.modules[0].nodes,
        },
      ],
    });

    assert.equal(viewModel.modules[0]?.index, 0);
    assert.equal(viewModel.completedSteps, 1);
  });
});

describe("deriveLane", () => {
  it("asigna lane determinístico desde posición global", () => {
    assert.equal(deriveLane(0), "center");
    assert.equal(deriveLane(1), "right");
    assert.equal(deriveLane(2), "left");
    assert.equal(deriveLane(3), "center");
  });

  it("devuelve center para posiciones no finitas", () => {
    assert.equal(deriveLane(Number.NaN), "center");
    assert.equal(deriveLane(Number.POSITIVE_INFINITY), "center");
    assert.equal(deriveLane(Number.NEGATIVE_INFINITY), "center");
  });
});

describe("derivePathNodeDescription", () => {
  it("describe available sin afirmar que es active", () => {
    const description = derivePathNodeDescription("available", "Pulso estable");
    assert.match(description, /desbloqueado/i);
    assert.equal(description.toLowerCase().includes("nodo activo"), false);
  });
});

describe("seguridad del mapper de camino", () => {
  it("no expone secureAnswer ni correctOptionId", () => {
    const polluted = {
      ...BASE_RESPONSE,
      modules: [
        {
          ...BASE_RESPONSE.modules[0],
          nodes: [
            {
              ...BASE_RESPONSE.modules[0].nodes[0],
              secureAnswer: { correctOptionId: "x" },
              correctOptionId: "x",
            },
          ],
        },
      ],
    } as PathResponse;

    const serialized = JSON.stringify(mapPathToViewModel(polluted));
    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
  });
});
