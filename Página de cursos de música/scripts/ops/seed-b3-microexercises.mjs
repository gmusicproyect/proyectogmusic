#!/usr/bin/env node
/**
 * T-PUB-02 Fase 2A — Poblar MicroExercise en B3 (solo nodos admin aprobados).
 *
 * Uso (requiere DATABASE_URL):
 *   node --env-file=.env scripts/ops/seed-b3-microexercises.mjs --help
 *   node --env-file=.env scripts/ops/seed-b3-microexercises.mjs --dry-run [--verbose]
 *   node --env-file=.env scripts/ops/seed-b3-microexercises.mjs --apply --confirm-b3-microexercises [--verbose]
 *
 * Spec: docs/operations/T-PUB-02-fase2a-spec.md
 * Canon Am abierto: X-0-2-2-1-0 (6ª no se toca)
 */
import { PrismaClient, PublishStatus } from "@prisma/client";
import { fileURLToPath } from "node:url";
import {
  COURSE_SLUG,
  MODULE_TITLE,
  NODE_SPECS,
  buildRollbackInfo,
  countPlannedExercises,
  exerciseMatchesSpec,
} from "./seed-b3-microexercises-catalog.mjs";

const LOG_PREFIX = "[t-pub-02]";

export function parseArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const help = flags.has("--help");
  const dryRun = flags.has("--dry-run");
  const apply = flags.has("--apply");
  const verbose = flags.has("--verbose");
  const confirm = flags.has("--confirm-b3-microexercises");

  if (help) {
    return { kind: "help" };
  }

  if (dryRun && apply) {
    return {
      kind: "error",
      message: "Usa solo uno: --dry-run o --apply (no ambos).",
    };
  }

  if (!dryRun && !apply) {
    return {
      kind: "error",
      message:
        "Debes indicar --dry-run o --apply. Sin modo explícito el script no hace nada.",
    };
  }

  if (apply && !confirm) {
    return {
      kind: "error",
      message:
        "--apply requiere confirmación explícita: añade --confirm-b3-microexercises",
    };
  }

  return {
    kind: "run",
    mode: dryRun ? "dry-run" : "apply",
    verbose,
  };
}

export function printHelp() {
  console.log(`T-PUB-02 — seed MicroExercise B3

Uso:
  node --env-file=.env scripts/ops/seed-b3-microexercises.mjs --dry-run [--verbose]
  node --env-file=.env scripts/ops/seed-b3-microexercises.mjs --apply --confirm-b3-microexercises [--verbose]

Flags:
  --dry-run                     Planifica cambios sin escribir en BD
  --apply                       Escribe upserts (requiere --confirm-b3-microexercises)
  --confirm-b3-microexercises   Confirmación obligatoria para --apply
  --verbose                     Muestra payloads e ids resueltos
  --help                        Esta ayuda

Scope:
  Curso:  ${COURSE_SLUG} (PUBLISHED)
  Módulo: ${MODULE_TITLE} (PUBLISHED)
  Nodos:  5 etapas B3 únicamente — nunca B1/B2

Spec: docs/operations/T-PUB-02-fase2a-spec.md
`);
}

function log(message) {
  console.log(`${LOG_PREFIX} ${message}`);
}

function logError(message) {
  console.error(`${LOG_PREFIX} ERROR ${message}`);
}

function redactDatabaseUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}${parsed.port ? `:${parsed.port}` : ""}/***`;
  } catch {
    return "<invalid DATABASE_URL>";
  }
}

class ScriptAbortError extends Error {
  /** @param {string} code */
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 */
async function resolveCourse(prisma) {
  const courses = await prisma.course.findMany({
    where: { slug: COURSE_SLUG, status: PublishStatus.PUBLISHED },
    select: { id: true, slug: true, title: true, status: true },
  });

  if (courses.length === 0) {
    throw new ScriptAbortError("COURSE_NOT_FOUND", `Curso no encontrado: ${COURSE_SLUG}`);
  }
  if (courses.length > 1) {
    throw new ScriptAbortError("COURSE_AMBIGUOUS", `Múltiples cursos publicados: ${COURSE_SLUG}`);
  }

  return courses[0];
}

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} courseId
 */
async function resolveModule(prisma, courseId) {
  const modules = await prisma.module.findMany({
    where: {
      courseId,
      title: MODULE_TITLE,
      status: PublishStatus.PUBLISHED,
    },
    select: { id: true, title: true, order: true, status: true },
  });

  if (modules.length === 0) {
    const published = await prisma.module.findMany({
      where: { courseId, status: PublishStatus.PUBLISHED },
      select: { title: true, order: true },
      orderBy: { order: "asc" },
    });
    const hint = published.map((m) => `"${m.title}" (order ${m.order})`).join(", ");
    throw new ScriptAbortError(
      "MODULE_NOT_FOUND",
      `Módulo no encontrado: "${MODULE_TITLE}". Publicados: ${hint || "(ninguno)"}`
    );
  }

  if (modules.length > 1) {
    throw new ScriptAbortError(
      "MODULE_AMBIGUOUS",
      `Múltiples módulos publicados con título "${MODULE_TITLE}"`
    );
  }

  return modules[0];
}

/**
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {string} moduleId
 */
async function resolveNodes(prisma, moduleId) {
  const publishedCount = await prisma.pathNode.count({
    where: { moduleId, status: PublishStatus.PUBLISHED },
  });

  if (publishedCount !== 5) {
    throw new ScriptAbortError(
      "NODE_COUNT_MISMATCH",
      `El módulo B3 debe tener exactamente 5 nodos PUBLISHED; encontrados: ${publishedCount}`
    );
  }

  /** @type {Array<{ nodeId: string, order: number, title: string, stageType: string, exercises: import("@prisma/client").MicroExercise[] }>} */
  const resolved = [];

  for (const spec of NODE_SPECS) {
    const matches = await prisma.pathNode.findMany({
      where: {
        moduleId,
        stageType: spec.stageType,
        title: spec.title,
        status: PublishStatus.PUBLISHED,
      },
      include: {
        exercises: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (matches.length === 0) {
      throw new ScriptAbortError(
        "NODE_NOT_FOUND",
        `Nodo no encontrado stage=${spec.stageType} title="${spec.title}"`
      );
    }

    if (matches.length > 1) {
      throw new ScriptAbortError(
        "NODE_AMBIGUOUS",
        `Nodo ambiguo stage=${spec.stageType} title="${spec.title}"`
      );
    }

    const node = matches[0];
    resolved.push({
      nodeId: node.id,
      order: node.order,
      title: node.title,
      stageType: node.stageType,
      exercises: node.exercises,
    });
  }

  resolved.sort((a, b) => a.order - b.order);
  return resolved;
}

/**
 * @param {"dry-run"|"apply"} mode
 * @param {boolean} verbose
 * @param {import("@prisma/client").PrismaClient} prisma
 */
async function runSeed(mode, verbose, prisma) {
  const summary = {
    planned: countPlannedExercises(),
    created: 0,
    updated: 0,
    skipped: 0,
    wouldCreate: 0,
    wouldUpdate: 0,
    wouldSkip: 0,
  };

  log(`mode=${mode}`);
  log(`database: ${redactDatabaseUrl(process.env.DATABASE_URL ?? "")}`);

  const course = await resolveCourse(prisma);
  log(`course: slug=${course.slug} id=${course.id} status=${course.status}`);

  const module = await resolveModule(prisma, course.id);
  log(
    `module: title="${module.title}" id=${module.id} order=${module.order} status=${module.status}`
  );

  const nodes = await resolveNodes(prisma, module.id);
  log(`nodes: resolved ${nodes.length}/5`);

  /** @type {Array<{ nodeId: string, title: string, stageType: string, exercises: Array<{ id?: string, order: number }> }>} */
  const rollbackNodes = [];

  let nodeIndex = 0;
  for (const node of nodes) {
    nodeIndex += 1;
    const spec = NODE_SPECS.find(
      (item) => item.stageType === node.stageType && item.title === node.title
    );

    if (!spec) {
      throw new ScriptAbortError(
        "SPEC_NODE_MISSING",
        `Sin spec para nodo ${node.stageType} "${node.title}"`
      );
    }

    log(
      `node[${nodeIndex}/5] stage=${node.stageType} title="${node.title}" id=${node.nodeId}`
    );

    if (verbose) {
      log(`  existing exercises in node: ${node.exercises.length}`);
    }

    rollbackNodes.push({
      nodeId: node.nodeId,
      title: node.title,
      stageType: node.stageType,
      exercises: [],
    });

    for (const exerciseSpec of spec.exercises) {
      const existing = node.exercises.find((item) => item.order === exerciseSpec.order);
      const matches = exerciseMatchesSpec(existing, exerciseSpec);
      const action = !existing ? "create" : matches ? "skip" : "update";

      if (mode === "dry-run") {
        if (action === "create") {
          summary.wouldCreate += 1;
          log(
            `  exercise order=${exerciseSpec.order} type=${exerciseSpec.type} → WOULD_CREATE`
          );
        } else if (action === "skip") {
          summary.wouldSkip += 1;
          log(
            `  exercise order=${exerciseSpec.order} type=${exerciseSpec.type} id=${existing.id} → WOULD_SKIP (matches spec)`
          );
        } else {
          summary.wouldUpdate += 1;
          log(
            `  exercise order=${exerciseSpec.order} type=${exerciseSpec.type} id=${existing.id} → WOULD_UPDATE`
          );
        }
      } else {
        if (action === "skip") {
          summary.skipped += 1;
          log(
            `  exercise order=${exerciseSpec.order} type=${exerciseSpec.type} id=${existing.id} → SKIPPED`
          );
        } else {
          const result = await prisma.microExercise.upsert({
            where: {
              nodeId_order: {
                nodeId: node.nodeId,
                order: exerciseSpec.order,
              },
            },
            create: {
              nodeId: node.nodeId,
              order: exerciseSpec.order,
              type: exerciseSpec.type,
              difficulty: exerciseSpec.difficulty,
              instruction: exerciseSpec.instruction,
              contentPayload: exerciseSpec.contentPayload,
              secureAnswer: exerciseSpec.secureAnswer,
            },
            update: {
              type: exerciseSpec.type,
              difficulty: exerciseSpec.difficulty,
              instruction: exerciseSpec.instruction,
              contentPayload: exerciseSpec.contentPayload,
              secureAnswer: exerciseSpec.secureAnswer,
            },
          });

          if (action === "create") {
            summary.created += 1;
            log(
              `  exercise order=${exerciseSpec.order} type=${exerciseSpec.type} → CREATED id=${result.id}`
            );
          } else {
            summary.updated += 1;
            log(
              `  exercise order=${exerciseSpec.order} type=${exerciseSpec.type} → UPDATED id=${result.id}`
            );
          }

          rollbackNodes[rollbackNodes.length - 1].exercises.push({
            id: result.id,
            order: exerciseSpec.order,
          });
          continue;
        }
      }

      rollbackNodes[rollbackNodes.length - 1].exercises.push({
        id: existing?.id,
        order: exerciseSpec.order,
      });

      if (verbose) {
        log(`  payload order=${exerciseSpec.order}: ${JSON.stringify(exerciseSpec.contentPayload)}`);
      }
    }
  }

  const rollback = buildRollbackInfo(rollbackNodes);

  if (mode === "dry-run") {
    log(
      `summary: nodes=5 exercises=${summary.planned} would_create=${summary.wouldCreate} would_update=${summary.wouldUpdate} would_skip=${summary.wouldSkip} errors=0`
    );
    log("dry-run complete — no writes performed");
  } else {
    log(
      `summary: nodes=5 exercises=${summary.planned} created=${summary.created} updated=${summary.updated} skipped=${summary.skipped} errors=0`
    );
    log("apply complete");
  }

  log("rollback (manual — script does not delete):");
  for (const row of rollback.exerciseRows) {
    log(
      `  reversible: nodeId=${row.nodeId} order=${row.order} existingId=${row.existingId ?? "new"} stage=${row.stageType}`
    );
  }
  if (verbose) {
    log("rollback SQL hint:");
    console.log(rollback.sqlHint);
  }

  return summary;
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.kind === "help") {
    printHelp();
    process.exit(0);
  }

  if (parsed.kind === "error") {
    logError(parsed.message);
    printHelp();
    process.exit(1);
  }

  if (!process.env.DATABASE_URL?.trim()) {
    logError("DATABASE_URL no está definida. Usa node --env-file=.env ...");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    if (parsed.mode === "apply") {
      await prisma.$transaction(async (tx) => {
        await runSeed("apply", parsed.verbose, tx);
      });
    } else {
      await runSeed("dry-run", parsed.verbose, prisma);
    }
    process.exit(0);
  } catch (error) {
    if (error instanceof ScriptAbortError) {
      logError(`${error.code}: ${error.message}`);
      process.exit(1);
    }
    logError(error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (isMain) {
  main();
}
