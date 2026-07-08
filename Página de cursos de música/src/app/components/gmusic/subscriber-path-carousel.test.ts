import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  buildSubscriberPathCardModels,
  flattenPathNodes,
  resolveCarouselFocusIndex,
} from "./subscriber-path-carousel";
import type { PathModuleData } from "../../data/gmusic-path-types";

const root = dirname(fileURLToPath(import.meta.url));
const demoPathCardsSource = readFileSync(join(root, "DemoPathCards.tsx"), "utf8");
const headerSource = readFileSync(join(root, "GmusicInternalHeader.tsx"), "utf8");

const SAMPLE_MODULES: PathModuleData[] = [
  {
    id: "mod-1",
    index: 1,
    title: "Fundamentos",
    focus: "Postura",
    nodes: [
      {
        id: "node-1",
        title: "Postura",
        type: "video",
        status: "completed",
        lane: "center",
      },
      {
        id: "node-2",
        title: "Primer acorde",
        type: "video",
        status: "active",
        lane: "right",
        typeLabel: "Lección · 6 min",
      },
      {
        id: "node-3",
        title: "Pulso",
        type: "audio_lab",
        status: "locked",
        lane: "left",
      },
    ],
  },
];

describe("subscriber-path-carousel", () => {
  it("aplana módulos en lista de nodos", () => {
    const nodes = flattenPathNodes(SAMPLE_MODULES);
    assert.equal(nodes.length, 3);
    assert.equal(nodes[1]?.id, "node-2");
  });

  it("enfoca el nodo active del API", () => {
    const nodes = flattenPathNodes(SAMPLE_MODULES);
    assert.equal(resolveCarouselFocusIndex(nodes, "node-2"), 1);
  });

  it("solo permite iniciar nodos active/available", () => {
    const nodes = flattenPathNodes(SAMPLE_MODULES);
    const models = buildSubscriberPathCardModels(nodes, 1, () => {}, () => {});
    const activeModel = models[1];
    const lockedModels = buildSubscriberPathCardModels(nodes, 2, () => {}, () => {});
    const lockedModel = lockedModels[2];

    assert.equal(activeModel?.focusedCta?.kind, "action");
    assert.equal(activeModel?.focusedCta?.label, "Iniciar lección");
    assert.equal(lockedModel?.focusedCta?.kind, "locked");
    assert.equal(lockedModel?.focusedCta?.label, "Bloqueada");
  });

  it("marca completed sin CTA de inicio", () => {
    const nodes = flattenPathNodes(SAMPLE_MODULES);
    const models = buildSubscriberPathCardModels(nodes, 0, () => {}, () => {});
    assert.equal(models[0]?.focusedCta?.label, "Completada");
  });

  it("muestra Preparando… mientras la sesión carga", () => {
    const nodes = flattenPathNodes(SAMPLE_MODULES);
    const models = buildSubscriberPathCardModels(nodes, 1, () => {}, () => {}, "node-2");
    assert.equal(models[1]?.focusedCta?.label, "Preparando…");
  });
});

describe("DemoPathCards — wrapper del carrusel compartido", () => {
  it("delega en PathCarouselCards sin cambiar props públicas", () => {
    assert.match(demoPathCardsSource, /PathCarouselCards/);
    assert.match(demoPathCardsSource, /onStartLesson/);
    assert.match(demoPathCardsSource, /onLockedClick/);
  });
});

describe("GmusicInternalHeader — orden de nav suscriptor", () => {
  it("muestra Mi Camino antes que Mi Estudio", () => {
    const caminoIdx = headerSource.indexOf('label: "Mi Camino"');
    const estudioIdx = headerSource.indexOf('label: "Mi Estudio"');
    assert.ok(caminoIdx >= 0 && estudioIdx >= 0);
    assert.ok(caminoIdx < estudioIdx);
  });
});
