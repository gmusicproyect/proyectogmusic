import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COURSE_SLUG,
  MODULE_TITLE,
  NODE_SPECS,
  buildRollbackInfo,
  countPlannedExercises,
  exerciseMatchesSpec,
} from "./seed-b3-microexercises-catalog.mjs";
import { parseArgs } from "./seed-b3-microexercises.mjs";

describe("seed-b3-microexercises parseArgs", () => {
  it("requiere --dry-run o --apply", () => {
    const result = parseArgs([]);
    assert.equal(result.kind, "error");
    assert.match(result.message, /--dry-run/);
  });

  it("rechaza --dry-run y --apply juntos", () => {
    const result = parseArgs(["--dry-run", "--apply"]);
    assert.equal(result.kind, "error");
    assert.match(result.message, /no ambos/i);
  });

  it("--apply sin confirmación aborta", () => {
    const result = parseArgs(["--apply"]);
    assert.equal(result.kind, "error");
    assert.match(result.message, /--confirm-b3-microexercises/);
  });

  it("--apply con confirmación es válido", () => {
    const result = parseArgs(["--apply", "--confirm-b3-microexercises", "--verbose"]);
    assert.deepEqual(result, { kind: "run", mode: "apply", verbose: true });
  });

  it("--dry-run es válido", () => {
    const result = parseArgs(["--dry-run"]);
    assert.deepEqual(result, { kind: "run", mode: "dry-run", verbose: false });
  });

  it("--help", () => {
    const result = parseArgs(["--help"]);
    assert.equal(result.kind, "help");
  });
});

describe("seed-b3-microexercises catalog", () => {
  it("constantes de lookup", () => {
    assert.equal(COURSE_SLUG, "ruta-guitarra-12-meses");
    assert.equal(MODULE_TITLE, "Tu primer acorde: La menor");
  });

  it("define 5 nodos y 6 ejercicios", () => {
    assert.equal(NODE_SPECS.length, 5);
    assert.equal(countPlannedExercises(), 6);
  });

  it("nodo 2 usa digitación canon X-0-2-2-1-0", () => {
    const node = NODE_SPECS[1];
    const exercise = node.exercises[0];
    assert.equal(exercise.secureAnswer.correctOptionId, "a");
    const optionA = exercise.contentPayload.options.find((o) => o.id === "a");
    assert.equal(optionA?.text, "X-0-2-2-1-0");
  });

  it("nodo 4 TAP tiene 5 beats (cuerdas 5→1)", () => {
    const exercise = NODE_SPECS[3].exercises[0];
    assert.equal(exercise.type, "RHYTHM_TAP");
    assert.equal(exercise.contentPayload.tapSequence.length, 5);
    assert.equal(exercise.contentPayload.tapSequence[0].stringNumber, 5);
    assert.equal(exercise.contentPayload.tapSequence[4].stringNumber, 1);
  });

  it("nodo 5 order 2 es CHORD_SHAPE (sin EAR_TRAINING)", () => {
    const exercise = NODE_SPECS[4].exercises[1];
    assert.equal(exercise.type, "CHORD_SHAPE");
    assert.equal(exercise.order, 2);
  });

  it("exerciseMatchesSpec detecta igualdad", () => {
    const spec = NODE_SPECS[0].exercises[0];
    assert.equal(exerciseMatchesSpec(spec, spec), true);
  });

  it("buildRollbackInfo genera hint SQL acotado", () => {
    const info = buildRollbackInfo([
      {
        nodeId: "node-a",
        title: "t1",
        stageType: "FUNDAMENTO_UNO",
        exercises: [{ id: "ex-1", order: 1 }],
      },
    ]);
    assert.ok(info.sqlHint.includes('"nodeId"'));
    assert.ok(info.sqlHint.includes("node-a"));
    assert.equal(info.exerciseRows.length, 1);
  });
});
