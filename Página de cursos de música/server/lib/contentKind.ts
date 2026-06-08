import type { ExerciseType } from "@prisma/client";

const AUDIO_LAB_TYPES: ExerciseType[] = ["EAR_TRAINING", "RHYTHM_TAP"];

export function deriveContentKind(exerciseTypes: ExerciseType[]): "video" | "audio_lab" | "reward" {
  if (exerciseTypes.length === 0) return "video";
  if (exerciseTypes.every((type) => AUDIO_LAB_TYPES.includes(type))) return "audio_lab";
  if (exerciseTypes.some((type) => AUDIO_LAB_TYPES.includes(type))) return "audio_lab";
  return "video";
}

export function deriveTypeLabel(contentKind: "video" | "audio_lab" | "reward", exerciseCount: number): string {
  if (contentKind === "audio_lab") return `Práctica guiada · ${Math.max(3, exerciseCount * 2)} min`;
  if (contentKind === "reward") return "Material de estudio";
  return `Lección · ${Math.max(5, exerciseCount * 3)} min`;
}
