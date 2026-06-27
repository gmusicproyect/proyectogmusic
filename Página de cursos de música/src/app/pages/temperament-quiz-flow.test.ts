import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));
const quizSource = readFileSync(join(root, "TemperamentQuizPage.tsx"), "utf8");

describe("TemperamentQuizPage — post-quiz (legacy file alias)", () => {
  it("redirige a onboarding-academia", () => {
    assert.match(quizSource, /setPage\("onboarding-academia"\)/);
  });
});
