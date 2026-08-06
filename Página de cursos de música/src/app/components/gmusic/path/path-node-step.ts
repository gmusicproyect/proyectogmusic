import type { PathModuleData, PathNodeData } from "../../../data/gmusic-path-types";

export interface PathNodeWithStep {
  node: PathNodeData;
  stepNumber: number;
  moduleTitle: string;
}

/** Índice global del camino (1…N), alineado con el carrusel de Tarjetas. */
export function flattenPathNodesWithStep(modules: PathModuleData[]): PathNodeWithStep[] {
  let stepNumber = 0;
  return modules.flatMap((module) =>
    module.nodes.map((node) => {
      stepNumber += 1;
      return { node, stepNumber, moduleTitle: module.title };
    })
  );
}
