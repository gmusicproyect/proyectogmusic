import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = dirname(fileURLToPath(import.meta.url));

const connectedSources = [
  join(root, "PathPageIntro.tsx"),
  join(root, "SerpentinePathMap.tsx"),
  join(root, "ActiveNodePanel.tsx"),
  join(root, "../../../pages/GmusicPath.tsx"),
];

const forbiddenImports = [
  "PATH_MODULES",
  "PATH_BADGE",
  "ACTIVE_NODE_ID",
  "ACTIVE_NODE_PANEL",
];

describe("componentes conectados del camino", () => {
  it("no dependen de constantes runtime del mock", () => {
    for (const file of connectedSources) {
      const source = readFileSync(file, "utf8");
      for (const symbol of forbiddenImports) {
        assert.equal(
          source.includes(symbol),
          false,
          `${file} no debe importar ${symbol}`
        );
      }
    }
  });
});
