import type { PathNodeStatus } from "../lib/nodeStatus.js";
import { deriveContentKind, deriveTypeLabel } from "../lib/contentKind.js";
import type { ExerciseType } from "@prisma/client";

interface ModuleLike {
  id: string;
  title: string;
  nodes: Array<{ id: string; title: string; exercises: Array<{ type: ExerciseType }> }>;
}

export interface ActiveNodeContext {
  module: ModuleLike;
  moduleIndex: number;
  node: ModuleLike["nodes"][number];
  nodeIndex: number;
  contentKind: ReturnType<typeof deriveContentKind>;
  nodesTotal: number;
}

export interface ModuleProgressSnapshot {
  module: ModuleLike;
  moduleIndex: number;
  completedNodes: number;
  totalNodes: number;
  currentNodeTitle: string;
  pathLabel: string;
}

export interface NextPracticeSnapshot {
  nodeId: string;
  title: string;
  typeLabel: string;
  description: string;
}

export function resolveModuleProgress(
  modules: ModuleLike[],
  statusByNodeId: Map<string, PathNodeStatus>,
  activeContext: ActiveNodeContext | null
): ModuleProgressSnapshot | null {
  if (modules.length === 0) return null;

  if (activeContext) {
    const completedInModule = activeContext.module.nodes.filter(
      (node) => statusByNodeId.get(node.id) === "completed"
    ).length;

    return {
      module: activeContext.module,
      moduleIndex: activeContext.moduleIndex,
      completedNodes: completedInModule,
      totalNodes: activeContext.nodesTotal,
      currentNodeTitle: activeContext.node.title,
      pathLabel: `Mes ${activeContext.moduleIndex + 1} · Nodo ${activeContext.nodeIndex + 1} de ${activeContext.nodesTotal}`,
    };
  }

  for (let index = modules.length - 1; index >= 0; index--) {
    const module = modules[index];
    const totalNodes = module.nodes.length;
    if (totalNodes === 0) continue;

    const completedNodes = module.nodes.filter(
      (node) => statusByNodeId.get(node.id) === "completed"
    ).length;

    if (completedNodes === totalNodes) {
      const lastNode = module.nodes[totalNodes - 1];
      return {
        module,
        moduleIndex: index,
        completedNodes,
        totalNodes,
        currentNodeTitle: lastNode.title,
        pathLabel: `Mes ${index + 1} · Camino completado`,
      };
    }
  }

  const firstModule = modules[0];
  return {
    module: firstModule,
    moduleIndex: 0,
    completedNodes: 0,
    totalNodes: firstModule.nodes.length,
    currentNodeTitle: firstModule.nodes[0]?.title ?? "",
    pathLabel: `Mes 1 · Nodo 1 de ${firstModule.nodes.length || 1}`,
  };
}

export function buildNextPractice(
  activeContext: ActiveNodeContext | null,
  instruction: string | null
): NextPracticeSnapshot | null {
  if (!activeContext) return null;

  const exerciseCount = activeContext.node.exercises.length;
  const contentKind = deriveContentKind(
    activeContext.node.exercises.map((exercise) => exercise.type)
  );

  return {
    nodeId: activeContext.node.id,
    title: activeContext.node.title,
    typeLabel: deriveTypeLabel(contentKind, exerciseCount),
    description:
      instruction ?? "Continúa tu práctica en el nodo activo del camino.",
  };
}
