import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PATH_INSTRUMENT_FALLBACK,
  PATH_LABEL_NEUTRAL,
  resolveModuleFocus,
  resolveNodeDurationLabel,
  resolvePathBadgeLevel,
  resolvePathBadgeMonth,
  resolvePathInstrument,
  resolvePathProgressLabel,
} from "../lib/pathPresentation.js";

describe("pathPresentation", () => {
  it("resuelve instrumento desde slug guitarra", () => {
    assert.equal(resolvePathInstrument("ruta-guitarra-12-meses", "Cualquier título"), "Guitarra");
  });

  it("fallback controlado sin inventar instrumento", () => {
    assert.equal(resolvePathInstrument("curso-experimental", "Curso X"), PATH_INSTRUMENT_FALLBACK);
  });

  it("month usa Module.order real", () => {
    assert.equal(resolvePathBadgeMonth(3), "Mes 3");
    assert.equal(resolvePathBadgeMonth(null), "Mes 1");
  });

  it("level usa título de módulo (DB), no Fundamento hardcode", () => {
    assert.equal(resolvePathBadgeLevel("Tu primer acorde: La menor", "Ruta"), "Tu primer acorde: La menor");
    assert.equal(resolvePathBadgeLevel("  ", "Ruta de guitarra"), "Ruta de guitarra");
  });

  it("focus vacío — sin pedagogía inventada", () => {
    assert.equal(resolveModuleFocus({ title: "Fundamentos" }), "");
  });

  it("pathLabel usa Module.order, no índice de array", () => {
    assert.equal(
      resolvePathProgressLabel({ moduleOrder: 4, nodeOrdinal: 2, nodesTotal: 5 }),
      "Mes 4 · Nodo 2 de 5"
    );
    assert.match(
      resolvePathProgressLabel({
        moduleOrder: 2,
        nodeOrdinal: 3,
        nodesTotal: 3,
        completed: true,
      }),
      /Mes 2 · Camino completado/
    );
    assert.equal(PATH_LABEL_NEUTRAL, "Tu ruta");
  });

  it("duration vacío — no inventa minutos por exercises.length", () => {
    assert.equal(resolveNodeDurationLabel({ exercises: [{}, {}, {}] }), "");
    assert.equal(resolveNodeDurationLabel(), "");
  });
});
