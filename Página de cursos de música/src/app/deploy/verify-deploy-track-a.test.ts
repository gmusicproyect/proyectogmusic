import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { join } from "node:path";
import { describe, it } from "node:test";

const root = join(import.meta.dirname, "../../..");

describe("deploy:verify-config", () => {
  it("pasa verify-deploy-track-a.mjs", () => {
    const output = execSync("node scripts/verify-deploy-track-a.mjs", {
      cwd: root,
      encoding: "utf8",
    });
    assert.match(output, /verify-deploy-track-a: OK/);
  });
});
