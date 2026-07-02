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
const mainSource = readFileSync(join(root, "../../../../main.tsx"), "utf8");

describe("D-022B2 — stage Canva structure (prototype)", () => {
  it("GmusicPath activa visualVariant stage sin fullBleed", () => {
    assert.match(gmusicPathSource, /visualVariant="stage"/);
    assert.match(gmusicPathSource, /path-scene/);
    assert.match(gmusicPathSource, /layout="strip"/);
    assert.match(gmusicPathSource, /Tramo actual/);
    assert.match(gmusicPathSource, /Paso \$\{focusedIdx \+ 1\} de \$\{nodes\.length\}/);
    assert.doesNotMatch(gmusicPathSource, /fullBleed/);
    assert.doesNotMatch(gmusicPathSource, /visualVariant="premium"/);
  });

  it("DemoPathCards activa visualVariant stage — paridad visual D-GOV-07", () => {
    assert.match(demoPathCardsSource, /visualVariant="stage"/);
  });

  it("PathCarouselCards expone preset stage aislado", () => {
    assert.match(carouselSource, /visualVariant\?: "default" \| "stage"/);
    assert.match(carouselSource, /path-carousel--stage/);
    assert.match(carouselSource, /path-carousel--stage-fit/);
    assert.match(carouselSource, /stageDesktopFit/);
    assert.match(carouselSource, /shouldStageContainerFit/);
    assert.match(carouselSource, /ResizeObserver/);
    assert.match(carouselSource, /path-carousel__connector/);
    assert.match(carouselSource, /path-carousel__edge-spacer/);
    assert.match(carouselSource, /pathCarouselStageCtaButtonStyle/);
    assert.match(carouselSource, /prefers-reduced-motion/);
    assert.doesNotMatch(carouselSource, /min-width: 1024px/);
  });

  it("helpers stage en path-carousel-styles", () => {
    assert.match(stylesSource, /pathCarouselStageCardBorder/);
    assert.match(stylesSource, /pathCarouselStageSideOpacity/);
  });

  it("CSS stage importado desde main, no en componente", () => {
    assert.match(mainSource, /path-carousel-stage\.css/);
    assert.doesNotMatch(carouselSource, /path-carousel-stage\.css/);
  });

  it("no altera buildSubscriberPathCardModels ni locks", () => {
    assert.doesNotMatch(carouselSource, /buildSubscriberPathCardModels/);
    assert.doesNotMatch(carouselSource, /canStartLessonFromNode/);
    assert.match(gmusicPathSource, /buildSubscriberPathCardModels/);
  });
});
