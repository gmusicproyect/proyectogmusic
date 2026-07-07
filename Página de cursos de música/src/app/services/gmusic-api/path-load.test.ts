import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadPathOnce } from "./path-load";
import { mapPathToViewModel } from "./map-path";
import { getMockPathResponse } from "./mock-path";
import type { PathResponse } from "./types";
import { GmusicApiError } from "./client";

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
      focus: "Postura",
      nodesCompleted: 0,
      nodesTotal: 1,
      nodes: [
        {
          id: "n1",
          title: "Postura",
          order: 1,
          status: "active",
          duration: "5 min",
          contentKind: "video",
          videoUrl: null,
        },
      ],
    },
  ],
  activeNodeId: "n1",
};

describe("loadPathOnce", () => {
  it("solicitud abortada no produce error visual", async () => {
    const controller = new AbortController();
    controller.abort();

    const outcome = await loadPathOnce(controller.signal, {
      fetchPath: async () => BASE_RESPONSE,
      isPathMockEnabled: () => false,
      getMockPathResponse: () => BASE_RESPONSE,
      mapPathToViewModel,
    });

    assert.equal(outcome.type, "aborted");
  });

  it("retry exitoso reemplaza estado error", async () => {
    let attempts = 0;
    const fetchPath = async () => {
      attempts += 1;
      if (attempts === 1) {
        throw new GmusicApiError("Servicio no disponible", 503, "INTERNAL_ERROR");
      }
      return BASE_RESPONSE;
    };

    const first = await loadPathOnce(new AbortController().signal, {
      fetchPath,
      isPathMockEnabled: () => false,
      getMockPathResponse: () => BASE_RESPONSE,
      mapPathToViewModel,
    });
    assert.equal(first.type, "error");

    const second = await loadPathOnce(new AbortController().signal, {
      fetchPath,
      isPathMockEnabled: () => false,
      getMockPathResponse: () => BASE_RESPONSE,
      mapPathToViewModel,
    });
    assert.equal(second.type, "success");
  });

  it("API con modules vacíos devuelve empty state real, no mock", async () => {
    const emptyResponse: PathResponse = {
      course: {
        id: "course-real",
        title: "Ruta guitarra",
        slug: "ruta-guitarra-12-meses",
        badge: { instrument: "Guitarra", month: "Mes 1", level: "Fundamento" },
      },
      modules: [],
      activeNodeId: null,
    };

    const outcome = await loadPathOnce(new AbortController().signal, {
      fetchPath: async () => emptyResponse,
      isPathMockEnabled: () => false,
      getMockPathResponse,
      mapPathToViewModel,
    });

    assert.equal(outcome.type, "success");
    if (outcome.type !== "success") return;
    assert.equal(outcome.viewModel.isEmpty, true);
    assert.equal(outcome.viewModel.modules.length, 0);
    assert.notEqual(emptyResponse.course.id, "mock-course");
  });

  it("VITE_USE_PATH_MOCK=true sigue usando mock explícito", async () => {
    const outcome = await loadPathOnce(new AbortController().signal, {
      fetchPath: async () => {
        throw new Error("fetchPath no debe llamarse con mock explícito");
      },
      isPathMockEnabled: () => true,
      getMockPathResponse,
      mapPathToViewModel,
    });

    assert.equal(outcome.type, "success");
    if (outcome.type !== "success") return;
    assert.equal(outcome.viewModel.isEmpty, false);
    assert.ok(outcome.viewModel.modules.length > 0);
  });

  it("API con módulos publicados mapea respuesta real", async () => {
    const outcome = await loadPathOnce(new AbortController().signal, {
      fetchPath: async () => BASE_RESPONSE,
      isPathMockEnabled: () => false,
      getMockPathResponse,
      mapPathToViewModel,
    });

    assert.equal(outcome.type, "success");
    if (outcome.type !== "success") return;
    assert.equal(outcome.viewModel.isEmpty, false);
    assert.equal(outcome.viewModel.modules[0]?.title, "Fundamentos");
  });
});

describe("respuestas obsoletas del camino", () => {
  it("respuesta antigua no sobrescribe retry exitoso", async () => {
    const manager = await import("../../hooks/dashboard-request").then(
      (m) => new m.DashboardRequestManager()
    );

    let resolveSlow!: (value: PathResponse) => void;
    let callCount = 0;

    const fetchPath = async ({ signal }: { signal?: AbortSignal } = {}) => {
      callCount += 1;
      if (callCount === 1) {
        return new Promise<PathResponse>((resolve, reject) => {
          signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
          resolveSlow = resolve;
        });
      }
      return BASE_RESPONSE;
    };

    const deps = {
      fetchPath,
      isPathMockEnabled: () => false,
      getMockPathResponse: () => BASE_RESPONSE,
      mapPathToViewModel,
    };

    const { generation: slowGeneration, signal: slowSignal } = manager.begin();
    const slowPromise = loadPathOnce(slowSignal, deps);

    const { generation: fastGeneration, signal: fastSignal } = manager.begin();
    const fastOutcome = await loadPathOnce(fastSignal, deps);

    assert.equal(fastOutcome.type, "success");
    assert.equal(manager.isCurrent(fastGeneration), true);
    assert.equal(manager.isCurrent(slowGeneration), false);

    resolveSlow(BASE_RESPONSE);
    const slowOutcome = await slowPromise;
    assert.equal(slowOutcome.type, "aborted");
  });
});
