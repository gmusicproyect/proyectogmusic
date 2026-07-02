import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEMO_CAROUSEL_LESSON_COUNT,
  DEMO_FREE_LESSON_COUNT,
  DEMO_PATH_TOTAL_LESSONS,
  DEMO_ACADEMY_MORE_COUNT,
  getAllDemoPathEntries,
  getCarouselDemoPathEntries,
  isFreeDemoLesson,
  isSubscriptionLockedLesson,
  isTeaserLockedLesson,
} from "./demo-path-catalog";

describe("demo-path-catalog", () => {
  it("expone 75 lecciones en el catálogo completo", () => {
    assert.equal(getAllDemoPathEntries().length, DEMO_PATH_TOTAL_LESSONS);
    assert.equal(DEMO_PATH_TOTAL_LESSONS, 75);
  });

  it("el carrusel demo muestra 15 lecciones (5 gratis + 10 teaser)", () => {
    assert.equal(getCarouselDemoPathEntries().length, DEMO_CAROUSEL_LESSON_COUNT);
    assert.equal(DEMO_CAROUSEL_LESSON_COUNT, 15);
    assert.equal(DEMO_ACADEMY_MORE_COUNT, 60);
  });

  it("solo las primeras 5 son gratuitas con contenido real", () => {
    const entries = getAllDemoPathEntries();
    const free = entries.filter((e) => e.isFree);
    assert.equal(free.length, DEMO_FREE_LESSON_COUNT);
    assert.equal(free.every((e) => e.lesson != null), true);
    assert.equal(entries[5]?.isFree, false);
    assert.equal(isFreeDemoLesson(1), true);
    assert.equal(isFreeDemoLesson(5), true);
    assert.equal(isTeaserLockedLesson(6), true);
    assert.equal(isTeaserLockedLesson(15), true);
    assert.equal(isTeaserLockedLesson(16), false);
    assert.equal(isSubscriptionLockedLesson(6), true);
    assert.equal(isSubscriptionLockedLesson(75), true);
  });

  it("títulos teaser del módulo Fundamento son coherentes (6–15)", () => {
    const teaser = getCarouselDemoPathEntries().slice(5);
    assert.equal(teaser.length, 10);
    assert.equal(teaser[0]?.title, "Clase 6 · Tu primer acorde");
    assert.equal(teaser[9]?.title, "Clase 15 · 🏆 El gran momento");
    assert.equal(teaser.every((e) => e.moduleName === "Fundamento"), true);
  });
});
