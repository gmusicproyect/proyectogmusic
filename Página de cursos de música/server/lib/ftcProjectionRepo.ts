/**
 * PD-2 Persistencia Durable H1 — repositorio de FtcProgressProjection.
 *
 * Proyección de lectura recalculable desde PracticeEvent (D-PD-02).
 * NO se cablea a servicios en PD-2 (eso es PD-3).
 */
import type { Prisma } from "@prisma/client";
import type { FtcSlot } from "./rutaFtcDomainH1.js";
import {
  listPracticeEventsDurable,
  rebuildFtcProjectionFromEvents,
  type DbClient,
  type FtcProjectionSnapshotH1,
} from "./practiceEventRepo.js";

export type FtcProjectionRecordH1 = FtcProjectionSnapshotH1 & {
  userId: string;
  rebuiltAt: Date;
  rebuildSource: string;
  schemaVersion: number;
};

const SCHEMA_VERSION = 1;

function toRecord(row: {
  userId: string;
  completedCardIds: Prisma.JsonValue;
  completedUnitIds: Prisma.JsonValue;
  slotsByUnit: Prisma.JsonValue;
  rebuiltAt: Date;
  rebuildSource: string;
  schemaVersion: number;
}): FtcProjectionRecordH1 {
  return {
    userId: row.userId,
    completedCardIds: (row.completedCardIds as string[]) ?? [],
    completedUnitIds: (row.completedUnitIds as string[]) ?? [],
    slotsByUnit: (row.slotsByUnit as Record<string, FtcSlot[]>) ?? {},
    rebuiltAt: row.rebuiltAt,
    rebuildSource: row.rebuildSource,
    schemaVersion: row.schemaVersion,
  };
}

export async function getFtcProjectionDurable(
  db: DbClient,
  userId: string
): Promise<FtcProjectionRecordH1 | null> {
  const row = await db.ftcProgressProjection.findUnique({ where: { userId } });
  return row ? toRecord(row) : null;
}

/**
 * Recalcula la proyección desde los eventos durables y la persiste (idempotente).
 * rebuildSource identifica el origen: "events" (default) o "migration".
 */
export async function rebuildFtcProjectionDurable(
  db: DbClient,
  userId: string,
  options: { rebuildSource?: string; now?: Date } = {}
): Promise<FtcProjectionRecordH1> {
  const events = await listPracticeEventsDurable(db, userId);
  const snapshot = rebuildFtcProjectionFromEvents(events);
  const rebuiltAt = options.now ?? new Date();
  const rebuildSource = options.rebuildSource ?? "events";

  const row = await db.ftcProgressProjection.upsert({
    where: { userId },
    create: {
      userId,
      completedCardIds: snapshot.completedCardIds as unknown as Prisma.InputJsonValue,
      completedUnitIds: snapshot.completedUnitIds as unknown as Prisma.InputJsonValue,
      slotsByUnit: snapshot.slotsByUnit as unknown as Prisma.InputJsonValue,
      rebuiltAt,
      rebuildSource,
      schemaVersion: SCHEMA_VERSION,
    },
    update: {
      completedCardIds: snapshot.completedCardIds as unknown as Prisma.InputJsonValue,
      completedUnitIds: snapshot.completedUnitIds as unknown as Prisma.InputJsonValue,
      slotsByUnit: snapshot.slotsByUnit as unknown as Prisma.InputJsonValue,
      rebuiltAt,
      rebuildSource,
      schemaVersion: SCHEMA_VERSION,
    },
  });
  return toRecord(row);
}
