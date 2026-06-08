export type PathNodeStatus = "locked" | "available" | "active" | "completed";

export interface OrderedNode {
  id: string;
}

export interface ProgressSnapshot {
  isCompleted: boolean;
}

/**
 * Deriva estados de camino en orden global (módulo → nodo).
 * - completed: UserProgress.isCompleted
 * - locked: nodo anterior no completado
 * - active: primer nodo desbloqueado e incompleto
 * - available: desbloqueado pero no es el foco actual
 */
export function deriveNodeStatuses(
  orderedNodes: OrderedNode[],
  progressByNodeId: Map<string, ProgressSnapshot>
): Map<string, PathNodeStatus> {
  const statuses = new Map<string, PathNodeStatus>();
  let activeAssigned = false;

  for (let index = 0; index < orderedNodes.length; index++) {
    const node = orderedNodes[index];
    const progress = progressByNodeId.get(node.id);

    if (progress?.isCompleted) {
      statuses.set(node.id, "completed");
      continue;
    }

    const previous = orderedNodes[index - 1];
    const previousCompleted =
      index === 0 || progressByNodeId.get(previous.id)?.isCompleted === true;

    if (!previousCompleted) {
      statuses.set(node.id, "locked");
      continue;
    }

    if (!activeAssigned) {
      statuses.set(node.id, "active");
      activeAssigned = true;
    } else {
      statuses.set(node.id, "available");
    }
  }

  return statuses;
}
