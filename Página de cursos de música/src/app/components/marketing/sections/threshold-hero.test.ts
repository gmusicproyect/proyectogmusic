import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const heroSource = readFileSync(join(root, "HeroSection.tsx"), "utf8");

describe("ThresholdHero — HeroSection Visual D (D0)", () => {
  it("exporta HeroSection", () => {
    assert.match(heroSource, /export function HeroSection/);
  });

  it("wrapper exterior tiene id hero", () => {
    assert.match(heroSource, /id="hero"/);
  });

  it("CTA interior navega al demo con Ver clase gratuita", () => {
    assert.match(heroSource, /Ver clase gratuita/);
    assert.match(heroSource, /setPage\("mi-camino-demo"\)/);
  });

  it("no usa Three.js ni video", () => {
    assert.equal(heroSource.includes("three"), false);
    assert.equal(heroSource.includes("@react-three"), false);
    assert.equal(heroSource.includes("<video"), false);
  });

  it("usa useScroll y useTransform de motion/react", () => {
    assert.match(heroSource, /useScroll/);
    assert.match(heroSource, /useTransform/);
    assert.match(heroSource, /from "motion\/react"/);
  });

  it("respeta prefers-reduced-motion y touch para parallax", () => {
    assert.match(heroSource, /prefers-reduced-motion: reduce/);
    assert.match(heroSource, /pointer: coarse/);
  });

  it("D1 usa canvas zoom centrado en puerta + interior (threshold-assets)", () => {
    assert.match(heroSource, /THRESHOLD_ASSETS/);
    // Canvas lee píxeles directamente: doorCX y doorCY definen el centro del zoom
    assert.match(heroSource, /doorCX.*0\.50|0\.50.*doorCX/);
    assert.match(heroSource, /doorCY.*0\.62|0\.62.*doorCY/);
    assert.match(heroSource, /ctx\.drawImage/);
    const assetsSource = readFileSync(join(root, "threshold-assets.ts"), "utf8");
    assert.match(assetsSource, /\/hero\/threshold\/facade\.(jpg|png|webp)/);
    assert.match(assetsSource, /interior/);
  });
});
