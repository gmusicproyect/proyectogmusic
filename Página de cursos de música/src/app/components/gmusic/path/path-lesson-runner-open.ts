import type { PathModuleData, PathNodeData } from "../../../data/gmusic-path-types";
import type { StartLessonSessionHookState } from "../../../hooks/useStartLessonSession";
import { findPathNodeById } from "../../../services/gmusic-api/map-path";
import type { LessonSessionResponse, LessonSessionStartResult } from "../../../services/gmusic-api/types";

export interface LessonRunnerLaunch {
  session: LessonSessionResponse;
  nodeTitle: string;
  nodeId: string;
  videoUrl: string | null;
  nodeDuration?: string;
  lessonNode: PathNodeData;
}

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

export function buildLessonRunnerLaunch(
  modules: PathModuleData[],
  lessonSession: Extract<StartLessonSessionHookState, { status: "success" }>
): { kind: "open"; runner: LessonRunnerLaunch } | { kind: "missing-node" } {
  return buildLessonRunnerLaunchFromResult(
    modules,
    lessonSession.nodeId,
    lessonSession.result
  );
}

export function buildLessonRunnerLaunchFromResult(
  modules: PathModuleData[],
  nodeId: string,
  result: LessonSessionStartResult
): { kind: "open"; runner: LessonRunnerLaunch } | { kind: "missing-node" } {
  const node = findPathNodeById(modules, nodeId);
  if (!node) return { kind: "missing-node" };

  return {
    kind: "open",
    runner: {
      session: result.session,
      nodeTitle: node.title,
      nodeId: node.id,
      videoUrl: node.videoUrl ?? null,
      nodeDuration: node.duration,
      lessonNode: node,
    },
  };
}
