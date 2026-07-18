import { SessionStatus, type User } from "@prisma/client";
import { config } from "../config.js";
import {
  PUBLIC_EXERCISE_SELECT,
  toPublicExercise,
} from "../lib/exercisePublic.js";
import { ApiError } from "../lib/errors.js";
import { acquireLessonSessionAdvisoryLock } from "../lib/advisoryLock.js";
import type { PathNodeStatus } from "../lib/nodeStatus.js";
import { prisma } from "../lib/prisma.js";
import { isSessionExpired, sessionExpiresAt } from "../lib/sessionTtl.js";
import { parseLessonSessionBody } from "../lib/validation.js";
import {
  assertMonthPlayableForPractice,
  resolveEntitlementsH1,
} from "../lib/entitlementsH1.js";
import { assertProfileAccess } from "../lib/learnerContextH1.js";
import { getProfileProjection } from "../lib/learnerProjectionBridge.js";
import { captureLessonContentSnapshot } from "../lib/lessonContentSnapshot.js";
import {
  appendLearningEvent,
  assertFtcSequence,
  registerPracticeSession,
} from "../lib/practiceEventsBridge.js";
import type { LearningEventH1 } from "../lib/practiceEventsH1.js";
import { loadPublishedCoursePath } from "./coursePath.js";

export interface LessonSessionResponse {
  sessionId: string;
  nodeId: string;
  status: "STARTED";
  startedAt: string;
  expiresAt: string;
  exercises: ReturnType<typeof toPublicExercise>[];
  practiceEvent?: LearningEventH1;
}

export async function createOrReuseLessonSession(
  student: User,
  body: unknown
): Promise<{ payload: LessonSessionResponse; created: boolean }> {
  const input = parseLessonSessionBody(body);
  const { nodeId, monthIndex: bodyMonth } = input;
  const h1EventFlow = Boolean(
    input.profileId ||
      input.tarjetaId ||
      input.unidadId ||
      input.slot ||
      input.clientRequestId ||
      input.eventId ||
      input.retry
  );
  if (input.profileId) {
    assertProfileAccess(student.id, input.profileId);
  }

  const { modules, statusByNodeId } = await loadPublishedCoursePath(
    config.defaultCourseSlug,
    student.id
  );

  const nodeContext = resolvePublishedNodeContext(nodeId, modules, statusByNodeId);

  if (
    !nodeContext ||
    nodeContext.status === "locked" ||
    (nodeContext.status === "completed" && !input.retry)
  ) {
    throw new ApiError(
      400,
      "INVALID_NODE",
      "El nodo no está disponible para iniciar una sesión de práctica."
    );
  }

  // P0-07 E3: monthIndex explícito, o currentMonth onboarding, o default M1.
  // No usar Module.order como mes (Track A Module ≈ UnidadFTC, no MesRuta).
  const projection = await getProfileProjection(student.id);
  const monthIndex =
    bodyMonth ?? projection?.result?.currentMonth ?? 1;
  const slot = input.slot ?? nodeContext.nodeOrder;
  if (slot < 1 || slot > 5) {
    throw new ApiError(400, "VALIDATION_ERROR", "La TarjetaFTC debe tener slot 1..5.");
  }
  const tarjetaId = input.tarjetaId ?? nodeId;
  const unidadId = input.unidadId ?? nodeContext.moduleId;
  if (h1EventFlow) {
    await assertFtcSequence(student.id, unidadId, slot as 1 | 2 | 3 | 4 | 5);
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: student.id },
    select: { id: true, status: true, planId: true, endsAt: true },
  });
  const entitlements = resolveEntitlementsH1({
    user: student,
    subscriptions,
  });
  assertMonthPlayableForPractice(entitlements, monthIndex);

  const { session, created } = await prisma.$transaction(async (tx) => {
    await acquireLessonSessionAdvisoryLock(tx, student.id, nodeId);

    const startedSessions = await tx.lessonSession.findMany({
      where: {
        userId: student.id,
        nodeId,
        status: SessionStatus.STARTED,
      },
      orderBy: { startedAt: "desc" },
    });

    const now = new Date();
    let reusableSession: (typeof startedSessions)[number] | null = null;

    for (const existing of startedSessions) {
      if (isSessionExpired(existing.startedAt, now)) {
        await tx.lessonSession.update({
          where: { id: existing.id },
          data: { status: SessionStatus.ABANDONED },
        });
      } else if (!reusableSession) {
        reusableSession = existing;
      }
    }

    if (reusableSession) {
      return { session: reusableSession, created: false };
    }

    // R-001 / PD-3: snapshot de contenido al iniciar (secureAnswer solo en DB).
    const { snapshot, contentVersion } = await captureLessonContentSnapshot(
      tx,
      nodeId,
      { now }
    );

    const createdSession = await tx.lessonSession.create({
      data: {
        userId: student.id,
        nodeId,
        status: SessionStatus.STARTED,
        contentSnapshot: snapshot,
        contentVersion,
      },
    });

    return { session: createdSession, created: true };
  });

  const exercises = await prisma.microExercise.findMany({
    where: { nodeId },
    select: PUBLIC_EXERCISE_SELECT,
    orderBy: { order: "asc" },
  });

  let practiceEvent: LearningEventH1 | undefined;
  if (h1EventFlow) {
    await registerPracticeSession({
      sessionId: session.id,
      accountId: student.id,
      profileId: student.id,
      nodeId,
      tarjetaId,
      unidadId,
      monthIndex,
      slot: slot as 1 | 2 | 3 | 4 | 5,
      clientRequestId: input.clientRequestId ?? null,
    });
    practiceEvent = (
      await appendLearningEvent({
        eventId: input.eventId,
        eventType: "practice_started",
        profileId: student.id,
        sessionId: session.id,
        tarjetaId,
        unidadId,
        monthIndex,
        slot: slot as 1 | 2 | 3 | 4 | 5,
        payload: { source: "practice_flow" },
        causationCommandId: input.clientRequestId ?? null,
      })
    ).event;
  }

  const payload: LessonSessionResponse = {
    sessionId: session.id,
    nodeId: session.nodeId,
    status: "STARTED",
    startedAt: session.startedAt.toISOString(),
    expiresAt: sessionExpiresAt(session.startedAt).toISOString(),
    exercises: exercises.map(toPublicExercise),
    ...(practiceEvent ? { practiceEvent } : {}),
  };

  return { payload, created };
}

function resolvePublishedNodeContext(
  nodeId: string,
  modules: Array<{
    id: string;
    nodes: Array<{ id: string; order: number }>;
  }>,
  statusByNodeId: Map<string, PathNodeStatus>
): {
  status: PathNodeStatus;
  moduleId: string;
  nodeOrder: number;
} | null {
  for (const module of modules) {
    for (const node of module.nodes) {
      if (node.id === nodeId) {
        const status = statusByNodeId.get(node.id);
        if (!status) return null;
        return {
          status,
          moduleId: module.id,
          nodeOrder: node.order,
        };
      }
    }
  }
  return null;
}
