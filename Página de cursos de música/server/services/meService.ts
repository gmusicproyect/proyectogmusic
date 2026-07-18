import type { User } from "@prisma/client";
import { config } from "../config.js";
import { deriveContentKind } from "../lib/contentKind.js";
import {
  PATH_LABEL_NEUTRAL,
  resolveModuleFocus,
  resolveNodeDurationLabel,
  resolvePathBadgeLevel,
  resolvePathBadgeMonth,
  resolvePathInstrument,
} from "../lib/pathPresentation.js";
import { buildPublicPathNodeFields, publicHttpsMaterialUrl } from "../lib/pathNodePublic.js";
import { prisma } from "../lib/prisma.js";
import {
  findActiveNodeId,
  getActiveNodeContext,
  loadPublishedCoursePath,
} from "./coursePath.js";
import { buildNextPractice, resolveModuleProgress } from "./dashboardAssembly.js";

export async function buildDashboardResponse(student: User) {
  const { modules, statusByNodeId } = await loadPublishedCoursePath(
    config.defaultCourseSlug,
    student.id
  );

  const [xpTotal, xpThisWeek, latestStreak] = await Promise.all([
    prisma.xpEvent.aggregate({
      where: { userId: student.id },
      _sum: { amount: true },
    }),
    prisma.xpEvent.aggregate({
      where: {
        userId: student.id,
        createdAt: { gte: startOfWeekUtc() },
      },
      _sum: { amount: true },
    }),
    prisma.streakEvent.findFirst({
      where: { userId: student.id },
      orderBy: { eventDate: "desc" },
    }),
  ]);

  const activeContext = getActiveNodeContext(modules, statusByNodeId);
  const moduleProgressSnapshot = resolveModuleProgress(modules, statusByNodeId, activeContext);

  const firstInstruction = activeContext
    ? (
        await prisma.microExercise.findFirst({
          where: { nodeId: activeContext.node.id },
          orderBy: { order: "asc" },
          select: { instruction: true },
        })
      )?.instruction ?? null
    : null;

  const percentCompleted =
    moduleProgressSnapshot && moduleProgressSnapshot.totalNodes > 0
      ? Math.round(
          (moduleProgressSnapshot.completedNodes / moduleProgressSnapshot.totalNodes) * 100
        )
      : 0;

  return {
    user: {
      id: student.id,
      name: student.name,
      timezone: student.timezone,
      levelLabel: resolvePathBadgeLevel(moduleProgressSnapshot?.module.title ?? null),
      pathLabel: moduleProgressSnapshot?.pathLabel ?? PATH_LABEL_NEUTRAL,
    },
    streak: {
      currentDays: latestStreak?.currentStreak ?? 0,
      activeToday: isStreakActiveToday(latestStreak?.eventDate, student.timezone),
    },
    xp: {
      total: xpTotal._sum.amount ?? 0,
      earnedThisWeek: xpThisWeek._sum.amount ?? 0,
    },
    moduleProgress: {
      moduleId: moduleProgressSnapshot?.module.id ?? "",
      moduleTitle: moduleProgressSnapshot?.module.title ?? "",
      percentCompleted,
      currentNodeTitle: moduleProgressSnapshot?.currentNodeTitle ?? "",
      completedNodes: moduleProgressSnapshot?.completedNodes ?? 0,
      totalNodes: moduleProgressSnapshot?.totalNodes ?? 0,
    },
    nextPractice: buildNextPractice(activeContext, firstInstruction),
  };
}

export async function buildPathResponse(student: User, courseSlug: string) {
  const { course, modules, statusByNodeId } = await loadPublishedCoursePath(
    courseSlug,
    student.id
  );

  const activeNodeId = findActiveNodeId(modules, statusByNodeId);
  const activeModuleIndex = modules.findIndex((module) =>
    module.nodes.some((node) => node.id === activeNodeId)
  );
  const badgeModule =
    activeModuleIndex >= 0 ? modules[activeModuleIndex] : (modules[0] ?? null);

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      badge: {
        instrument: resolvePathInstrument(course.slug, course.title),
        month: resolvePathBadgeMonth(badgeModule?.order),
        level: resolvePathBadgeLevel(badgeModule?.title, course.title),
      },
    },
    modules: modules.map((module, index) => {
      const nodesCompleted = module.nodes.filter(
        (node) => statusByNodeId.get(node.id) === "completed"
      ).length;

      return {
        id: module.id,
        index: index + 1,
        title: module.title,
        focus: resolveModuleFocus(module),
        nodesCompleted,
        nodesTotal: module.nodes.length,
        nodes: module.nodes.map((node) => {
          const exerciseTypes = node.exercises.map((exercise) => exercise.type);
          const contentKind = deriveContentKind(exerciseTypes);

          const material = buildPublicPathNodeFields(node);

          return {
            id: node.id,
            title: node.title,
            order: material.order,
            status: statusByNodeId.get(node.id) ?? "locked",
            duration: resolveNodeDurationLabel(node),
            contentKind,
            videoUrl: publicHttpsMaterialUrl(node.videoUrl),
            stageType: material.stageType,
            guideText: material.guideText,
            guidePdfUrl: material.guidePdfUrl,
            completionCriteria: material.completionCriteria,
            ctaLabel: material.ctaLabel,
          };
        }),
      };
    }),
    activeNodeId,
  };
}

function startOfWeekUtc(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

function isStreakActiveToday(eventDate: string | undefined, timezone: string): boolean {
  if (!eventDate) return false;
  const today = formatDateInTimezone(new Date(), timezone);
  return eventDate === today;
}

function formatDateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
