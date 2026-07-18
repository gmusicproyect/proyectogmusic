/**
 * PD-3 — bridge de eventos/proyección FTC.
 * Flag OFF → store memoria P0-05. Flag ON → PracticeEvent + FtcProgressProjection.
 */
import { ApiError } from "./errors.js";
import { isH1DurableEnabled } from "./h1DurableFlag.js";
import { prisma } from "./prisma.js";
import {
  appendPracticeEventDurable,
  listPracticeEventsDurable,
  type AppendPracticeEventInput,
  type PracticeEventRowH1,
} from "./practiceEventRepo.js";
import {
  getFtcProjectionDurable,
  rebuildFtcProjectionDurable,
} from "./ftcProjectionRepo.js";
import {
  appendLearningEventH1,
  assertFtcSequenceH1,
  getPracticeProjectionH1,
  getPracticeSessionMetadataH1,
  listLearningEventsH1,
  registerPracticeSessionH1,
  type LearningEventH1,
  type PracticeEventTypeH1,
  type PracticeSessionMetadataH1,
} from "./practiceEventsH1.js";
import type { FtcSlot } from "./rutaFtcDomainH1.js";
import type { PracticeEventPayloadH1 } from "./practiceEventRepo.js";

function rowToLearningEvent(row: PracticeEventRowH1): LearningEventH1 {
  return {
    eventId: row.id,
    eventType: row.eventType as PracticeEventTypeH1,
    profileId: row.userId,
    occurredAt: row.occurredAt.toISOString(),
    sessionId: row.sessionId,
    tarjetaId: row.tarjetaId,
    unidadId: row.unidadId,
    monthIndex: row.monthIndex,
    slot: (row.slot as FtcSlot | null) ?? null,
    payload: row.payload,
    causationCommandId: row.causationCommandId,
  };
}

export async function appendLearningEvent(
  input: Omit<LearningEventH1, "eventId" | "occurredAt"> & {
    eventId?: string;
    occurredAt?: string;
  }
): Promise<{ event: LearningEventH1; inserted: boolean }> {
  if (!isH1DurableEnabled()) {
    return appendLearningEventH1(input);
  }

  const durableInput: AppendPracticeEventInput = {
    eventId: input.eventId,
    userId: input.profileId,
    eventType: input.eventType,
    occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined,
    sessionId: input.sessionId,
    tarjetaId: input.tarjetaId,
    unidadId: input.unidadId,
    monthIndex: input.monthIndex,
    slot: input.slot,
    payload: input.payload as PracticeEventPayloadH1,
    causationCommandId: input.causationCommandId,
  };

  const { event, inserted } = await appendPracticeEventDurable(prisma, durableInput);
  if (inserted) {
    await rebuildFtcProjectionDurable(prisma, input.profileId, {
      rebuildSource: "events",
    });
  }
  return { event: rowToLearningEvent(event), inserted };
}

export async function listLearningEvents(
  profileId: string
): Promise<LearningEventH1[]> {
  if (!isH1DurableEnabled()) {
    return listLearningEventsH1(profileId);
  }
  const rows = await listPracticeEventsDurable(prisma, profileId);
  return rows.map(rowToLearningEvent);
}

export async function getPracticeProjection(profileId: string): Promise<{
  completedCards: string[];
  completedUnits: string[];
  completedSlotsByUnit: Record<string, FtcSlot[]>;
}> {
  if (!isH1DurableEnabled()) {
    return getPracticeProjectionH1(profileId);
  }
  let record = await getFtcProjectionDurable(prisma, profileId);
  if (!record) {
    record = await rebuildFtcProjectionDurable(prisma, profileId, {
      rebuildSource: "events",
    });
  }
  return {
    completedCards: record.completedCardIds,
    completedUnits: record.completedUnitIds,
    completedSlotsByUnit: record.slotsByUnit,
  };
}

export async function registerPracticeSession(
  metadata: PracticeSessionMetadataH1
): Promise<void> {
  // Siempre cache en memoria para el request actual; durable confía en practice_started.
  registerPracticeSessionH1(metadata);
}

export async function getPracticeSessionMetadata(
  sessionId: string
): Promise<PracticeSessionMetadataH1 | null> {
  const cached = getPracticeSessionMetadataH1(sessionId);
  if (cached) return cached;
  if (!isH1DurableEnabled()) return null;

  const started = await prisma.practiceEvent.findFirst({
    where: { sessionId, eventType: "practice_started" },
    orderBy: { occurredAt: "asc" },
  });
  if (!started || !started.tarjetaId || !started.unidadId || !started.slot) {
    return null;
  }
  const metadata: PracticeSessionMetadataH1 = {
    sessionId,
    accountId: started.userId,
    profileId: started.userId,
    nodeId: started.tarjetaId,
    tarjetaId: started.tarjetaId,
    unidadId: started.unidadId,
    monthIndex: started.monthIndex ?? 1,
    slot: started.slot as FtcSlot,
    clientRequestId: started.causationCommandId,
  };
  registerPracticeSessionH1(metadata);
  return metadata;
}

export async function assertFtcSequence(
  profileId: string,
  unidadId: string,
  slot: FtcSlot
): Promise<void> {
  if (!isH1DurableEnabled()) {
    assertFtcSequenceH1(profileId, unidadId, slot);
    return;
  }
  if (slot === 1) return;
  const projection = await getPracticeProjection(profileId);
  const slots = projection.completedSlotsByUnit[unidadId];
  if (!slots?.includes((slot - 1) as FtcSlot)) {
    throw new ApiError(
      409,
      "VALIDATION_ERROR",
      `A-SEQ: completa primero el slot ${slot - 1}.`
    );
  }
}
