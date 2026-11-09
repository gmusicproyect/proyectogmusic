/**
 * Contrato del checklist smoke Track A vs routing D-GOV-19.
 * Evita que el doc operativo vuelva a enseñar /mi-camino-demo como ruta primaria.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  CLASE_GRATUITA_MAP_PAGE,
  pathnameForClaseGratuitaLesson,
} from "../utils/clase-gratuita-routing.ts";
import { pageFromPathname, pathnameForPage } from "../utils/student-zone-routing.ts";

const here = dirname(fileURLToPath(import.meta.url));
const smokeDoc = readFileSync(
  join(here, "../../../docs/operations/smoke-track-a.md"),
  "utf8",
);

describe("smoke-track-a — contrato D-GOV-19", () => {
  it("documenta /clase-gratuita como funnel demo primario", () => {
    assert.match(smokeDoc, /\/clase-gratuita/);
    assert.match(smokeDoc, /D-GOV-19/);
  });

  it("no enseña /mi-camino-demo como paso del smoke", () => {
    const demoRow = smokeDoc
      .split("\n")
      .find((line) => line.includes("DEMO → clase"));
    assert.ok(demoRow, "fila DEMO del smoke ausente");
    assert.equal(demoRow.includes("/mi-camino-demo"), false);
    assert.equal(demoRow.includes("/clase-gratuita"), true);
  });

  it("routing real resuelve mapa y lecciones 1–5", () => {
    assert.equal(pathnameForPage(CLASE_GRATUITA_MAP_PAGE), "/clase-gratuita");
    assert.equal(pageFromPathname("/clase-gratuita"), CLASE_GRATUITA_MAP_PAGE);
    for (let n = 1; n <= 5; n += 1) {
      assert.equal(pathnameForClaseGratuitaLesson(n), `/clase-gratuita/${n}`);
      assert.equal(pageFromPathname(`/clase-gratuita/${n}`), `clase-gratuita-${n}`);
    }
  });

  it("zona alumno /mi-camino sigue en el checklist", () => {
    assert.match(smokeDoc, /\/mi-camino/);
    assert.equal(pathnameForPage("mi-camino"), "/mi-camino");
  });
});
