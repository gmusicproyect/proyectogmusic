import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const storageSource = readFileSync(
  join(import.meta.dirname, "anonymous-funnel-storage.ts"),
  "utf8"
);
const registroSource = readFileSync(
  join(import.meta.dirname, "../pages/InscripcionRegistroPage.tsx"),
  "utf8"
);
const appSource = readFileSync(join(import.meta.dirname, "../App.tsx"), "utf8");
const quizStorageSource = readFileSync(
  join(import.meta.dirname, "temperament-quiz-storage.ts"),
  "utf8"
);

describe("anonymous-funnel-storage — ciclo visitante no inscrito", () => {
  it("expone reset tras captura de lead", () => {
    assert.match(storageSource, /resetAnonymousFunnelAfterLeadCapture/);
    assert.match(storageSource, /gmusic:demo_v1/);
    assert.match(storageSource, /clearTemperamentQuizLocalStorage/);
    assert.match(storageSource, /ANONYMOUS_FUNNEL_RESET_EVENT/);
  });

  it("InscripcionRegistro reinicia funnel tras link-lead", () => {
    assert.match(registroSource, /resetAnonymousFunnelAfterLeadCapture/);
    assert.match(registroSource, /anonymousFunnelRestartPage/);
    assert.match(registroSource, /linkOnboardingLead/);
    assert.doesNotMatch(registroSource, /\.finally\(\(\) => \{\s*resetAnonymousFunnelAfterLeadCapture/s);
  });

  it("App limpia funnel local cuando hay sesión autenticada", () => {
    assert.match(appSource, /clearAnonymousFunnelLocalStorage/);
    assert.match(appSource, /publicSession\.status === "authenticated"/);
  });

  it("shouldShowTemperamentQuiz respeta alumno suscrito", () => {
    assert.match(quizStorageSource, /isSubscribedStudent/);
  });
});
