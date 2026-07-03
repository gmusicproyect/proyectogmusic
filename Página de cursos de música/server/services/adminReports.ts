import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export async function getAdminNodeAttempts(nodeId: string) {
  const node = await prisma.pathNode.findUnique({
    where: { id: nodeId },
    include: {
      module: {
        select: { id: true, order: true, title: true },
      },
    },
  });

  if (!node) {
    throw new ApiError(404, "NODE_NOT_FOUND", "Etapa no encontrada.");
  }

  const attempts = await prisma.exerciseAttempt.findMany({
    where: {
      exercise: { nodeId },
    },
    include: {
      session: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      exercise: {
        select: { id: true, order: true, instruction: true, type: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const correct = attempts.filter((entry) => entry.isCorrect).length;

  return {
    node: {
      id: node.id,
      order: node.order,
      title: node.title,
      module: node.module,
    },
    summary: {
      total: attempts.length,
      correct,
      incorrect: attempts.length - correct,
    },
    attempts: attempts.map((entry) => ({
      id: entry.id,
      isCorrect: entry.isCorrect,
      selectedAnswer: entry.selectedAnswer,
      responseTimeMs: entry.responseTimeMs,
      createdAt: entry.createdAt.toISOString(),
      student: {
        id: entry.session.user.id,
        name: entry.session.user.name,
        email: entry.session.user.email,
      },
      exercise: {
        id: entry.exercise.id,
        order: entry.exercise.order,
        instruction: entry.exercise.instruction,
        type: entry.exercise.type,
      },
    })),
  };
}
