import assert from "node:assert/strict";
import {
  CLASE_GRATUITA_MAP_PAGE,
  claseGratuitaLessonPage,
  pageFromClaseGratuitaPathname,
  parseClaseGratuitaLessonPage,
  pathnameForClaseGratuitaLesson,
} from "./clase-gratuita-routing";
import { describe, it } from "node:test";

describe("clase-gratuita-routing", () => {
  it("resuelve mapa y lecciones 1..5", () => {
    assert.equal(pageFromClaseGratuitaPathname("/clase-gratuita"), CLASE_GRATUITA_MAP_PAGE);
    for (let n = 1; n <= 5; n += 1) {
      assert.equal(pageFromClaseGratuitaPathname(pathnameForClaseGratuitaLesson(n)), claseGratuitaLessonPage(n));
      assert.equal(parseClaseGratuitaLessonPage(claseGratuitaLessonPage(n)), n);
    }
  });
});
