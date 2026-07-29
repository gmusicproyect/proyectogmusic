import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildMissingStagesMessage } from "./admin-publish-feedback";

describe("D1 — MODULE_INCOMPLETE legible", () => {
  it("nombra las etapas que faltan", () => {
    const msg = buildMissingStagesMessage([
      { stageLabel: "Fundamento 1", node: {} },
      { stageLabel: "Técnica", node: null },
      { stageLabel: "Tocar", node: null },
    ]);
    assert.equal(msg, "Para publicar el bloque completa estas etapas: Técnica, Tocar.");
  });

  it("singular cuando falta una sola", () => {
    const msg = buildMissingStagesMessage([
      { stageLabel: "Práctica", node: null },
      { stageLabel: "Tocar", node: {} },
    ]);
    assert.match(msg ?? "", /esta etapa: Práctica\./);
  });

  it("null cuando 5/5 completo (el 400 no debería ocurrir)", () => {
    assert.equal(
      buildMissingStagesMessage([{ stageLabel: "Tocar", node: {} }]),
      null
    );
  });

  it("AdminPage cablea el helper en el catch de publish", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(path.join(here, "../../pages/AdminPage.tsx"), "utf8");
    assert.match(source, /buildMissingStagesMessage/);
    assert.match(source, /MODULE_INCOMPLETE/);
  });

  it("D2: la vista de respuestas declara el límite de 200", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(path.join(here, "../../pages/AdminPage.tsx"), "utf8");
    assert.match(source, /máximo las últimas 200 respuestas/);
  });
});
