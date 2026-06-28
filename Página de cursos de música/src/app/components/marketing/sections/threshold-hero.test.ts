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

  it("hero marca centrada — sin CTA (embudo en Academia)", () => {
    assert.doesNotMatch(heroSource, /Ver clase gratuita/);
    assert.doesNotMatch(heroSource, /mi-camino-demo/);
  });

  it("bienvenida + logo centrados; sale al scroll hacia Academia", () => {
    assert.doesNotMatch(heroSource, /heroExitOpacity/);
    assert.match(heroSource, /160vh/);
    assert.match(heroSource, /Una academia online para aprender música paso a paso/);
    assert.match(heroSource, /BrandLogo/);
    assert.doesNotMatch(heroSource, /Estás a un paso/);
  });

  it("no usa Three.js ni video", () => {
    assert.equal(heroSource.includes("three"), false);
    assert.equal(heroSource.includes("@react-three"), false);
    assert.equal(heroSource.includes("<video"), false);
  });

  it("usa scroll nativo + useTransform (tracking fiable con sticky)", () => {
    assert.match(heroSource, /readScrollProgress/);
    assert.match(heroSource, /scrollYProgress\.set/);
    assert.match(heroSource, /useTransform/);
    assert.doesNotMatch(heroSource, /\buseScroll\s*\(/);
  });

  it("respeta prefers-reduced-motion", () => {
    assert.match(heroSource, /prefers-reduced-motion: reduce/);
  });

  it("hero sin fotos ni canvas — fondo atmosférico + scroll de marca", () => {
    assert.doesNotMatch(heroSource, /ctx\.drawImage/);
    assert.doesNotMatch(heroSource, /facade/);
    assert.doesNotMatch(heroSource, /interior\.png/);
    assert.doesNotMatch(heroSource, /<img/);
    assert.match(heroSource, /HeroAtmosphere/);
    assert.match(heroSource, /BrandLogo/);
  });
});
