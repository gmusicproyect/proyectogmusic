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

  it("panel vive en la pestaña Tarjetas cuando el camino está completo", () => {
    assert.match(gmusicPathSource, /tarjetasPanel=\{/);
    assert.match(gmusicPathSource, /viewModel\.isComplete \? \(/);
    assert.match(gmusicPathSource, /<CompletedPathPanel/);
    assert.doesNotMatch(gmusicPathSource, /path-intro-stack pb-4[\s\S]*CompletedPathPanel/);
  });

  it("carrusel se remonta en revisión sin habilitar replay", () => {
    assert.match(gmusicPathSource, /!viewModel\.isComplete \|\| reviewCompletedPath/);
    assert.match(gmusicPathSource, /reviewCompleted=\{reviewCompletedPath\}/);
    assert.match(gmusicPathSource, /canStartLessonFromNode\(node\)/);
    assert.doesNotMatch(gmusicPathSource, /Ir a Práctica/);
  });

  it("las 3 pestañas siguen visibles con camino completo (no se oculta el shell)", () => {
    assert.match(gmusicPathSource, /PathLessonTabsShell/);
    assert.doesNotMatch(
      gmusicPathSource,
      /!viewModel\.isEmpty && \(!viewModel\.isComplete \|\| reviewCompletedPath\)/
    );
  });
});
