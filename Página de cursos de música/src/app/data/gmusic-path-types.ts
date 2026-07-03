export type NodeStatus = "completed" | "active" | "available" | "locked";
export type NodeType = "video" | "audio_lab" | "reward";
export type PathLane = "left" | "center" | "right";

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
  video: "Lección",
  audio_lab: "Práctica guiada",
  reward: "Material de estudio",
};

export interface PathNodeData {
  id: string;
  title: string;
  type: NodeType;
  status: NodeStatus;
  lane: PathLane;
  duration?: string;
  typeLabel?: string;
  description?: string;
  videoUrl?: string | null;
}

export interface PathModuleData {
  id: string;
  index: number;
  title: string;
  focus: string;
  nodes: PathNodeData[];
}

export interface PathBadgeData {
  instrument: string;
  month: string;
  level: string;
}

export function countPathProgress(modules: PathModuleData[]) {
  const all = modules.flatMap((m) => m.nodes);
  const completed = all.filter((n) => n.status === "completed").length;
  return { completed, total: all.length };
}
