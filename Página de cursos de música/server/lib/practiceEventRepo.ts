/**
 * PD-2 Persistencia Durable H1 — repositorio de PracticeEvent (append-only).
 *
 * Data-access + helpers puros. NO se cablea a servicios en PD-2 (eso es PD-3).
 * Idempotencia por eventId (PK), (userId,eventType,causationCommandId) y naturalKey.
 * profileId H1 = userId (D-DOM-001). Sin score/accuracy/audio.
 */
import { Prisma, PrismaClient, type PracticeEventType } from "@prisma/client";
import type { FtcSlot } from "./rutaFtcDomainH1.js";

export type DbClient = PrismaClient | Prisma.TransactionClient;

export type PracticeEventPayloadH1 = {
  effectiveMinutes?: number;
  binaryComplete?: boolean;
  source: "practice_flow";
};

export type AppendPracticeEventInput = {
  eventId?: string;
  userId: string;
  eventType: PracticeEventType;
  occurredAt?: Date;
  sessionId?: string | null;
  tarjetaId?: string | null;
  unidadId?: string | null;
  monthIndex?: number | null;
  slot?: FtcSlot | null;
  payload: PracticeEventPayloadH1;
  causationCommandId?: string | null;
};

export type PracticeEventRowH1 = {
  id: string;
  userId: string;
  eventType: PracticeEventType;
  occurredAt: Date;
  sessionId: string | null;
  tarjetaId: string | null;
  unidadId: string | null;
  monthIndex: number | null;
  slot: number | null;
  payload: PracticeEventPayloadH1;
  causationCommandId: string | null;
  naturalKey: string | null;
};

export type FtcProjectionSnapshotH1 = {
  completedCardIds: string[];
  completedUnitIds: string[];
  slotsByUnit: Record<string, FtcSlot[]>;
};

/**
 * Clave natural denormalizada para UNIQUE parcial.
 * Determinista y pura — misma lógica que el store en memoria P0-05.
 */
export function buildPracticeEventNaturalKeyH1(input: {
  userId: string;
  eventType: PracticeEventType;
  tarjetaId?: string | null;
  unidadId?: string | null;
  sessionId?: string | null;
}): string | null {
  if (input.eventType === "ftc_card_completed" && input.tarjetaId) {
    return `${input.userId}:card:${input.tarjetaId}`;
  }
  if (input.eventType === "unit_completed" && input.unidadId) {
    return `${input.userId}:unit:${input.unidadId}`;
  }
  if (
    (input.eventType === "practice_started" ||
      input.eventType === "practice_completed" ||
      input.eventType === "practice_abandoned") &&
    input.sessionId
  ) {
    return `${input.userId}:session:${input.sessionId}:${input.eventType}`;
  }
  return null;
}

/**
 * Rebuild puro de la proyección FTC desde eventos.
 * Idempotente y determinista: reordena por occurredAt asc; ignora eventos incompletos.
 * No requiere DB — testeable en aislamiento (D-PD-02).
 */
export function rebuildFtcProjectionFromEvents(
  events: readonly PracticeEventRowH1[]
): FtcProjectionSnapshotH1 {
  const ordered = [...events].sort(
    (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime()
  );
  const completedCardIds = new Set<string>();
  const completedUnitIds = new Set<string>();
  const slotsByUnit = new Map<string, Set<FtcSlot>>();

  for (const event of ordered) {
    if (
      event.eventType === "ftc_card_completed" &&
      event.tarjetaId &&
      event.unidadId &&
      event.slot
    ) {
      completedCardIds.add(event.tarjetaId);
      const slots = slotsByUnit.get(event.unidadId) ?? new Set<FtcSlot>();
      slots.add(event.slot as FtcSlot);
      slotsByUnit.set(event.unidadId, slots);
    }
    if (event.eventType === "unit_completed" && event.unidadId) {
      completedUnitIds.add(event.unidadId);
    }
  }

  return {
    completedCardIds: [...completedCardIds],
    completedUnitIds: [...completedUnitIds],
    slotsByUnit: Object.fromEntries(
      [...slotsByUnit.entries()].map(([unitId, slots]) => [
        unitId,
        [...slots].sort((a, b) => a - b),
      ])
    ),
  };
}

function toRow(record: {
  id: string;
  userId: string;
  eventType: PracticeEventType;
  occurredAt: Date;
  sessionId: string | null;
  tarjetaId: string | null;
  unidadId: string | null;
  monthIndex: number | null;
  slot: number | null;
  payload: Prisma.JsonValue;
  causationCommandId: string | null;
  naturalKey: string | null;
}): PracticeEventRowH1 {
  return {
    id: record.id,
    userId: record.userId,
    eventType: record.eventType,
    occurredAt: record.occurredAt,
    sessionId: record.sessionId,
    tarjetaId: record.tarjetaId,
    unidadId: record.unidadId,
    monthIndex: record.monthIndex,
    slot: record.slot,
    payload: record.payload as PracticeEventPayloadH1,
    causationCommandId: record.causationCommandId,
    naturalKey: record.naturalKey,
  };
}

async function findExistingByKeys(
  db: DbClient,
  input: AppendPracticeEventInput,
  naturalKey: string | null
): Promise<PracticeEventRowH1 | null> {
  if (input.eventId) {
    const byId = await db.practiceEvent.findUnique({ where: { id: input.eventId } });
    if (byId) return toRow(byId);
  }
  if (input.causationCommandId) {
    const byCommand = await db.practiceEvent.findUnique({
      where: {
        practice_event_command_uq: {
          userId: input.userId,
          eventType: input.eventType,
          causationCommandId: input.causationCommandId,
        },
      },
    });
    if (byCommand) return toRow(byCommand);
  }
  if (naturalKey) {
    const byNatural = await db.practiceEvent.findUnique({ where: { naturalKey } });
    if (byNatural) return toRow(byNatural);
  }
  return null;
}

/**
 * Append idempotente de un PracticeEvent durable.
 * Devuelve el evento (nuevo o preexistente) e `inserted` para distinguir replays.
 */
export async function appendPracticeEventDurable(
  db: DbClient,
  input: AppendPracticeEventInput
): Promise<{ event: PracticeEventRowH1; inserted: boolean }> {
  const naturalKey = buildPracticeEventNaturalKeyH1(input);

  const existing = await findExistingByKeys(db, input, naturalKey);
  if (existing) return { event: existing, inserted: false };

  try {
    const created = await db.practiceEvent.create({
      data: {
        ...(input.eventId ? { id: input.eventId } : {}),
        userId: input.userId,
        eventType: input.eventType,
        occurredAt: input.occurredAt ?? new Date(),
        sessionId: input.sessionId ?? null,
        tarjetaId: input.tarjetaId ?? null,
        unidadId: input.unidadId ?? null,
        monthIndex: input.monthIndex ?? null,
        slot: input.slot ?? null,
        payload: input.payload as unknown as Prisma.InputJsonValue,
        causationCommandId: input.causationCommandId ?? null,
        naturalKey,
      },
    });
    return { event: toRow(created), inserted: true };
  } catch (error) {
    // Carrera: otro append ganó la constraint única → releer.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const raced = await findExistingByKeys(db, input, naturalKey);
      if (raced) return { event: raced, inserted: false };
    }
    throw error;
  }
}

export async function listPracticeEventsDurable(
  db: DbClient,
  userId: string
): Promise<PracticeEventRowH1[]> {
  const records = await db.practiceEvent.findMany({
    where: { userId },
    orderBy: { occurredAt: "asc" },
  });
  return records.map(toRow);
}
