import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  abbreviateSessionId,
  buildSessionReadyModalContent,
  canStartLessonFromNode,
} from "./path-lesson-start";
import type { LessonSessionStartResult } from "../../../services/gmusic-api/types";

const root = dirname(fileURLToPath(import.meta.url));

const gmusicPathSource = readFileSync(join(root, "../../../pages/GmusicPath.tsx"), "utf8");
const activeNodePanelSource = readFileSync(join(root, "ActiveNodePanel.tsx"), "utf8");
const sessionModalSource = readFileSync(join(root, "LessonSessionReadyModal.tsx"), "utf8");

const BASE_RESULT: LessonSessionStartResult = {
  kind: "created",
  session: {
    sessionId: "550e8400-e29b-41d4-a716-446655440010",
    nodeId: "550e8400-e29b-41d4-a716-446655440001",
    status: "STARTED",
    startedAt: "2026-06-08T15:00:00.000Z",
    expiresAt: "2026-06-08T18:00:00.000Z",
    exercises: [
      {
        id: "ex-1",
        type: "IDENTIFY_NOTE",
        difficulty: 1,
        instruction: "Identifica la nota.",
        contentPayload: {
          secureAnswer: { correctOptionId: "a" },
          options: [{ id: "a", text: "Mi" }],
        },
      },
    ],
  },
};

describe("canStartLessonFromNode", () => {
  it("permite active y available", () => {
    assert.equal(canStartLessonFromNode({ status: "active" }), true);
    assert.equal(canStartLessonFromNode({ status: "available" }), true);
  });

  it("bloquea locked y completed", () => {
    assert.equal(canStartLessonFromNode({ status: "locked" }), false);
    assert.equal(canStartLessonFromNode({ status: "completed" }), false);
    assert.equal(canStartLessonFromNode(null), false);
  });
});

describe("buildSessionReadyModalContent", () => {
  it("diferencia created y reused", () => {
    const created = buildSessionReadyModalContent(BASE_RESULT);
    assert.equal(created.title, "Sesión lista");
    assert.equal(created.subtitle, "Tu práctica está preparada.");

    const reused = buildSessionReadyModalContent({
      ...BASE_RESULT,
      kind: "reused",
    });
    assert.equal(reused.subtitle, "Retomamos tu sesión activa.");
  });

  it("resume ejercicios y sessionId sin exponer payload", () => {
    const content = buildSessionReadyModalContent(BASE_RESULT);
    const serialized = JSON.stringify(content);

    assert.equal(content.exerciseCountLabel, "1 ejercicio");
    assert.match(content.sessionIdLabel, /^550e8400…/);
    assert.equal(serialized.includes("contentPayload"), false);
    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
    assert.equal(serialized.includes("explanationAfterAnswer"), false);
    assert.equal(serialized.includes("isCorrect"), false);
    assert.equal(serialized.includes("accuracy"), false);
    assert.equal(serialized.includes("xpEarned"), false);
  });
});

describe("abbreviateSessionId", () => {
  it("abrevia ids largos", () => {
    assert.equal(
      abbreviateSessionId("550e8400-e29b-41d4-a716-446655440010"),
      "550e8400…0010"
    );
  });
});

describe("GmusicPath conectado a sesión", () => {
  it("usa useStartLessonSession y abre PathLessonRunner (D-GOV-14 Fase A)", () => {
    assert.match(gmusicPathSource, /useStartLessonSession/);
    assert.match(gmusicPathSource, /canStartLessonFromNode/);
    assert.match(gmusicPathSource, /PathLessonRunner/);
    assert.match(gmusicPathSource, /activeRunner/);
    assert.match(gmusicPathSource, /PathCarouselCards/);
    assert.equal(gmusicPathSource.includes("LessonSessionReadyModal"), false);
    assert.equal(gmusicPathSource.includes("resolveMatchingSuccessKey"), false);
    assert.equal(gmusicPathSource.includes('case "lesson"'), false);
    assert.equal(gmusicPathSource.includes("Próximamente — lección interactiva"), false);
    assert.equal(gmusicPathSource.includes('setModal("lesson")'), false);
  });
});

describe("ActiveNodePanel — inicio de sesión", () => {
  it("deshabilita el botón mientras conecta", () => {
    assert.match(activeNodePanelSource, /isStartingLesson\?: boolean/);
    assert.match(activeNodePanelSource, /Conectando…/);
    assert.match(activeNodePanelSource, /buttonDisabled/);
    assert.match(activeNodePanelSource, /disabled={buttonDisabled}/);
  });

  it("muestra error inline con reintento", () => {
    assert.match(activeNodePanelSource, /sessionError/);
    assert.match(activeNodePanelSource, /onRetrySession/);
    assert.match(activeNodePanelSource, /Reintentar/);
  });

  it("respeta startLessonDisabled", () => {
    assert.match(activeNodePanelSource, /startLessonDisabled/);
  });
});

describe("LessonSessionReadyModal — seguridad", () => {
  it("no renderiza ejercicios ni contentPayload", () => {
    assert.equal(sessionModalSource.includes("contentPayload"), false);
    assert.equal(sessionModalSource.includes("exercises"), false);
    assert.equal(sessionModalSource.includes("secureAnswer"), false);
    assert.match(sessionModalSource, /content\.exerciseCountLabel/);
    assert.match(sessionModalSource, /content\.sessionIdLabel/);
  });
});
