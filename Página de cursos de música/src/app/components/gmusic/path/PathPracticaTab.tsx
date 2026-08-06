import type { ReactNode } from "react";
import { Button } from "../../ui/button";
import { LessonYousicianGate } from "../lesson/LessonYousicianGate";
import { PathLessonRunner } from "./PathLessonRunner";
import { canStartLessonFromNode } from "./path-lesson-start";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import type { LessonSessionResponse } from "../../../services/gmusic-api/types";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface PathPracticaTabProps {
  activeRunner: {
    session: LessonSessionResponse;
    nodeTitle: string;
    nodeId: string;
    videoUrl: string | null;
    nodeDuration?: string;
    lessonNode: PathNodeData;
  } | null;
  activeNode: PathNodeData | null;
  onStartActiveNode: () => void;
  onExitPractice: () => void;
  onSessionCompleted: () => void;
  loadingNodeId: string | null;
}

function PathPracticaIdle({
  activeNode,
  onStartActiveNode,
  loadingNodeId,
}: {
  activeNode: PathNodeData | null;
  onStartActiveNode: () => void;
  loadingNodeId: string | null;
}) {
  const canStart = activeNode ? canStartLessonFromNode(activeNode) : false;
  const isLoading = activeNode ? loadingNodeId === activeNode.id : false;

  return (
    <div
      className="rounded-lg border px-6 py-10 text-center space-y-4"
      style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
    >
      <h2 className="text-lg font-medium" style={{ color: GM_TEXT }}>
        Práctica guiada
      </h2>
      <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: GM_TEXT_SEC }}>
        Los ejercicios evaluados llegan en una sesión autenticada. Inicia desde la etapa activa
        en Tarjetas o usa el botón de abajo.
      </p>
      {canStart && activeNode ? (
        <Button
          type="button"
          disabled={isLoading}
          onClick={onStartActiveNode}
          className="min-h-[48px] w-full max-w-sm mx-auto font-medium tracking-wide"
          style={{ background: GM_GOLD, color: "#0A0A0A" }}
        >
          {isLoading ? "Abriendo sesión…" : `Practicar: ${activeNode.title}`}
        </Button>
      ) : (
        <p className="text-xs" style={{ color: GM_TEXT_SEC }}>
          Completa las etapas anteriores para desbloquear la práctica.
        </p>
      )}
    </div>
  );
}

export function PathPracticaTab({
  activeRunner,
  activeNode,
  onStartActiveNode,
  onExitPractice,
  onSessionCompleted,
  loadingNodeId,
}: PathPracticaTabProps) {
  let content: ReactNode;

  if (activeRunner) {
    content = (
      <PathLessonRunner
        key={activeRunner.session.sessionId}
        variant="embedded"
        session={activeRunner.session}
        nodeTitle={activeRunner.nodeTitle}
        lessonNode={activeRunner.lessonNode}
        videoUrl={activeRunner.videoUrl}
        nodeDuration={activeRunner.nodeDuration}
        onExit={onExitPractice}
        onSessionCompleted={onSessionCompleted}
      />
    );
  } else {
    content = (
      <PathPracticaIdle
        activeNode={activeNode}
        onStartActiveNode={onStartActiveNode}
        loadingNodeId={loadingNodeId}
      />
    );
  }

  return (
    <div className="w-full min-w-0 space-y-6">
      <LessonYousicianGate />
      {content}
    </div>
  );
}
