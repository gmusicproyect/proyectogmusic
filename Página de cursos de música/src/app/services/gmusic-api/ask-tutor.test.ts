import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

describe("ask-tutor client (Paso 5b)", () => {
  it("apunta a POST /tutor/ask vía api base", () => {
    const source = readFileSync(join(here, "ask-tutor.ts"), "utf8");
    assert.match(source, /\/tutor\/ask/);
    assert.match(source, /apiPost/);
  });

  it("TutorAskPage está montada en App para page tutor", () => {
    const app = readFileSync(join(here, "../../App.tsx"), "utf8");
    assert.match(app, /TutorAskPage/);
    assert.match(app, /currentPage === "tutor"/);
  });
});
