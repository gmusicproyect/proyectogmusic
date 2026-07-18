/**
 * P0-05 lifecycle binario H1 sobre LessonSession.
 * Separado del complete legacy con scoring: este flujo no calcula accuracy/XP.
 * PD-3: eventos vía practiceEventsBridge (memoria o DB según flag).
 */
import { SessionStatus, type User } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import {
  assertMonthPlayableForPractice,
  resolveEntitlementsH1,
} from "../lib/entitlementsH1.js";
import { assertProfileAccess } from "../lib/learnerContextH1.js";
import { prisma } from "../lib/prisma.js";
import {
  appendLearningEvent,
  assertFtcSequence,
  getPracticeProjection,
  getPracticeSessionMetadata,
  listLearningEvents,
} from "../lib/practiceEventsBridge.js";
import type { LearningEventH1 } from "../lib/practiceEventsH1.js";
import { parseSessionIdParam } from "../lib/validation.js";

type CommandBodyH1 = {
  profileId?: string;
  eventId?: string;
  clientRequestId?: string;
  binaryComplete?: boolean;
  effectiveMinutes?: number;
  checklist?: string[];
  selfDeclared?: boolean;
};

function parseCommandBodyH1(body: unknown): CommandBodyH1 {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Body de práctica H1 inválido.");
  }
  const raw = body as Record<string, unknown>;
  const stringValue = (key: string): string | undefined => {
    const value = raw[key];
    if (value === undefined || value === null) return undefined;
    if (typeof value !== "string" || !value.trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", `${key} inválido.`);
    }
    return value.trim();
  };

  let effectiveMinutes: number | undefined;
  if (raw.effectiveMinutes !== undefined) {
    if (
      typeof raw.effectiveMinutes !== "number" ||
      !Number.isInteger(raw.effectiveMinutes) ||
      raw.effectiveMinutes < 0 ||
      raw.effectiveMinutes > 720
    ) {
      throw new ApiError(
        400,
        "VALIDATION_ERROR",
        "effectiveMinutes debe ser entero entre 0 y 720."
      );
    }
    effectiveMinutes = raw.effectiveMinutes;
  }

  let checklist: string[] | undefined;
  if (raw.checklist !== undefined) {
    if (
      !Array.isArray(raw.checklist) ||
      !raw.checklist.every((item) => typeof item === "string" && item.trim())
    ) {
      throw new ApiError(400, "VALIDATION_ERROR", "checklist inválido.");
    }
    checklist = raw.checklist.map((item) => (item as string).trim());
  }

  return {
    profileId: stringValue("profileId"),
    eventId: stringValue("eventId"),
    clientRequestId: stringValue("clientRequestId"),
    binaryComplete:
      raw.binaryComplete === undefined ? undefined : raw.binaryComplete === true,
    effectiveMinutes,
    checklist,
    selfDeclared:
      raw.selfDeclared === undefined ? undefined : raw.selfDeclared === true,
  };
}

async function loadOwnedSession(student: User, sessionId: string) {
  const session = await prisma.lessonSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      nodeId: true,
      status: true,
      startedAt: true,
      completedAt: true,
    },
  });
  if (!session) {
    throw new ApiError(404, "SESSION_NOT_FOUND", "Sesión no encontrada.");
  }
  if (session.userId !== student.id) {
    throw new ApiError(403, "FORBIDDEN", "Sesión asociada a otro perfil.");
  }
  return session;
}

async function assertCurrentEntitlement(student: User, monthIndex: number): Promise<void> {
  const subscriptions = await prisma.subscription.findMany({
    where: { userId: student.id },
    select: { id: true, status: true, planId: true, endsAt: true },
  });
  assertMonthPlayableForPractice(
    resolveEntitlementsH1({ user: student, subscriptions }),
    monthIndex
  );
}

export type CompletePracticeH1Response = {
  sessionId: string;
  status: "COMPLETED";
  alreadyProcessed: boolean;
  binaryComplete: true;
  cardCompleted: boolean;
  unitCompleted: boolean;
  events: LearningEventH1[];
  projection: Awaited<ReturnType<typeof getPracticeProjection>>;
};

export async function completePracticeH1(
  student: User,
  sessionIdParam: string,
  body: unknown
): Promise<CompletePracticeH1Response> {
  const sessionId = parseSessionIdParam(sessionIdParam);
  const command = parseCommandBodyH1(body);
  if (command.profileId) assertProfileAccess(student.id, command.profileId);
  if (command.binaryComplete !== true) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "P0-05 exige binaryComplete=true; no scoring automático."
    );
  }

  const metadata = await getPracticeSessionMetadata(sessionId);
  if (!metadata) {
    throw new ApiError(
      409,
      "VALIDATION_ERROR",
      "La sesión no fue iniciada con metadata FTC H1."
    );
  }
  assertProfileAccess(student.id, metadata.profileId);
  await assertCurrentEntitlement(student, metadata.monthIndex);
  await assertFtcSequence(student.id, metadata.unidadId, metadata.slot);

  const session = await loadOwnedSession(student, sessionId);
  const priorEvents = await listLearningEvents(student.id);
  const priorPracticeComplete = priorEvents.find(
    (event) =>
      event.sessionId === sessionId && event.eventType === "practice_completed"
  );

  if (session.status !== SessionStatus.COMPLETED) {
    if (session.status !== SessionStatus.STARTED) {
      throw new ApiError(
        422,
        "SESSION_NOT_STARTABLE",
        "La sesión no está en estado STARTED."
      );
    }
    const completedAt = new Date();
    await prisma.$transaction(async (tx) => {
      await tx.lessonSession.updateMany({
        where: { id: sessionId, status: SessionStatus.STARTED },
        data: {
          status: SessionStatus.COMPLETED,
          completedAt,
          accuracy: null,
          xpEarned: 0,
          streakUpdated: false,
        },
      });
      await tx.userProgress.upsert({
        where: {
          userId_nodeId: {
            userId: student.id,
            nodeId: session.nodeId,
          },
        },
        update: {
          isCompleted: true,
          completedAt,
        },
        create: {
          userId: student.id,
          nodeId: session.nodeId,
          isCompleted: true,
          completedAt,
        },
      });
    });
  }

  const practiceCompleted = await appendLearningEvent({
    eventId: command.eventId,
    eventType: "practice_completed",
    profileId: student.id,
    sessionId,
    tarjetaId: metadata.tarjetaId,
    unidadId: metadata.unidadId,
    monthIndex: metadata.monthIndex,
    slot: metadata.slot,
    payload: {
      source: "practice_flow",
      binaryComplete: true,
      ...(command.effectiveMinutes === undefined
        ? {}
        : { effectiveMinutes: command.effectiveMinutes }),
    },
    causationCommandId: command.clientRequestId ?? null,
  });

  const cardCompleted = await appendLearningEvent({
    eventType: "ftc_card_completed",
    profileId: student.id,
    sessionId,
    tarjetaId: metadata.tarjetaId,
    unidadId: metadata.unidadId,
    monthIndex: metadata.monthIndex,
    slot: metadata.slot,
    payload: { source: "practice_flow", binaryComplete: true },
    causationCommandId: command.clientRequestId
      ? `${command.clientRequestId}:card`
      : null,
  });

  const projectionAfterCard = await getPracticeProjection(student.id);
  const unitSlots = projectionAfterCard.completedSlotsByUnit[metadata.unidadId] ?? [];
  let unitCompletedInserted = false;
  if ([1, 2, 3, 4, 5].every((slot) => unitSlots.includes(slot as 1 | 2 | 3 | 4 | 5))) {
    const unit = await appendLearningEvent({
      eventType: "unit_completed",
      profileId: student.id,
      sessionId,
      tarjetaId: metadata.tarjetaId,
      unidadId: metadata.unidadId,
      monthIndex: metadata.monthIndex,
      slot: metadata.slot,
      payload: { source: "practice_flow", binaryComplete: true },
      causationCommandId: command.clientRequestId
        ? `${command.clientRequestId}:unit`
        : null,
    });
    unitCompletedInserted = unit.inserted;
  }

  const allEvents = await listLearningEvents(student.id);
  return {
    sessionId,
    status: "COMPLETED",
    alreadyProcessed:
      Boolean(priorPracticeComplete) || !practiceCompleted.inserted,
    binaryComplete: true,
    cardCompleted: cardCompleted.inserted,
    unitCompleted: unitCompletedInserted,
    events: allEvents.filter((event) => event.sessionId === sessionId),
    projection: await getPracticeProjection(student.id),
  };
}

export async function abandonPracticeH1(
  student: User,
  sessionIdParam: string,
  body: unknown
): Promise<{
  sessionId: string;
  status: "ABANDONED";
  alreadyProcessed: boolean;
  event: LearningEventH1;
}> {
  const sessionId = parseSessionIdParam(sessionIdParam);
  const command = parseCommandBodyH1(body);
  if (command.profileId) assertProfileAccess(student.id, command.profileId);
  const metadata = await getPracticeSessionMetadata(sessionId);
  if (!metadata) {
    throw new ApiError(409, "VALIDATION_ERROR", "Sesión sin metadata FTC H1.");
  }
  const session = await loadOwnedSession(student, sessionId);
  if (session.status === SessionStatus.COMPLETED) {
    throw new ApiError(422, "SESSION_NOT_STARTABLE", "Una sesión completada no se abandona.");
  }
  if (session.status === SessionStatus.STARTED) {
    await prisma.lessonSession.updateMany({
      where: { id: sessionId, status: SessionStatus.STARTED },
      data: { status: SessionStatus.ABANDONED },
    });
  }
  const appended = await appendLearningEvent({
    eventId: command.eventId,
    eventType: "practice_abandoned",
    profileId: student.id,
    sessionId,
    tarjetaId: metadata.tarjetaId,
    unidadId: metadata.unidadId,
    monthIndex: metadata.monthIndex,
    slot: metadata.slot,
    payload: { source: "practice_flow" },
    causationCommandId: command.clientRequestId ?? null,
  });
  return {
    sessionId,
    status: "ABANDONED",
    alreadyProcessed: !appended.inserted,
    event: appended.event,
  };
}

export async function progressPracticeH1(
  student: User,
  sessionIdParam: string,
  body: unknown
): Promise<{
  sessionId: string;
  status: "STARTED";
  checklist: string[];
  selfDeclared: boolean;
}> {
  const sessionId = parseSessionIdParam(sessionIdParam);
  const command = parseCommandBodyH1(body);
  if (command.profileId) assertProfileAccess(student.id, command.profileId);
  const session = await loadOwnedSession(student, sessionId);
  if (session.status !== SessionStatus.STARTED) {
    throw new ApiError(422, "SESSION_NOT_STARTABLE", "Sesión no STARTED.");
  }
  return {
    sessionId,
    status: "STARTED",
    checklist: command.checklist ?? [],
    selfDeclared: command.selfDeclared ?? false,
  };
}
