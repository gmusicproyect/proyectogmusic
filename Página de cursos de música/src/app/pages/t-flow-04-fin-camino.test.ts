import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const gmusicPathSource = readFileSync(path.join(here, "GmusicPath.tsx"), "utf8");
const panelSource = readFileSync(
  path.join(here, "../components/gmusic/path/CompletedPathPanel.tsx"),
  "utf8"
);

describe("T-FLOW-04 — pantalla fin de contenido publicado", () => {
  it("panel usa título y frase canónicos del mandato", () => {
    assert.match(panelSource, /Completaste lo publicado/);
    assert.match(panelSource, /No hay más clases publicadas por ahora\./);
  });

  it("CTA primario → mi-estudio · CTA secundario → revisión", () => {
    assert.match(panelSource, /Ir a Mi Estudio/);
    assert.match(panelSource, /setPage\("mi-estudio"\)/);
    assert.match(panelSource, /Seguir en Mi Camino/);
    assert.match(gmusicPathSource, /onReviewPath=\{\(\) => setReviewCompletedPath\(true\)\}/);
  });

  it("carrusel se remonta en revisión sin habilitar replay", () => {
    assert.match(gmusicPathSource, /\(!viewModel\.isComplete \|\| reviewCompletedPath\)/);
  });
});
