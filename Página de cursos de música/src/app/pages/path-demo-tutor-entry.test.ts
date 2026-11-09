import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pathDemo = readFileSync(join(here, "PathDemoPage.tsx"), "utf8");

describe("PathDemoPage — entrada tutor (Paso 7)", () => {
  it("expone TutorEntryLink hacia page tutor", () => {
    assert.match(pathDemo, /TutorEntryLink/);
    assert.match(pathDemo, /setPage\("tutor"\)/);
  });
});
