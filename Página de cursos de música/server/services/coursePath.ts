import { PublishStatus, type MicroExercise, type Module, type PathNode } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { deriveContentKind } from "../lib/contentKind.js";
import { deriveNodeStatuses } from "../lib/nodeStatus.js";
import { ApiError } from "../lib/errors.js";

type ModuleWithNodes = Module & {
  nodes: (PathNode & { exercises: Pick<MicroExercise, "type">[] })[];
};

export function requirePublishedCourse<T extends { status: PublishStatus }>(
  course: T | null,
  courseSlug: string
): T {
  if (!course || course.status !== PublishStatus.PUBLISHED) {
    throw new ApiError(404, "COURSE_NOT_FOUND", `Curso no encontrado: ${courseSlug}`);
  }
  return course;
}

export async function loadPublishedCoursePath(courseSlug: string, userId: string) {
  const courseRecord = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        where: { status: PublishStatus.PUBLISHED },
        orderBy: { order: "asc" },
        include: {
          nodes: {
            where: { status: PublishStatus.PUBLISHED },
            orderBy: { order: "asc" },
            include: {
              exercises: {
                select: { type: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  });

  const course = requirePublishedCourse(courseRecord, courseSlug);

  const progressRows = await prisma.userProgress.findMany({
    where: {
      userId,
      nodeId: {
        in: course.modules.flatMap((module) => module.nodes.map((node) => node.id)),
      },
    },
    select: { nodeId: true, isCompleted: true },
  });

  const progressByNodeId = new Map(
    progressRows.map((row) => [row.nodeId, { isCompleted: row.isCompleted }])
  );

  const orderedNodes = course.modules.flatMap((module) => module.nodes);
  const statusByNodeId = deriveNodeStatuses(orderedNodes, progressByNodeId);

  return { course, modules: course.modules as ModuleWithNodes[], statusByNodeId };
}

export function findActiveNodeId(
  modules: ModuleWithNodes[],
  statusByNodeId: Map<string, string>
): string | null {
  for (const module of modules) {
    for (const node of module.nodes) {
      if (statusByNodeId.get(node.id) === "active") {
        return node.id;
      }
    }
  }
  return null;
}

export function getActiveNodeContext(
  modules: ModuleWithNodes[],
  statusByNodeId: Map<string, string>
) {
  for (const [moduleIndex, module] of modules.entries()) {
    for (const [nodeIndex, node] of module.nodes.entries()) {
      if (statusByNodeId.get(node.id) === "active") {
        const exerciseTypes = node.exercises.map((exercise) => exercise.type);
        const contentKind = deriveContentKind(exerciseTypes);
        return {
          module,
          moduleIndex,
          node,
          nodeIndex,
          contentKind,
          nodesTotal: module.nodes.length,
        };
      }
    }
  }

  return null;
}
