import { PublishStatus, StageType, type PathNode } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export const STAGE_TYPES_BY_ORDER: readonly StageType[] = [
  StageType.FUNDAMENTO_UNO,
  StageType.FUNDAMENTO_DOS,
  StageType.TECNICA,
  StageType.PRACTICA,
  StageType.TOCAR,
] as const;

export const STAGE_TYPE_LABELS: Record<StageType, string> = {
  [StageType.FUNDAMENTO_UNO]: "Fundamento uno",
  [StageType.FUNDAMENTO_DOS]: "Fundamento dos",
  [StageType.TECNICA]: "Técnica",
  [StageType.PRACTICA]: "Práctica",
  [StageType.TOCAR]: "Tocar",
};

export type PathNodeSlotSnapshot = Pick<
  PathNode,
  | "id"
  | "order"
  | "title"
  | "status"
  | "stageType"
  | "videoUrl"
  | "guideText"
  | "completionCriteria"
  | "ctaLabel"
>;

export function stageTypeForOrder(order: number): StageType {
  const stageType = STAGE_TYPES_BY_ORDER[order - 1];
  if (!stageType) {
    throw new ApiError(400, "INVALID_SLOT_ORDER", "El slot debe estar entre 1 y 5.");
  }
  return stageType;
}

export function isNodeSlotComplete(node: PathNodeSlotSnapshot): boolean {
  return (
    Boolean(node.title.trim()) &&
    Boolean(node.completionCriteria?.trim()) &&
    node.stageType != null
  );
}

export function validateModuleForPublish(
  nodes: PathNodeSlotSnapshot[]
): { ok: true } | { ok: false; reason: string } {
  if (nodes.length !== 5) {
    return {
      ok: false,
      reason: "Un bloque publicable debe tener exactamente 5 etapas.",
    };
  }

  const stageTypes = new Set(nodes.map((node) => node.stageType));
  if (stageTypes.size !== 5) {
    return {
      ok: false,
      reason: "Faltan etapas o hay stageType duplicados.",
    };
  }

  for (const expected of STAGE_TYPES_BY_ORDER) {
    if (!stageTypes.has(expected)) {
      return {
        ok: false,
        reason: `Falta la etapa ${STAGE_TYPE_LABELS[expected]}.`,
      };
    }
  }

  if (!nodes.every(isNodeSlotComplete)) {
    return {
      ok: false,
      reason: "Cada etapa necesita título y criterio de completado.",
    };
  }

  return { ok: true };
}

export function computeModuleCompletion(nodes: PathNodeSlotSnapshot[]) {
  const completeSlots = nodes.filter(isNodeSlotComplete).length;
  return {
    completeSlots,
    totalSlots: 5,
    percentComplete: Math.round((completeSlots / 5) * 100),
  };
}

export function deriveModuleListStatus(
  moduleStatus: PublishStatus,
  nodes: PathNodeSlotSnapshot[]
): "empty" | "draft" | "published" {
  if (moduleStatus === PublishStatus.PUBLISHED) return "published";
  if (nodes.length === 0 || nodes.every((node) => !node.title.trim())) return "empty";
  return "draft";
}

export async function listAdminModules(courseSlug: string) {
  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          nodes: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!course) {
    throw new ApiError(404, "COURSE_NOT_FOUND", `Curso no encontrado: ${courseSlug}`);
  }

  return {
    course: {
      id: course.id,
      slug: course.slug,
      title: course.title,
    },
    modules: course.modules.map((module) => {
      const completion = computeModuleCompletion(module.nodes);
      return {
        id: module.id,
        order: module.order,
        title: module.title,
        status: module.status,
        listStatus: deriveModuleListStatus(module.status, module.nodes),
        ...completion,
      };
    }),
  };
}

export async function getAdminModuleDetail(moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { id: true, slug: true, title: true } },
      nodes: { orderBy: { order: "asc" } },
    },
  });

  if (!module) {
    throw new ApiError(404, "MODULE_NOT_FOUND", "Bloque no encontrado.");
  }

  const slots = STAGE_TYPES_BY_ORDER.map((stageType, index) => {
    const order = index + 1;
    const node = module.nodes.find((entry) => entry.order === order);
    return {
      order,
      stageType,
      stageLabel: STAGE_TYPE_LABELS[stageType],
      node: node
        ? {
            id: node.id,
            title: node.title,
            status: node.status,
            videoUrl: node.videoUrl,
            guideText: node.guideText,
            completionCriteria: node.completionCriteria,
            ctaLabel: node.ctaLabel,
            complete: isNodeSlotComplete(node),
          }
        : null,
    };
  });

  const validation = validateModuleForPublish(
    module.nodes.length === 5 ? module.nodes : []
  );

  return {
    module: {
      id: module.id,
      order: module.order,
      title: module.title,
      status: module.status,
      course: module.course,
    },
    slots,
    canPublish: validation.ok,
    publishBlockReason: validation.ok ? null : validation.reason,
    ...computeModuleCompletion(module.nodes),
  };
}

export async function createAdminModule(courseSlug: string, title: string) {
  const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
  if (!course) {
    throw new ApiError(404, "COURSE_NOT_FOUND", `Curso no encontrado: ${courseSlug}`);
  }

  const lastModule = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const order = (lastModule?.order ?? 0) + 1;
  const trimmedTitle = title.trim();
  if (!trimmedTitle) {
    throw new ApiError(400, "INVALID_TITLE", "El bloque necesita un título.");
  }

  const module = await prisma.module.create({
    data: {
      courseId: course.id,
      title: trimmedTitle,
      order,
      status: PublishStatus.DRAFT,
      nodes: {
        create: STAGE_TYPES_BY_ORDER.map((stageType, index) => ({
          order: index + 1,
          title: "",
          status: PublishStatus.DRAFT,
          stageType,
        })),
      },
    },
    include: { nodes: { orderBy: { order: "asc" } } },
  });

  return module;
}

export type UpdateAdminSlotInput = {
  title: string;
  videoUrl?: string | null;
  guideText?: string | null;
  completionCriteria?: string | null;
  ctaLabel?: string | null;
};

export async function updateAdminSlot(
  moduleId: string,
  slotOrder: number,
  input: UpdateAdminSlotInput
) {
  stageTypeForOrder(slotOrder);

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, status: true },
  });

  if (!module) {
    throw new ApiError(404, "MODULE_NOT_FOUND", "Bloque no encontrado.");
  }

  const trimmedTitle = input.title.trim();
  if (!trimmedTitle) {
    throw new ApiError(400, "INVALID_TITLE", "La etapa necesita un título visible.");
  }

  const stageType = stageTypeForOrder(slotOrder);

  const node = await prisma.pathNode.upsert({
    where: {
      moduleId_order: {
        moduleId,
        order: slotOrder,
      },
    },
    update: {
      title: trimmedTitle,
      videoUrl: normalizeNullableText(input.videoUrl),
      guideText: normalizeNullableText(input.guideText),
      completionCriteria: normalizeNullableText(input.completionCriteria),
      ctaLabel: normalizeNullableText(input.ctaLabel),
      stageType,
      status: PublishStatus.DRAFT,
    },
    create: {
      moduleId,
      order: slotOrder,
      title: trimmedTitle,
      videoUrl: normalizeNullableText(input.videoUrl),
      guideText: normalizeNullableText(input.guideText),
      completionCriteria: normalizeNullableText(input.completionCriteria),
      ctaLabel: normalizeNullableText(input.ctaLabel),
      stageType,
      status: PublishStatus.DRAFT,
    },
  });

  if (module.status === PublishStatus.PUBLISHED) {
    await prisma.module.update({
      where: { id: moduleId },
      data: { status: PublishStatus.DRAFT },
    });
  }

  return node;
}

export async function publishAdminModule(moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      nodes: { orderBy: { order: "asc" } },
    },
  });

  if (!module) {
    throw new ApiError(404, "MODULE_NOT_FOUND", "Bloque no encontrado.");
  }

  const validation = validateModuleForPublish(module.nodes);
  if (!validation.ok) {
    throw new ApiError(400, "MODULE_INCOMPLETE", validation.reason);
  }

  await prisma.$transaction([
    prisma.pathNode.updateMany({
      where: { moduleId },
      data: { status: PublishStatus.PUBLISHED },
    }),
    prisma.module.update({
      where: { id: moduleId },
      data: { status: PublishStatus.PUBLISHED },
    }),
  ]);

  return getAdminModuleDetail(moduleId);
}

export async function deleteAdminModule(moduleId: string) {
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { nodes: { select: { id: true } } },
  });

  if (!module) {
    throw new ApiError(404, "MODULE_NOT_FOUND", "Bloque no encontrado.");
  }

  if (module.status !== PublishStatus.DRAFT) {
    throw new ApiError(
      409,
      "MODULE_NOT_DELETABLE",
      "Solo puedes eliminar bloques en borrador."
    );
  }

  const nodeIds = module.nodes.map((node) => node.id);

  if (nodeIds.length > 0) {
    const [progressCount, sessionCount] = await Promise.all([
      prisma.userProgress.count({ where: { nodeId: { in: nodeIds } } }),
      prisma.lessonSession.count({ where: { nodeId: { in: nodeIds } } }),
    ]);

    if (progressCount > 0 || sessionCount > 0) {
      throw new ApiError(
        409,
        "MODULE_NOT_DELETABLE",
        "Este bloque ya tiene actividad de alumnos y no se puede eliminar."
      );
    }

    const exercises = await prisma.microExercise.findMany({
      where: { nodeId: { in: nodeIds } },
      select: { id: true },
    });

    if (exercises.length > 0) {
      const attemptCount = await prisma.exerciseAttempt.count({
        where: { microExerciseId: { in: exercises.map((entry) => entry.id) } },
      });
      if (attemptCount > 0) {
        throw new ApiError(
          409,
          "MODULE_NOT_DELETABLE",
          "Este bloque tiene respuestas de ejercicios y no se puede eliminar."
        );
      }
    }

    await prisma.$transaction([
      prisma.microExercise.deleteMany({ where: { nodeId: { in: nodeIds } } }),
      prisma.pathNode.deleteMany({ where: { moduleId } }),
      prisma.module.delete({ where: { id: moduleId } }),
    ]);
  } else {
    await prisma.module.delete({ where: { id: moduleId } });
  }

  return { deleted: true as const, moduleId };
}

function normalizeNullableText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
