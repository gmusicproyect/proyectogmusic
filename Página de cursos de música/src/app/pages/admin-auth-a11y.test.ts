import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

describe("E3/E4 — a11y auth admin + perf carrusel", () => {
  it("mensajes del login embebido admin anuncian con role", () => {
    const source = readFileSync(path.join(here, "AdminPage.tsx"), "utf8");
    assert.match(source, /role="alert"[^>]*>\{loginError\}/s);
    assert.match(source, /role="status"[^>]*>\{loginSuccess\}/s);
  });

  it("carrusel memoiza card models con goTo estable", () => {
    const source = readFileSync(
      path.join(here, "../components/gmusic/PathCarouselCards.tsx"),
      "utf8"
    );
    assert.match(source, /const goTo = useCallback\(/);
    assert.match(source, /const cardModels = useMemo\(/);
  });
});
