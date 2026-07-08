import type { PathModuleData, PathNodeData } from "../../../data/gmusic-path-types";
import type { StartLessonSessionHookState } from "../../../hooks/useStartLessonSession";
import { findPathNodeById } from "../../../services/gmusic-api/map-path";

export function shouldOpenLessonRunner(
  lessonSession: StartLessonSessionHookState,
  lastOpenedRequestGeneration: number
): lessonSession is Extract<StartLessonSessionHookState, { status: "success" }> {
  return (
    lessonSession.status === "success" &&
    lessonSession.requestGeneration !== lastOpenedRequestGeneration
  );
}

export function resolveLessonRunnerOpen(
  modules: PathModuleData[],
  lessonSession: Extract<StartLessonSessionHookState, { status: "success" }>
): { kind: "open"; node: PathNodeData } | { kind: "missing-node" } {
  const node = findPathNodeById(modules, lessonSession.nodeId);
  if (!node) return { kind: "missing-node" };
  return { kind: "open", node };
}
