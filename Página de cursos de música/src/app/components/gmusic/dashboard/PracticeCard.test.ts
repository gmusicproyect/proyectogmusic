import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const practiceCardSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "PracticeCard.tsx"),
  "utf8"
);

describe("PracticeCard", () => {
  it("loading queda deshabilitada y no permite continuar", () => {
    assert.match(practiceCardSource, /isLoading\?: boolean/);
    assert.match(practiceCardSource, /isLoading={isLoading}/);
    assert.match(practiceCardSource, /disabled={isLoading}/);
  });

  it("B2 — no repite el título del nodo en un h2 visible", () => {
    assert.match(practiceCardSource, /sr-only/);
    assert.doesNotMatch(practiceCardSource, /<h2[\s\S]*\{title\}/);
  });

  it("B1 — usa shell compartido con el hero", () => {
    assert.match(practiceCardSource, /STUDIO_PANEL_SHELL_STYLE/);
    assert.match(practiceCardSource, /lg:flex-row/);
    assert.match(practiceCardSource, /text-left/);
  });

  it("mobile — CTA corto sin wrap; desktop mantiene label completo", () => {
    assert.match(practiceCardSource, /md:hidden">Continuar</);
    assert.match(practiceCardSource, /hidden md:inline">Continuar mi Camino</);
    assert.match(practiceCardSource, /aria-label="Continuar mi Camino"/);
  });
});
