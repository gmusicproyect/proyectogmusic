import {
  ACTIVE_NODE_ID,
  ACTIVE_NODE_PANEL,
  PATH_BADGE,
  PATH_MODULES,
} from "../../data/gmusic-path-data";
import type { PathResponse } from "./types";

/** Fallback explícito de desarrollo — solo cuando VITE_USE_PATH_MOCK=true. */
export function getMockPathResponse(): PathResponse {
  return {
    course: {
      id: "mock-course",
      title: "Guitarra · Fundamentos",
      slug: "guitarra-fundamentos",
      badge: PATH_BADGE,
    },
    modules: PATH_MODULES.map((module) => ({
      id: module.id,
      index: module.index,
      title: module.title,
      focus: module.focus,
      nodesCompleted: module.nodes.filter((node) => node.status === "completed").length,
      nodesTotal: module.nodes.length,
      nodes: module.nodes.map((node, index) => ({
        id: node.id,
        title: node.title,
        order: index + 1,
        status: node.status,
        duration: node.duration ?? "5 min",
        contentKind: node.type,
        videoUrl: null,
      })),
    })),
    activeNodeId: ACTIVE_NODE_ID,
  };
}

export function getMockActiveNodePanel() {
  return ACTIVE_NODE_PANEL;
}
