import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { adminModuleStatusLabel, isLegacyPublishedModule } from "./admin-legacy-badge";

describe("T-FLOW-03 — badge Publicado legacy (D-GOV-17 Opción B)", () => {
  it("publicado 5/5 ⇒ Publicado (no legacy)", () => {
    const input = { published: true, completeSlots: 5, totalSlots: 5 };
    assert.equal(isLegacyPublishedModule(input), false);
    assert.equal(adminModuleStatusLabel(input), "Publicado");
  });

  it("seed B1 publicado 3/5 ⇒ Publicado legacy", () => {
    const input = { published: true, completeSlots: 3, totalSlots: 5 };
    assert.equal(isLegacyPublishedModule(input), true);
    assert.equal(adminModuleStatusLabel(input), "Publicado legacy");
  });

  it("seed B2 publicado 2/5 ⇒ Publicado legacy", () => {
    assert.equal(
      adminModuleStatusLabel({ published: true, completeSlots: 2, totalSlots: 5 }),
      "Publicado legacy"
    );
  });

  it("borrador nunca es legacy", () => {
    const input = { published: false, completeSlots: 3, totalSlots: 5 };
    assert.equal(isLegacyPublishedModule(input), false);
    assert.equal(adminModuleStatusLabel(input), "Borrador");
  });

  it("AdminPage cablea el label centralizado", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(path.join(here, "../../pages/AdminPage.tsx"), "utf8");
    assert.match(source, /adminModuleStatusLabel/);
  });
});
