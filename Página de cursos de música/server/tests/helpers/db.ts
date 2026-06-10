import { Role, SessionStatus, SubscriptionStatus } from "@prisma/client";
import assert from "node:assert/strict";
import { config } from "../../config.js";
import { prisma } from "../../lib/prisma.js";
import { loadPublishedCoursePath } from "../../services/coursePath.js";
import type { PathNodeStatus } from "../../lib/nodeStatus.js";
import { SESSION_TTL_MS } from "../../lib/sessionTtl.js";
import { formatDateInTimezone, getYesterdayDateInTimezone } from "../../lib/timezone.js";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

export interface UserProgressRowSnapshot {
  id: string;
  userId: string;
  nodeId: string;
  isCompleted: boolean;
  unlockedAt: Date;
  completedAt: Date | null;
}

export interface UserProgressSnapshot {
  existed: boolean;
  row: UserProgressRowSnapshot | null;
}

export async function getDevStudent() {
  return prisma.user.findUniqueOrThrow({
    where: { email: config.devStudentEmail },
  });
}

export async function getNodeIdsByStatus(studentId: string) {
  const { modules, statusByNodeId } = await loadPublishedCoursePath(
    config.defaultCourseSlug,
    studentId
  );

  const byStatus: Partial<Record<PathNodeStatus, string>> = {};

  for (const module of modules) {
    for (const node of module.nodes) {
      const status = statusByNodeId.get(node.id);
      if (status && !byStatus[status]) {
        byStatus[status] = node.id;
      }
    }
  }

  return byStatus;
}

export async function deleteStudentSessionsForNode(userId: string, nodeId: string) {
  await prisma.lessonSession.deleteMany({
    where: { userId, nodeId },
  });
}

export async function getSessionStatus(sessionId: string) {
  const session = await prisma.lessonSession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { status: true, startedAt: true },
  });
  return session;
}

export async function setSessionStartedAt(sessionId: string, startedAt: Date) {
  await prisma.lessonSession.update({
    where: { id: sessionId },
    data: { startedAt },
  });
}

export async function captureUserProgressSnapshot(
  userId: string,
  nodeId: string
): Promise<UserProgressSnapshot> {
  const row = await prisma.userProgress.findUnique({
    where: { userId_nodeId: { userId, nodeId } },
  });

  if (!row) {
    return { existed: false, row: null };
  }

  return {
    existed: true,
    row: {
      id: row.id,
      userId: row.userId,
      nodeId: row.nodeId,
      isCompleted: row.isCompleted,
      unlockedAt: row.unlockedAt,
      completedAt: row.completedAt,
    },
  };
}

export async function restoreUserProgressSnapshot(
  userId: string,
  nodeId: string,
  snapshot: UserProgressSnapshot
): Promise<void> {
  if (!snapshot.existed) {
    await prisma.userProgress.deleteMany({
      where: { userId, nodeId },
    });
    return;
  }

  const row = snapshot.row!;

  await prisma.userProgress.upsert({
    where: { userId_nodeId: { userId, nodeId } },
    update: {
      isCompleted: row.isCompleted,
      unlockedAt: row.unlockedAt,
      completedAt: row.completedAt,
    },
    create: {
      id: row.id,
      userId: row.userId,
      nodeId: row.nodeId,
      isCompleted: row.isCompleted,
      unlockedAt: row.unlockedAt,
      completedAt: row.completedAt,
    },
  });
}

export function assertUserProgressSnapshotsEqual(
  current: UserProgressSnapshot,
  expected: UserProgressSnapshot
): void {
  assert.equal(current.existed, expected.existed);

  if (!expected.existed) {
    assert.equal(current.row, null);
    return;
  }

  assert.ok(current.row);
  assert.ok(expected.row);
  assert.equal(current.row.isCompleted, expected.row.isCompleted);
  assert.equal(
    current.row.completedAt?.toISOString() ?? null,
    expected.row.completedAt?.toISOString() ?? null
  );
  assert.equal(current.row.unlockedAt.toISOString(), expected.row.unlockedAt.toISOString());
}

export async function markNodeCompleted(userId: string, nodeId: string) {
  await prisma.userProgress.upsert({
    where: { userId_nodeId: { userId, nodeId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: {
      userId,
      nodeId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });
}

export async function countStartedSessions(userId: string, nodeId: string) {
  return prisma.lessonSession.count({
    where: {
      userId,
      nodeId,
      status: SessionStatus.STARTED,
    },
  });
}

export interface LessonSessionSnapshot {
  id: string;
  userId: string;
  nodeId: string;
  status: SessionStatus;
  accuracy: number | null;
  xpEarned: number;
  streakUpdated: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

export interface ExerciseAttemptSnapshot {
  id: string;
  sessionId: string;
  microExerciseId: string;
  isCorrect: boolean;
  selectedAnswer: string;
  responseTimeMs: number;
  createdAt: Date;
}

export interface StreakEventSnapshot {
  id: string;
  userId: string;
  currentStreak: number;
  eventDate: string;
  createdAt: Date;
}

export interface XpEventSnapshot {
  id: string;
  userId: string;
  sessionId: string | null;
  amount: number;
  reason: string;
  createdAt: Date;
}

export interface CompleteTestDbSnapshot {
  userProgress: UserProgressSnapshot;
  lessonSessions: LessonSessionSnapshot[];
  exerciseAttempts: ExerciseAttemptSnapshot[];
  streakEvents: StreakEventSnapshot[];
  xpEvents: XpEventSnapshot[];
}

export async function getNodeExercises(nodeId: string) {
  return prisma.microExercise.findMany({
    where: { nodeId },
    select: {
      id: true,
      secureAnswer: true,
      order: true,
    },
    orderBy: { order: "asc" },
  });
}

export async function getOtherStudentUserId(ownerStudentId: string) {
  const other = await prisma.user.findFirst({
    where: {
      role: Role.STUDENT,
      id: { not: ownerStudentId },
    },
    select: { id: true },
  });

  if (other) {
    return other.id;
  }

  const guardian = await prisma.user.findFirst({
    where: { role: Role.GUARDIAN },
    select: { id: true },
  });

  return guardian?.id ?? null;
}

export async function createStartedSession(userId: string, nodeId: string) {
  return prisma.lessonSession.create({
    data: {
      userId,
      nodeId,
      status: SessionStatus.STARTED,
    },
  });
}

export async function captureCompleteTestDbSnapshot(
  userId: string,
  nodeId: string
): Promise<CompleteTestDbSnapshot> {
  const lessonSessions = await prisma.lessonSession.findMany({
    where: { userId, nodeId },
    orderBy: { startedAt: "asc" },
  });

  const sessionIds = lessonSessions.map((session) => session.id);

  const [userProgress, exerciseAttempts, streakEvents, xpEvents] = await Promise.all([
    captureUserProgressSnapshot(userId, nodeId),
    sessionIds.length > 0
      ? prisma.exerciseAttempt.findMany({
          where: { sessionId: { in: sessionIds } },
          orderBy: [{ sessionId: "asc" }, { createdAt: "asc" }],
        })
      : Promise.resolve([]),
    prisma.streakEvent.findMany({
      where: { userId },
      orderBy: { eventDate: "asc" },
    }),
    prisma.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return {
    userProgress,
    lessonSessions: lessonSessions.map((session) => ({
      id: session.id,
      userId: session.userId,
      nodeId: session.nodeId,
      status: session.status,
      accuracy: session.accuracy,
      xpEarned: session.xpEarned,
      streakUpdated: session.streakUpdated,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
    })),
    exerciseAttempts: exerciseAttempts.map((attempt) => ({
      id: attempt.id,
      sessionId: attempt.sessionId,
      microExerciseId: attempt.microExerciseId,
      isCorrect: attempt.isCorrect,
      selectedAnswer: attempt.selectedAnswer,
      responseTimeMs: attempt.responseTimeMs,
      createdAt: attempt.createdAt,
    })),
    streakEvents: streakEvents.map((event) => ({
      id: event.id,
      userId: event.userId,
      currentStreak: event.currentStreak,
      eventDate: event.eventDate,
      createdAt: event.createdAt,
    })),
    xpEvents: xpEvents.map((event) => ({
      id: event.id,
      userId: event.userId,
      sessionId: event.sessionId,
      amount: event.amount,
      reason: event.reason,
      createdAt: event.createdAt,
    })),
  };
}

export async function restoreCompleteTestDbSnapshot(
  userId: string,
  nodeId: string,
  snapshot: CompleteTestDbSnapshot
): Promise<void> {
  const existingSessions = await prisma.lessonSession.findMany({
    where: { userId, nodeId },
    select: { id: true },
  });
  const existingSessionIds = existingSessions.map((session) => session.id);

  if (existingSessionIds.length > 0) {
    await prisma.exerciseAttempt.deleteMany({
      where: { sessionId: { in: existingSessionIds } },
    });
  }

  await prisma.xpEvent.deleteMany({ where: { userId } });
  await prisma.lessonSession.deleteMany({ where: { userId, nodeId } });

  await restoreUserProgressSnapshot(userId, nodeId, snapshot.userProgress);

  if (snapshot.lessonSessions.length > 0) {
    await prisma.lessonSession.createMany({
      data: snapshot.lessonSessions.map((session) => ({
        id: session.id,
        userId: session.userId,
        nodeId: session.nodeId,
        status: session.status,
        accuracy: session.accuracy,
        xpEarned: session.xpEarned,
        streakUpdated: session.streakUpdated,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
      })),
    });
  }

  if (snapshot.exerciseAttempts.length > 0) {
    await prisma.exerciseAttempt.createMany({
      data: snapshot.exerciseAttempts.map((attempt) => ({
        id: attempt.id,
        sessionId: attempt.sessionId,
        microExerciseId: attempt.microExerciseId,
        isCorrect: attempt.isCorrect,
        selectedAnswer: attempt.selectedAnswer,
        responseTimeMs: attempt.responseTimeMs,
        createdAt: attempt.createdAt,
      })),
    });
  }

  await prisma.streakEvent.deleteMany({ where: { userId } });
  if (snapshot.streakEvents.length > 0) {
    await prisma.streakEvent.createMany({
      data: snapshot.streakEvents.map((event) => ({
        id: event.id,
        userId: event.userId,
        currentStreak: event.currentStreak,
        eventDate: event.eventDate,
        createdAt: event.createdAt,
      })),
    });
  }

  if (snapshot.xpEvents.length > 0) {
    await prisma.xpEvent.createMany({
      data: snapshot.xpEvents.map((event) => ({
        id: event.id,
        userId: event.userId,
        sessionId: event.sessionId,
        amount: event.amount,
        reason: event.reason,
        createdAt: event.createdAt,
      })),
    });
  }
}

export function assertCompleteTestDbSnapshotsEqual(
  current: CompleteTestDbSnapshot,
  expected: CompleteTestDbSnapshot
): void {
  assertUserProgressSnapshotsEqual(current.userProgress, expected.userProgress);
  assert.equal(current.lessonSessions.length, expected.lessonSessions.length);
  assert.equal(current.exerciseAttempts.length, expected.exerciseAttempts.length);
  assert.equal(current.streakEvents.length, expected.streakEvents.length);
  assert.equal(current.xpEvents.length, expected.xpEvents.length);

  for (let index = 0; index < expected.lessonSessions.length; index++) {
    const currentSession = current.lessonSessions[index];
    const expectedSession = expected.lessonSessions[index];
    assert.equal(currentSession?.id, expectedSession?.id);
    assert.equal(currentSession?.status, expectedSession?.status);
    assert.equal(currentSession?.accuracy, expectedSession?.accuracy);
    assert.equal(currentSession?.xpEarned, expectedSession?.xpEarned);
    assert.equal(currentSession?.streakUpdated, expectedSession?.streakUpdated);
    assert.equal(currentSession?.startedAt.toISOString(), expectedSession?.startedAt.toISOString());
    assert.equal(
      currentSession?.completedAt?.toISOString() ?? null,
      expectedSession?.completedAt?.toISOString() ?? null
    );
  }

  for (let index = 0; index < expected.exerciseAttempts.length; index++) {
    const currentAttempt = current.exerciseAttempts[index];
    const expectedAttempt = expected.exerciseAttempts[index];
    assert.equal(currentAttempt?.id, expectedAttempt?.id);
    assert.equal(currentAttempt?.sessionId, expectedAttempt?.sessionId);
    assert.equal(currentAttempt?.microExerciseId, expectedAttempt?.microExerciseId);
    assert.equal(currentAttempt?.isCorrect, expectedAttempt?.isCorrect);
    assert.equal(currentAttempt?.selectedAnswer, expectedAttempt?.selectedAnswer);
    assert.equal(currentAttempt?.responseTimeMs, expectedAttempt?.responseTimeMs);
    assert.equal(currentAttempt?.createdAt.toISOString(), expectedAttempt?.createdAt.toISOString());
  }

  for (let index = 0; index < expected.streakEvents.length; index++) {
    assert.equal(
      current.streakEvents[index]?.eventDate,
      expected.streakEvents[index]?.eventDate
    );
    assert.equal(
      current.streakEvents[index]?.currentStreak,
      expected.streakEvents[index]?.currentStreak
    );
  }

  for (let index = 0; index < expected.xpEvents.length; index++) {
    assert.equal(current.xpEvents[index]?.amount, expected.xpEvents[index]?.amount);
    assert.equal(current.xpEvents[index]?.reason, expected.xpEvents[index]?.reason);
    assert.equal(
      current.xpEvents[index]?.sessionId ?? null,
      expected.xpEvents[index]?.sessionId ?? null
    );
  }
}

export async function deleteStreakEventForDate(userId: string, eventDate: string) {
  await prisma.streakEvent.deleteMany({
    where: { userId, eventDate },
  });
}

export async function seedYesterdayStreak(
  userId: string,
  timezone: string,
  currentStreak: number
) {
  const yesterday = getYesterdayDateInTimezone(timezone);
  await prisma.streakEvent.upsert({
    where: {
      userId_eventDate: {
        userId,
        eventDate: yesterday,
      },
    },
    update: { currentStreak },
    create: {
      userId,
      eventDate: yesterday,
      currentStreak,
    },
  });
}

export async function countXpEventsForSession(sessionId: string) {
  return prisma.xpEvent.count({
    where: { sessionId, reason: "SESSION_COMPLETED" },
  });
}

export async function countAttemptsForSession(sessionId: string) {
  return prisma.exerciseAttempt.count({
    where: { sessionId },
  });
}

export interface SubscriptionRowSnapshot {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  planId: string;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function captureUserSubscriptionsSnapshot(
  userId: string
): Promise<SubscriptionRowSnapshot[]> {
  const rows = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    status: row.status,
    planId: row.planId,
    endsAt: row.endsAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

export async function restoreUserSubscriptionsSnapshot(
  userId: string,
  snapshot: SubscriptionRowSnapshot[]
): Promise<void> {
  await prisma.subscription.deleteMany({ where: { userId } });

  if (snapshot.length === 0) {
    return;
  }

  await prisma.subscription.createMany({
    data: snapshot.map((row) => ({
      id: row.id,
      userId: row.userId,
      status: row.status,
      planId: row.planId,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })),
  });
}

export function assertUserSubscriptionsSnapshotsEqual(
  current: SubscriptionRowSnapshot[],
  expected: SubscriptionRowSnapshot[]
): void {
  assert.equal(current.length, expected.length);

  for (let index = 0; index < expected.length; index++) {
    const currentRow = current[index];
    const expectedRow = expected[index];
    assert.equal(currentRow?.id, expectedRow?.id);
    assert.equal(currentRow?.userId, expectedRow?.userId);
    assert.equal(currentRow?.status, expectedRow?.status);
    assert.equal(currentRow?.planId, expectedRow?.planId);
    assert.equal(
      currentRow?.endsAt?.toISOString() ?? null,
      expectedRow?.endsAt?.toISOString() ?? null
    );
    assert.equal(currentRow?.createdAt.toISOString(), expectedRow?.createdAt.toISOString());
    assert.equal(currentRow?.updatedAt.toISOString(), expectedRow?.updatedAt.toISOString());
  }
}

export interface UserLearningActivityCounts {
  userProgress: number;
  lessonSessions: number;
  exerciseAttempts: number;
  xpEvents: number;
  streakEvents: number;
}

export async function countUserLearningActivity(
  userId: string
): Promise<UserLearningActivityCounts> {
  const [userProgress, lessonSessions, exerciseAttempts, xpEvents, streakEvents] =
    await Promise.all([
      prisma.userProgress.count({ where: { userId } }),
      prisma.lessonSession.count({ where: { userId } }),
      prisma.exerciseAttempt.count({
        where: { session: { userId } },
      }),
      prisma.xpEvent.count({ where: { userId } }),
      prisma.streakEvent.count({ where: { userId } }),
    ]);

  return {
    userProgress,
    lessonSessions,
    exerciseAttempts,
    xpEvents,
    streakEvents,
  };
}

export interface UserEmailTestSnapshot {
  existed: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  subscriptions: SubscriptionRowSnapshot[];
}

export async function captureUserEmailTestSnapshot(
  email: string
): Promise<UserEmailTestSnapshot> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return { existed: false, user: null, subscriptions: [] };
  }

  const subscriptions = await captureUserSubscriptionsSnapshot(user.id);

  return {
    existed: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timezone: user.timezone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    subscriptions,
  };
}

export async function restoreUserEmailTestSnapshot(
  email: string,
  snapshot: UserEmailTestSnapshot
): Promise<void> {
  const current = await prisma.user.findUnique({ where: { email } });

  if (current) {
    await prisma.subscription.deleteMany({ where: { userId: current.id } });
    await prisma.user.delete({ where: { id: current.id } });
  }

  if (!snapshot.existed || !snapshot.user) {
    return;
  }

  await prisma.user.create({
    data: {
      id: snapshot.user.id,
      email: snapshot.user.email,
      name: snapshot.user.name,
      role: snapshot.user.role,
      timezone: snapshot.user.timezone,
      createdAt: snapshot.user.createdAt,
      updatedAt: snapshot.user.updatedAt,
    },
  });

  await restoreUserSubscriptionsSnapshot(snapshot.user.id, snapshot.subscriptions);
}

export function assertUserEmailTestSnapshotsEqual(
  current: UserEmailTestSnapshot,
  expected: UserEmailTestSnapshot
): void {
  assert.equal(current.existed, expected.existed);

  if (!expected.existed) {
    assert.equal(current.user, null);
    assert.equal(current.subscriptions.length, 0);
    return;
  }

  assert.notEqual(current.user, null);
  assert.notEqual(expected.user, null);

  const currentUser = current.user!;
  const expectedUser = expected.user!;

  assert.equal(currentUser.id, expectedUser.id);
  assert.equal(currentUser.email, expectedUser.email);
  assert.equal(currentUser.name, expectedUser.name);
  assert.equal(currentUser.role, expectedUser.role);
  assert.equal(currentUser.timezone, expectedUser.timezone);
  assert.equal(currentUser.createdAt.toISOString(), expectedUser.createdAt.toISOString());
  assert.equal(currentUser.updatedAt.toISOString(), expectedUser.updatedAt.toISOString());
  assertUserSubscriptionsSnapshotsEqual(current.subscriptions, expected.subscriptions);
}

export async function getTodayStreak(userId: string, timezone: string) {
  const today = formatDateInTimezone(new Date(), timezone);
  return prisma.streakEvent.findUnique({
    where: {
      userId_eventDate: {
        userId,
        eventDate: today,
      },
    },
  });
}

export { SESSION_TTL_MS };
