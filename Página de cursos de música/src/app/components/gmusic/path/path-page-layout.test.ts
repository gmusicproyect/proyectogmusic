import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const pathRoot = dirname(fileURLToPath(import.meta.url));
const gmusicPathSource = readFileSync(join(pathRoot, "../../../pages/GmusicPath.tsx"), "utf8");
const pathPageIntroSource = readFileSync(join(pathRoot, "PathPageIntro.tsx"), "utf8");
const pathShellSource = readFileSync(join(pathRoot, "PathShell.tsx"), "utf8");
const pathDemoSource = readFileSync(join(pathRoot, "../../../pages/PathDemoPage.tsx"), "utf8");
const levelBarSource = readFileSync(join(pathRoot, "../DemoPathLevelBar.tsx"), "utf8");

describe("D-022A — Mi Camino shell y layout", () => {
  it("GmusicPath usa atmósfera de estudio y shell centrado", () => {
    assert.match(gmusicPathSource, /StudioAtmosphere/);
    assert.match(gmusicPathSource, /PathShell/);
    assert.match(gmusicPathSource, /path-intro-stack/);
    assert.doesNotMatch(gmusicPathSource, /style=\{\{ background: GM_BG/);
  });

  it("progreso integrado en intro — variant embedded, sin franja rail demo", () => {
    assert.match(gmusicPathSource, /progressRail=/);
    assert.match(gmusicPathSource, /DemoPathLevelBar/);
    assert.match(gmusicPathSource, /variant="embedded"/);
    assert.doesNotMatch(gmusicPathSource, /variant="rail"/);
    assert.doesNotMatch(gmusicPathSource, /borderBottom: "1px solid rgba\(255,255,255,0\.06\)"/);
  });

  it("PathPageIntro usa shell premium alineado al dashboard", () => {
    assert.match(pathPageIntroSource, /STUDIO_PANEL_SHELL_STYLE/);
    assert.match(pathPageIntroSource, /PremiumCard/);
    assert.match(pathPageIntroSource, /progressRail\?: ReactNode/);
    assert.match(pathPageIntroSource, /text-center/);
  });

  it("PathShell replica patrón dashboard-shell", () => {
    assert.match(pathShellSource, /path-shell/);
  });

  it("carrusel y sesión sin cambios de lógica", () => {
    assert.match(gmusicPathSource, /PathCarouselCards/);
    assert.match(gmusicPathSource, /buildSubscriberPathCardModels/);
    assert.match(gmusicPathSource, /PathLessonRunner/);
    assert.match(gmusicPathSource, /canStartLessonFromNode/);
    assert.match(gmusicPathSource, /visualVariant="stage"/);
    assert.match(gmusicPathSource, /path-stage/);
    assert.doesNotMatch(gmusicPathSource, /fullBleed/);
  });

  it("PathDemoPage no importa PathPageIntro ni PathShell", () => {
    assert.doesNotMatch(pathDemoSource, /PathPageIntro/);
    assert.doesNotMatch(pathDemoSource, /PathShell/);
    assert.doesNotMatch(pathDemoSource, /StudioAtmosphere/);
  });

  it("DemoPathLevelBar mantiene rail para demo y expone embedded", () => {
    assert.match(levelBarSource, /variant === "embedded"/);
    assert.match(levelBarSource, /variant === "rail"/);
    assert.match(levelBarSource, /dash-progress-track/);
    assert.match(pathDemoSource, /variant="rail"/);
    assert.doesNotMatch(pathDemoSource, /embedded/);
  });
});
