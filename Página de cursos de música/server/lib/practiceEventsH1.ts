/**
 * P0-05 — EventoAprendizaje append-only H1.
 *
 * Store operativo en memoria: no durable entre reinicios (sin schema por mandato).
 * Idempotencia por eventId, causationCommandId y claves naturales card/unit.
 * No contiene score, accuracy, pitch, audio ni estrellas.
 */
import { randomUUID } from "node:crypto";
import { ApiError } from "./errors.js";
import type { FtcSlot } from "./rutaFtcDomainH1.js";

export type PracticeEventTypeH1 =
  | "practice_started"
  | "practice_completed"
  | "practice_abandoned"
  | "ftc_card_completed"
  | "unit_completed";

export type PracticeSessionMetadataH1 = {
  sessionId: string;
  accountId: string;
  profileId: string;
  nodeId: string;
  tarjetaId: string;
  unidadId: string;
  monthIndex: number;
  slot: FtcSlot;
  clientRequestId: string | null;
};

export type LearningEventH1 = {
  eventId: string;
  eventType: PracticeEventTypeH1;
  profileId: string;
  occurredAt: string;
  sessionId: string | null;
  tarjetaId: string | null;
  unidadId: string | null;
  monthIndex: number | null;
  slot: FtcSlot | null;
  payload: {
    effectiveMinutes?: number;
    binaryComplete?: boolean;
    source: "practice_flow";
  };
  causationCommandId: string | null;
};

export type PracticeProjectionH1 = {
  completedCards: Set<string>;
  completedUnits: Set<string>;
  completedSlotsByUnit: Map<string, Set<FtcSlot>>;
};

const eventsById = new Map<string, LearningEventH1>();
const eventIdByCommand = new Map<string, string>();
const eventIdByNaturalKey = new Map<string, string>();
const sessionMetadata = new Map<string, PracticeSessionMetadataH1>();
const projectionByProfile = new Map<string, PracticeProjectionH1>();

function projectionFor(profileId: string): PracticeProjectionH1 {
  const existing = projectionByProfile.get(profileId);
  if (existing) return existing;
  const created: PracticeProjectionH1 = {
    completedCards: new Set(),
    completedUnits: new Set(),
    completedSlotsByUnit: new Map(),
  };
  projectionByProfile.set(profileId, created);
  return created;
}

function naturalKey(input: {
  profileId: string;
  eventType: PracticeEventTypeH1;
  tarjetaId?: string | null;
  unidadId?: string | null;
  sessionId?: string | null;
}): string | null {
  if (input.eventType === "ftc_card_completed" && input.tarjetaId) {
    return `${input.profileId}:card:${input.tarjetaId}`;
  }
  if (input.eventType === "unit_completed" && input.unidadId) {
    return `${input.profileId}:unit:${input.unidadId}`;
  }
  if (
    (input.eventType === "practice_started" ||
      input.eventType === "practice_completed" ||
      input.eventType === "practice_abandoned") &&
    input.sessionId
  ) {
    return `${input.profileId}:session:${input.sessionId}:${input.eventType}`;
  }
  return null;
}

export function appendLearningEventH1(
  input: Omit<LearningEventH1, "eventId" | "occurredAt"> & {
    eventId?: string;
    /** Solo para tests/rebuild; producción usa now. */
    occurredAt?: string;
  }
): { event: LearningEventH1; inserted: boolean } {
  if (input.eventId) {
    const existing = eventsById.get(input.eventId);
    if (existing) return { event: existing, inserted: false };
  }

  if (input.causationCommandId) {
    const commandEventId = eventIdByCommand.get(
      `${input.profileId}:${input.eventType}:${input.causationCommandId}`
    );
    if (commandEventId) {
      return { event: eventsById.get(commandEventId)!, inserted: false };
    }
  }

  const key = naturalKey(input);
  if (key) {
    const naturalEventId = eventIdByNaturalKey.get(key);
    if (naturalEventId) {
      return { event: eventsById.get(naturalEventId)!, inserted: false };
    }
  }

  const event: LearningEventH1 = {
    eventType: input.eventType,
    profileId: input.profileId,
    sessionId: input.sessionId,
    tarjetaId: input.tarjetaId,
    unidadId: input.unidadId,
    monthIndex: input.monthIndex,
    slot: input.slot,
    payload: input.payload,
    causationCommandId: input.causationCommandId,
    eventId: input.eventId ?? randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
  };
  eventsById.set(event.eventId, event);
  if (event.causationCommandId) {
    eventIdByCommand.set(
      `${event.profileId}:${event.eventType}:${event.causationCommandId}`,
      event.eventId
    );
  }
  if (key) eventIdByNaturalKey.set(key, event.eventId);

  const projection = projectionFor(event.profileId);
  if (event.eventType === "ftc_card_completed" && event.tarjetaId && event.unidadId && event.slot) {
    projection.completedCards.add(event.tarjetaId);
    const slots = projection.completedSlotsByUnit.get(event.unidadId) ?? new Set<FtcSlot>();
    slots.add(event.slot);
    projection.completedSlotsByUnit.set(event.unidadId, slots);
  }
  if (event.eventType === "unit_completed" && event.unidadId) {
    projection.completedUnits.add(event.unidadId);
  }

  return { event, inserted: true };
}

export function registerPracticeSessionH1(metadata: PracticeSessionMetadataH1): void {
  if (metadata.accountId !== metadata.profileId) {
    throw new ApiError(403, "FORBIDDEN", "H1: profileId debe coincidir con accountId.");
  }
  const existing = sessionMetadata.get(metadata.sessionId);
  if (existing && existing.profileId !== metadata.profileId) {
    throw new ApiError(403, "FORBIDDEN", "Sesión asociada a otro perfil.");
  }
  sessionMetadata.set(metadata.sessionId, existing ?? metadata);
}

export function getPracticeSessionMetadataH1(
  sessionId: string
): PracticeSessionMetadataH1 | null {
  return sessionMetadata.get(sessionId) ?? null;
}

export function assertFtcSequenceH1(
  profileId: string,
  unidadId: string,
  slot: FtcSlot
): void {
  if (slot === 1) return;
  const slots = projectionFor(profileId).completedSlotsByUnit.get(unidadId);
  if (!slots?.has((slot - 1) as FtcSlot)) {
    throw new ApiError(
      409,
      "VALIDATION_ERROR",
      `A-SEQ: completa primero el slot ${slot - 1}.`
    );
  }
}

export function getPracticeProjectionH1(profileId: string): {
  completedCards: string[];
  completedUnits: string[];
  completedSlotsByUnit: Record<string, FtcSlot[]>;
} {
  const projection = projectionFor(profileId);
  return {
    completedCards: [...projection.completedCards],
    completedUnits: [...projection.completedUnits],
    completedSlotsByUnit: Object.fromEntries(
      [...projection.completedSlotsByUnit.entries()].map(([unitId, slots]) => [
        unitId,
        [...slots].sort(),
      ])
    ),
  };
}

export function listLearningEventsH1(profileId: string): LearningEventH1[] {
  return [...eventsById.values()].filter((event) => event.profileId === profileId);
}

export function clearPracticeEventsH1(): void {
  eventsById.clear();
  eventIdByCommand.clear();
  eventIdByNaturalKey.clear();
  sessionMetadata.clear();
  projectionByProfile.clear();
}
