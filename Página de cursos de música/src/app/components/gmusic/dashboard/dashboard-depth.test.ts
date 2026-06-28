import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const dashboardRoot = dirname(fileURLToPath(import.meta.url));

const chunkyButtonSource = readFileSync(join(dashboardRoot, "ChunkyButton.tsx"), "utf8");
const premiumCardSource = readFileSync(join(dashboardRoot, "PremiumCard.tsx"), "utf8");
const practiceCardSource = readFileSync(join(dashboardRoot, "PracticeCard.tsx"), "utf8");
const depthCssSource = readFileSync(join(dashboardRoot, "dashboard-depth.css"), "utf8");
const tokensSource = readFileSync(join(dashboardRoot, "../tokens.ts"), "utf8");

describe("ChunkyButton — premium mecánico", () => {
  it("usa variante premium por defecto y estados de accesibilidad", () => {
    assert.match(chunkyButtonSource, /variant = "premium"/);
    assert.match(chunkyButtonSource, /disabled={isDisabled}/);
    assert.match(chunkyButtonSource, /const isDisabled = disabled \|\| isLoading/);
    assert.match(chunkyButtonSource, /aria-busy={isLoading/);
    assert.match(chunkyButtonSource, /chunky-btn__spinner/);
    assert.match(chunkyButtonSource, /Cargando\.\.\./);
  });

  it("delega la física del pedal al CSS de profundidad", () => {
    assert.match(chunkyButtonSource, /dashboard-depth\.css/);
    assert.match(depthCssSource, /translateY\(3px\)/);
    assert.match(depthCssSource, /var\(--btn-premium-transition\)/);
    assert.match(depthCssSource, /prefers-reduced-motion/);
    assert.match(depthCssSource, /var\(--btn-premium-shadow-rest\)/);
    assert.match(depthCssSource, /var\(--btn-premium-shadow-active\)/);
  });
});

describe("PremiumCard — elevación tokenizada", () => {
  it("expone elevation rest | raised", () => {
    assert.match(premiumCardSource, /elevation\?: PremiumCardElevation/);
    assert.match(premiumCardSource, /DASH_TOKENS/);
  });

  it("PracticeCard usa shell alineado al hero (D-021B1)", () => {
    assert.match(practiceCardSource, /STUDIO_PANEL_SHELL_STYLE/);
    assert.doesNotMatch(practiceCardSource, /elevation="raised"/);
  });
});

describe("DASH_TOKENS — espejo CSS", () => {
  it("mapea variables de elevación y botón premium", () => {
    assert.match(tokensSource, /export const DASH_TOKENS/);
    assert.match(tokensSource, /surface1: "var\(--dash-surface-1\)"/);
    assert.match(tokensSource, /btnPremiumShadowRest: "var\(--btn-premium-shadow-rest\)"/);
    assert.match(tokensSource, /export const GM_BG/);
  });
});
