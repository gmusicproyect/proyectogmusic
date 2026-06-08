import type { PathModuleData } from "./gmusic-path-types";
import { countPathProgress } from "./gmusic-path-types";

export type {
  NodeStatus,
  NodeType,
  PathLane,
  PathNodeData,
  PathModuleData,
  PathBadgeData,
} from "./gmusic-path-types";
export { NODE_TYPE_LABELS, countPathProgress } from "./gmusic-path-types";

export const PATH_BADGE: PathBadgeData = {
  instrument: "Guitarra",
  month: "Mes 2",
  level: "Fundamento",
};

export const ACTIVE_NODE_PANEL = {
  title: "Tu primer rasgueo en 4/4",
  typeLabel: "Práctica guiada · 5 min",
  description:
    "Trabaja el patrón base con calma y precisión. El objetivo es sentir el pulso antes de acelerar.",
};

export const PATH_MODULES: PathModuleData[] = [
  {
    id: "mod-1",
    index: 1,
    title: "Fundamentos",
    focus: "Postura, primeros acordes y escucha del instrumento",
    nodes: [
      { id: "m1-n1", title: "Tu guitarra y postura", type: "video", status: "completed", lane: "center", duration: "8 min" },
      { id: "m1-n2", title: "Primer acorde Am", type: "video", status: "completed", lane: "right", duration: "10 min" },
      { id: "m1-n3", title: "Escucha el pulso", type: "audio_lab", status: "completed", lane: "center", duration: "6 min" },
      { id: "m1-n4", title: "Em y cambio básico", type: "video", status: "completed", lane: "left", duration: "9 min" },
      { id: "m1-n5", title: "Guía de afinación", type: "reward", status: "completed", lane: "center", duration: "PDF" },
    ],
  },
  {
    id: "mod-2",
    index: 2,
    title: "Acordes abiertos",
    focus: "Formación de acordes y cambios limpios entre posiciones",
    nodes: [
      { id: "m2-n1", title: "Acorde G mayor", type: "video", status: "completed", lane: "right", duration: "11 min" },
      { id: "m2-n2", title: "Progresión Am–Em", type: "video", status: "completed", lane: "center", duration: "10 min" },
      { id: "m2-n3", title: "Laboratorio de cambios", type: "audio_lab", status: "completed", lane: "left", duration: "7 min" },
      { id: "m2-n4", title: "Acorde C mayor", type: "video", status: "completed", lane: "center", duration: "9 min" },
      { id: "m2-n5", title: "Diagramas de acordes", type: "reward", status: "completed", lane: "right", duration: "PDF" },
    ],
  },
  {
    id: "mod-3",
    index: 3,
    title: "Ritmo y rasgueo",
    focus: "Pulso estable, patrones básicos y continuidad en la práctica",
    nodes: [
      { id: "m3-n1", title: "Patrón down-down-up", type: "video", status: "completed", lane: "left", duration: "8 min" },
      { id: "m3-n2", title: "Trabajo con metrónomo", type: "audio_lab", status: "completed", lane: "center", duration: "6 min" },
      { id: "m3-n3", title: "Tu primer rasgueo en 4/4", type: "audio_lab", status: "active", lane: "right", duration: "5 min" },
      { id: "m3-n4", title: "Rasgueo con acordes", type: "video", status: "locked", lane: "center", duration: "10 min" },
      { id: "m3-n5", title: "Síntesis del módulo", type: "reward", status: "locked", lane: "left", duration: "12 min" },
      { id: "m3-n6", title: "Revisión del mes", type: "video", status: "locked", lane: "center", duration: "14 min" },
    ],
  },
];

export const ACTIVE_NODE_ID = "m3-n3";

/** Enriquece nodos mock con datos de panel para desarrollo explícito. */
export function getMockPathModules(): PathModuleData[] {
  return PATH_MODULES.map((module) => ({
    ...module,
    nodes: module.nodes.map((node) => {
      if (node.id !== ACTIVE_NODE_ID) return node;
      return {
        ...node,
        typeLabel: ACTIVE_NODE_PANEL.typeLabel,
        description: ACTIVE_NODE_PANEL.description,
      };
    }),
  }));
}
