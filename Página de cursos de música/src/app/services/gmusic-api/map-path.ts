import type {
  PathBadgeData,
  PathLane,
  PathModuleData,
  PathNodeData,
  NodeStatus,
  NodeType,
} from "../../data/gmusic-path-types";
import { nonNegative } from "./map-dashboard";
import type { PathContentKind, PathNodeStatus, PathResponse } from "./types";

export interface PathViewModel {
  badge: PathBadgeData;
  modules: PathModuleData[];
  activeNodeId: string | null;
  completedSteps: number;
  totalSteps: number;
  isEmpty: boolean;
  isComplete: boolean;
  defaultPanelNodeId: string | null;
}

const LANE_CYCLE: PathLane[] = ["center", "right", "left"];

export function deriveLane(globalIndex: number): PathLane {
  if (!Number.isFinite(globalIndex) || globalIndex < 0) return "center";
  return LANE_CYCLE[Math.floor(globalIndex) % LANE_CYCLE.length];
}

export function derivePathNodeTypeLabel(contentKind: PathContentKind, duration: string): string {
  const safeDuration = duration.trim();
  if (contentKind === "audio_lab") {
    return safeDuration ? `Práctica guiada · ${safeDuration}` : "Práctica guiada";
  }
  if (contentKind === "reward") return "Material de estudio";
  return safeDuration ? `Lección · ${safeDuration}` : "Lección";
}

function normalizeNodeStatus(status: PathNodeStatus): NodeStatus {
  if (status === "completed" || status === "active" || status === "available" || status === "locked") {
    return status;
  }
  return "locked";
}

function mapContentKind(contentKind: PathContentKind): NodeType {
  if (contentKind === "audio_lab" || contentKind === "reward" || contentKind === "video") {
    return contentKind;
  }
  return "video";
}

export function derivePathNodeDescription(
  status: NodeStatus,
  moduleFocus: string
): string {
  if (status === "available") {
    return "Este paso ya está desbloqueado. Puedes revisarlo sin cambiar tu foco actual.";
  }
  if (status === "active") {
    return moduleFocus || "Continúa con este paso para avanzar en tu camino.";
  }
  return "";
}

export function mapPathToViewModel(response: PathResponse): PathViewModel {
  let globalIndex = 0;
  const modules: PathModuleData[] = response.modules.map((module) => ({
    id: module.id,
    index: nonNegative(module.index),
    title: module.title,
    focus: module.focus,
    nodes: module.nodes.map((node) => {
      const status = normalizeNodeStatus(node.status);
      const type = mapContentKind(node.contentKind);
      const lane = deriveLane(globalIndex);
      globalIndex += 1;

      return {
        id: node.id,
        title: node.title,
        type,
        status,
        lane,
        duration: node.duration,
        typeLabel: derivePathNodeTypeLabel(node.contentKind, node.duration),
        description: derivePathNodeDescription(status, module.focus),
        videoUrl: node.videoUrl ?? null,
      } satisfies PathNodeData;
    }),
  }));

  const allNodes = modules.flatMap((module) => module.nodes);
  const completedSteps = allNodes.filter((node) => node.status === "completed").length;
  const totalSteps = allNodes.length;
  const activeNodeId = response.activeNodeId;
  const isEmpty = modules.length === 0 || totalSteps === 0;
  const isComplete = !isEmpty && activeNodeId === null && completedSteps === totalSteps;

  return {
    badge: {
      instrument: response.course.badge.instrument,
      month: response.course.badge.month,
      level: response.course.badge.level,
    },
    modules,
    activeNodeId,
    completedSteps,
    totalSteps,
    isEmpty,
    isComplete,
    defaultPanelNodeId: activeNodeId,
  };
}

export function findPathNodeById(
  modules: PathModuleData[],
  nodeId: string | null | undefined
): PathNodeData | null {
  if (!nodeId) return null;
  for (const module of modules) {
    const node = module.nodes.find((entry) => entry.id === nodeId);
    if (node) return node;
  }
  return null;
}

export function countPathProgressFromViewModel(modules: PathModuleData[]) {
  const all = modules.flatMap((module) => module.nodes);
  return {
    completed: all.filter((node) => node.status === "completed").length,
    total: all.length,
  };
}
