/**
 * PD-3 R-001 — snapshot de contenido al iniciar LessonSession.
 * secureAnswer vive solo en DB (nunca en response API).
 */
import type { Prisma } from "@prisma/client";
import type { DbClient } from "./practiceEventRepo.js";

export type LessonContentSnapshotExerciseH1 = {
  microExerciseId: string;
  type: string;
  order: number;
  contentPayload: Prisma.JsonValue;
  /** Solo servidor — nunca serializar a API pública. */
  secureAnswer: Prisma.JsonValue;
};

export type LessonContentSnapshotH1 = {
  nodeId: string;
  capturedAt: string;
  exercises: LessonContentSnapshotExerciseH1[];
};

export async function captureLessonContentSnapshot(
  db: DbClient,
  nodeId: string,
  options: { now?: Date } = {}
): Promise<{ snapshot: LessonContentSnapshotH1; contentVersion: number }> {
  const exercises = await db.microExercise.findMany({
    where: { nodeId },
    orderBy: { order: "asc" },
    select: {
      id: true,
      type: true,
      order: true,
      contentPayload: true,
      secureAnswer: true,
    },
  });

  const node = await db.pathNode.findUnique({
    where: { id: nodeId },
    select: {
      module: { select: { course: { select: { version: true } } } },
    },
  });

  const snapshot: LessonContentSnapshotH1 = {
    nodeId,
    capturedAt: (options.now ?? new Date()).toISOString(),
    exercises: exercises.map((exercise) => ({
      microExerciseId: exercise.id,
      type: exercise.type,
      order: exercise.order,
      contentPayload: exercise.contentPayload,
      secureAnswer: exercise.secureAnswer,
    })),
  };

  return {
    snapshot,
    contentVersion: node?.module.course.version ?? 1,
  };
}

/** Extrae mapa id→secureAnswer desde snapshot JSON de LessonSession. */
export function secureAnswersFromSnapshot(
  snapshot: Prisma.JsonValue | null | undefined
): Map<string, Prisma.JsonValue> | null {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }
  const exercises = (snapshot as { exercises?: unknown }).exercises;
  if (!Array.isArray(exercises)) return null;
  const map = new Map<string, Prisma.JsonValue>();
  for (const item of exercises) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as {
      microExerciseId?: unknown;
      secureAnswer?: Prisma.JsonValue;
    };
    if (typeof row.microExerciseId === "string" && row.secureAnswer !== undefined) {
      map.set(row.microExerciseId, row.secureAnswer);
    }
  }
  return map.size > 0 ? map : null;
}
