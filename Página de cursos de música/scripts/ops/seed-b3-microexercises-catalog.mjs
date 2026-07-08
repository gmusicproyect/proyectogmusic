/**
 * Catálogo aprobado T-PUB-02 Fase 2A — B3 MicroExercise.
 * Fuente: docs/operations/T-PUB-02-fase2a-spec.md §4
 */

export const COURSE_SLUG = "ruta-guitarra-12-meses";
export const MODULE_TITLE = "Tu primer acorde: La menor";

/** @typedef {"FUNDAMENTO_UNO"|"FUNDAMENTO_DOS"|"TECNICA"|"PRACTICA"|"TOCAR"} StageType */

/**
 * @typedef {object} ExerciseSpec
 * @property {number} order
 * @property {string} type
 * @property {number} difficulty
 * @property {string} instruction
 * @property {Record<string, unknown>} contentPayload
 * @property {{ correctOptionId: string }} secureAnswer
 */

/**
 * @typedef {object} NodeSpec
 * @property {StageType} stageType
 * @property {string} title
 * @property {ExerciseSpec[]} exercises
 */

/** @type {NodeSpec[]} */
export const NODE_SPECS = [
  {
    stageType: "FUNDAMENTO_UNO",
    title: "Qué es un acorde y por qué Am es la puerta",
    exercises: [
      {
        order: 1,
        type: "CHORD_SHAPE",
        difficulty: 1,
        instruction: "¿Cuál definición describe mejor un acorde en guitarra?",
        contentPayload: {
          options: [
            { id: "a", text: "Varias notas que suenan juntas" },
            { id: "b", text: "Una sola cuerda pulsada al aire" },
            { id: "c", text: "El silencio entre dos notas" },
          ],
        },
        secureAnswer: { correctOptionId: "a" },
      },
    ],
  },
  {
    stageType: "FUNDAMENTO_DOS",
    title: "Diagrama de Am: dedos, trastes, cuerdas",
    exercises: [
      {
        order: 1,
        type: "CHORD_SHAPE",
        difficulty: 1,
        instruction: "Elige la digitación correcta para La menor (Am) en posición abierta.",
        contentPayload: {
          diagramLabel: "Am abierto · desde 6ª a 1ª cuerda",
          options: [
            { id: "a", text: "X-0-2-2-1-0" },
            { id: "b", text: "0-1-2-2-0-0" },
            { id: "c", text: "1-3-2-0-1-0" },
          ],
        },
        secureAnswer: { correctOptionId: "a" },
      },
    ],
  },
  {
    stageType: "TECNICA",
    title: "Presión limpia sin trasteo",
    exercises: [
      {
        order: 1,
        type: "CHORD_SHAPE",
        difficulty: 1,
        instruction: "¿Qué ayuda a que cada cuerda del acorde suene clara, sin trasteo?",
        contentPayload: {
          options: [
            {
              id: "a",
              text: "Presionar con la yema, cerca del traste, sin tocar otras cuerdas",
            },
            { id: "b", text: "Apoyar el dedo en el centro del espacio entre trastes" },
            { id: "c", text: "Presionar lo más suave posible sin tocar la cuerda" },
          ],
        },
        secureAnswer: { correctOptionId: "a" },
      },
    ],
  },
  {
    stageType: "PRACTICA",
    title: "Armar el acorde por cuerdas",
    exercises: [
      {
        order: 1,
        type: "RHYTHM_TAP",
        difficulty: 1,
        instruction:
          "Arma el acorde Am y toca solo las cuerdas que pertenecen al acorde, desde la 5ª hasta la 1ª. Marca cada TAP cuando suene.",
        contentPayload: {
          tapHeadline: "Am cuerda por cuerda",
          tapDescription:
            "La 6ª cuerda no se toca. Arma La menor y toca una vez cada cuerda desde la 5ª hasta la 1ª.",
          submissionOptionId: "tap-complete",
          tapSequence: [
            { stringNumber: 5, label: "5", stringName: "La" },
            { stringNumber: 4, label: "4", stringName: "Re" },
            { stringNumber: 3, label: "3", stringName: "Sol" },
            { stringNumber: 2, label: "2", stringName: "Si" },
            { stringNumber: 1, label: "1", stringName: "Mi agudo" },
          ],
        },
        secureAnswer: { correctOptionId: "tap-complete" },
      },
    ],
  },
  {
    stageType: "TOCAR",
    title: "Am al pulso",
    exercises: [
      {
        order: 1,
        type: "RHYTHM_TAP",
        difficulty: 1,
        instruction: "Toca el acorde Am cuatro veces al pulso — una pulsación por TAP.",
        contentPayload: {
          tapHeadline: "Am · 4 tiempos",
          tapDescription:
            "Mantén el acorde Am y marca un TAP por cada tiempo. Ve a tu ritmo — sin metrónomo en este piloto.",
          submissionOptionId: "tap-complete",
          tapSequence: [
            { stringNumber: 5, label: "1", stringName: "Tiempo 1" },
            { stringNumber: 5, label: "2", stringName: "Tiempo 2" },
            { stringNumber: 5, label: "3", stringName: "Tiempo 3" },
            { stringNumber: 5, label: "4", stringName: "Tiempo 4" },
          ],
        },
        secureAnswer: { correctOptionId: "tap-complete" },
      },
      {
        order: 2,
        type: "CHORD_SHAPE",
        difficulty: 1,
        instruction: "Al rasguear Am abierto, ¿qué hacemos con la 6ª cuerda?",
        contentPayload: {
          options: [
            { id: "a", text: "No la tocamos — queda silenciada" },
            { id: "b", text: "La tocamos al aire como parte del acorde" },
            { id: "c", text: "Es la única cuerda que debemos pulsar" },
          ],
        },
        secureAnswer: { correctOptionId: "a" },
      },
    ],
  },
];

export function countPlannedExercises() {
  return NODE_SPECS.reduce((sum, node) => sum + node.exercises.length, 0);
}

export function stableJson(value) {
  return JSON.stringify(value, (_key, val) => {
    if (val && typeof val === "object" && !Array.isArray(val)) {
      return Object.keys(val)
        .sort()
        .reduce((acc, key) => {
          acc[key] = val[key];
          return acc;
        }, {});
    }
    return val;
  });
}

/**
 * @param {import("@prisma/client").MicroExercise | ExerciseSpec | null | undefined} existing
 * @param {ExerciseSpec} spec
 */
export function exerciseMatchesSpec(existing, spec) {
  if (!existing) return false;
  return (
    existing.type === spec.type &&
    existing.difficulty === spec.difficulty &&
    existing.instruction === spec.instruction &&
    stableJson(existing.contentPayload) === stableJson(spec.contentPayload) &&
    stableJson(existing.secureAnswer) === stableJson(spec.secureAnswer)
  );
}

/**
 * @param {Array<{ nodeId: string, title: string, stageType: string, exercises: Array<{ id?: string, order: number }> }>} resolvedNodes
 */
export function buildRollbackInfo(resolvedNodes) {
  const nodeIds = resolvedNodes.map((node) => node.nodeId);
  const orders = [...new Set(resolvedNodes.flatMap((node) => node.exercises.map((e) => e.order)))].sort(
    (a, b) => a - b
  );

  return {
    nodeIds,
    orders,
    sqlHint: `-- Manual rollback (T-PUB-02 B3 only — review before running)
DELETE FROM "MicroExercise"
WHERE "nodeId" IN (${nodeIds.map((id) => `'${id}'`).join(", ")})
  AND "order" IN (${orders.join(", ")});`,
    exerciseRows: resolvedNodes.flatMap((node) =>
      node.exercises.map((exercise) => ({
        nodeId: node.nodeId,
        nodeTitle: node.title,
        stageType: node.stageType,
        order: exercise.order,
        existingId: exercise.id ?? null,
      }))
    ),
  };
}
