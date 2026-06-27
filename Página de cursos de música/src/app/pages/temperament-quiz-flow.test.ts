import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const quizSource = readFileSync(join(root, "TemperamentQuizPage.tsx"), "utf8");

describe("TemperamentQuizPage — post-quiz hacia Academia", () => {
  it("tras completar o saltar el quiz navega a home#academia, no al demo directo", () => {
    assert.match(quizSource, /navigateToHomeSection\(setPage, "academia"\)/);
    assert.equal(quizSource.includes('setPage("mi-camino-demo")'), false);
  });
});
