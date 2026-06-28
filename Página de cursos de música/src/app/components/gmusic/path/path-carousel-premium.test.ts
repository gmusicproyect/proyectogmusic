import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));

const carouselSource = readFileSync(join(root, "../PathCarouselCards.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "../path-carousel-styles.ts"), "utf8");
const gmusicPathSource = readFileSync(join(root, "../../../pages/GmusicPath.tsx"), "utf8");
const demoPathCardsSource = readFileSync(join(root, "../DemoPathCards.tsx"), "utf8");

describe("D-022B — carrusel premium (prototype)", () => {
  it("GmusicPath activa visualVariant premium", () => {
    assert.match(gmusicPathSource, /visualVariant="premium"/);
    assert.match(gmusicPathSource, /Tramo actual/);
    assert.match(gmusicPathSource, /Paso \$\{focusedIdx \+ 1\} de \$\{nodes\.length\}/);
  });

  it("DemoPathCards no activa premium — demo sin cambio visual", () => {
    assert.doesNotMatch(demoPathCardsSource, /visualVariant/);
    assert.doesNotMatch(demoPathCardsSource, /premium/);
  });

  it("PathCarouselCards expone preset premium aislado", () => {
    assert.match(carouselSource, /visualVariant\?: PathCarouselVisualVariant/);
    assert.match(carouselSource, /path-carousel--premium/);
    assert.match(carouselSource, /path-carousel__connector/);
    assert.match(carouselSource, /path-carousel__edge-spacer/);
    assert.match(carouselSource, /pathCarouselPremiumCtaButtonStyle/);
    assert.match(carouselSource, /prefers-reduced-motion/);
  });

  it("helpers premium en path-carousel-styles", () => {
    assert.match(stylesSource, /pathCarouselPremiumCardBorder/);
    assert.match(stylesSource, /pathCarouselPremiumSideOpacity/);
  });

  it("no altera buildSubscriberPathCardModels ni locks", () => {
    assert.doesNotMatch(carouselSource, /buildSubscriberPathCardModels/);
    assert.doesNotMatch(carouselSource, /canStartLessonFromNode/);
    assert.match(gmusicPathSource, /buildSubscriberPathCardModels/);
  });
});
