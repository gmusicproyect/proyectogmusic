/**
 * Smoke D-GOV-17 — path suscriptor vía loadPublishedCoursePath (sin mock).
 *
 * Valida: módulos publicados, nodos por bloque, estados unlock y conteo de
 * microejercicios para el alumno QA por defecto (carlos@gmusic.academy).
 *
 * Decisión: D-GOV-17 Opción B (badge legacy; seed B1 3 + B2 2 nodos jugables).
 * Evidencia: docs/operations/D-GOV-17-legacy-blocks-opcion-b.md
 *
 * Uso: npx tsx --env-file=.env scripts/dev/smoke-mi-camino-path.ts
 */
import { prisma } from "../../server/lib/prisma.js";
import { loadPublishedCoursePath } from "../../server/services/coursePath.js";
import { deriveNodeStatuses } from "../../server/lib/nodeStatus.js";

const student = await prisma.user.findUniqueOrThrow({
  where: { email: "carlos@gmusic.academy" },
});

const { modules } = await loadPublishedCoursePath("ruta-guitarra-12-meses", student.id);
const allNodes = modules.flatMap((module) => module.nodes);
const progress = await prisma.userProgress.findMany({
  where: {
    userId: student.id,
    nodeId: { in: allNodes.map((node) => node.id) },
  },
});
const progressMap = new Map(
  progress.map((row) => [row.nodeId, { isCompleted: row.isCompleted }])
);
const statuses = deriveNodeStatuses(allNodes, progressMap);

console.log("SMOKE Mi Camino — alumno:", student.email);
console.log("Modulos publicados:", modules.length);
for (const module of modules) {
  console.log(`\nB${module.order} ${module.title} (${module.nodes.length} nodos)`);
  for (const node of module.nodes) {
    const exerciseCount = node.exercises?.length ?? 0;
    console.log(
      `  ${node.order}. ${node.title.trim() || "(sin título)"} | ${statuses.get(node.id)} | ejercicios: ${exerciseCount}`
    );
  }
}

await prisma.$disconnect();
