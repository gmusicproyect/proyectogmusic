import type { PathModuleData, PathNodeData } from "../data/gmusic-path-types";

export interface PathNodeWithStep {
  node: PathNodeData;
  stepNumber: number;
  moduleTitle: string;
}

/** Índice global del camino (1…N), única fuente para Tarjetas y Resumen PDF. */
export function flattenPathNodesWithStep(modules: PathModuleData[]): PathNodeWithStep[] {
  let stepNumber = 0;
  return modules.flatMap((module) =>
    module.nodes.map((node) => {
      stepNumber += 1;
      return { node, stepNumber, moduleTitle: module.title };
    })
  );
}

export function pathNodesFromEntries(entries: PathNodeWithStep[]): PathNodeData[] {
  return entries.map((entry) => entry.node);
}
