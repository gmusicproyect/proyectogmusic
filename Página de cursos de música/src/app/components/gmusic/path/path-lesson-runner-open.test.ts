import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { PathModuleData } from "../../../data/gmusic-path-types";
import {
  resolveLessonRunnerOpen,
  shouldOpenLessonRunner,
} from "./path-lesson-runner-open";

const NODE_ID = "94d0f47c-f493-4ba9-aed4-67aa6f13a5f0";

const MODULES: PathModuleData[] = [
  {
    id: "module-1",
    index: 1,
    title: "Fundamentos",
    focus: "Postura",
    nodes: [
      {
        id: NODE_ID,
        title: "Tu guitarra y postura",
        type: "video",
        status: "active",
        lane: "center",
        duration: "6 min",
        typeLabel: "Lección · 6 min",
        description: "",
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      },
    ],
  },
];

describe("path-lesson-runner-open", () => {
  it("abre solo en success con requestGeneration nuevo", () => {
    assert.equal(
      shouldOpenLessonRunner(
        { status: "success", nodeId: NODE_ID, requestGeneration: 2, result: {} as never },
        2
      ),
      false
    );
    assert.equal(
      shouldOpenLessonRunner(
        { status: "success", nodeId: NODE_ID, requestGeneration: 3, result: {} as never },
        2
      ),
      true
    );
    assert.equal(shouldOpenLessonRunner({ status: "loading", nodeId: NODE_ID, requestGeneration: 1 }, 0), false);
  });

  it("resuelve nodo del camino para abrir runner", () => {
    const resolution = resolveLessonRunnerOpen(MODULES, {
      status: "success",
      nodeId: NODE_ID,
      requestGeneration: 1,
      result: { kind: "created", session: { sessionId: "s1", nodeId: NODE_ID, status: "STARTED", startedAt: "", expiresAt: "", exercises: [] } },
    });

    assert.equal(resolution.kind, "open");
    if (resolution.kind === "open") {
      assert.equal(resolution.node.title, "Tu guitarra y postura");
    }
  });

  it("marca missing-node si el id no está en el mapa cargado", () => {
    const resolution = resolveLessonRunnerOpen(MODULES, {
      status: "success",
      nodeId: "00000000-0000-4000-8000-000000000099",
      requestGeneration: 1,
      result: { kind: "created", session: { sessionId: "s1", nodeId: NODE_ID, status: "STARTED", startedAt: "", expiresAt: "", exercises: [] } },
    });

    assert.equal(resolution.kind, "missing-node");
  });
});
