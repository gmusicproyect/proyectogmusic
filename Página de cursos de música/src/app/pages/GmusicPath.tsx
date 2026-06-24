import { useState, useCallback, useEffect } from "react";
import { GmusicInternalHeader, isLockedNav, LOCKED_NAV_MODAL } from "../components/gmusic/GmusicInternalHeader";
import { GmusicPlaceholderModal } from "../components/gmusic/GmusicPlaceholderModal";
import { DashboardErrorBanner } from "../components/gmusic/dashboard";
import { PathPageIntro } from "../components/gmusic/path/PathPageIntro";
import { SerpentinePathMap } from "../components/gmusic/path/SerpentinePathMap";
import { ActiveNodePanel } from "../components/gmusic/path/ActiveNodePanel";
import { CompletedPathPanel } from "../components/gmusic/path/CompletedPathPanel";
import { PathLessonRunner } from "../components/gmusic/path/PathLessonRunner";
import {
  canStartLessonFromNode,
} from "../components/gmusic/path/path-lesson-start";
import {
  resolveLessonSessionForPanel,
} from "../components/gmusic/path/path-lesson-panel-session";
import { GM_BG, GM_TEXT, GM_TEXT_SEC } from "../components/gmusic/tokens";
import { usePath } from "../hooks/usePath";
import { useStartLessonSession } from "../hooks/useStartLessonSession";
import { findPathNodeById } from "../services/gmusic-api/map-path";
import type { PathNodeData } from "../data/gmusic-path-types";
import type { LessonSessionResponse } from "../services/gmusic-api/types";
import { derivePathHeaderIdentity } from "../utils/student-zone-identity";

interface ActivePathRunner {
  session: LessonSessionResponse;
  nodeTitle: string;
  nodeId: string;
}

interface GmusicPathProps {
  setPage: (page: string) => void;
}

type ModalKind = "leveling" | "locked" | null;

function panelEyebrow(node: PathNodeData | null): string {
  if (!node) return "Próxima práctica";
  if (node.status === "available") return "Paso desbloqueado";
  return "Próxima práctica";
}

export function GmusicPath({ setPage }: GmusicPathProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [activeRunner, setActiveRunner] = useState<ActivePathRunner | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const path = usePath();
  const lessonSession = useStartLessonSession();

  const viewModel = path.status === "success" ? path.viewModel : null;
  const defaultPanelNodeId = path.status === "success" ? path.viewModel.defaultPanelNodeId : null;

  useEffect(() => {
    if (path.status === "success") {
      setSelectedNodeId(path.viewModel.defaultPanelNodeId);
    }
  }, [path.status, defaultPanelNodeId]);

  const openNavPlaceholder = useCallback((key: string) => {
    if (isLockedNav(key)) setModal("locked");
  }, []);

  const handleNodeSelect = useCallback((node: PathNodeData) => {
    if (node.status === "completed" || node.status === "locked") return;
    setSelectedNodeId(node.id);
  }, []);

  const modalProps = () => {
    switch (modal) {
      case "leveling":
        return {
          title: "Próximamente — evaluación de módulo",
          subtitle: "Esta prueba estará disponible cuando activemos la validación interactiva.",
        };
      case "locked":
        return {
          title: LOCKED_NAV_MODAL.title,
          subtitle: LOCKED_NAV_MODAL.subtitle,
          footer: LOCKED_NAV_MODAL.footer,
        };
      default:
        return { title: "" };
    }
  };

  const mp = modalProps();
  const isLoading = path.status === "loading";
  const headerIdentity = derivePathHeaderIdentity(viewModel?.badge, isLoading);
  const panelNode = viewModel ? findPathNodeById(viewModel.modules, selectedNodeId) : null;
  const canStartLesson = canStartLessonFromNode(panelNode);
  const panelSession = resolveLessonSessionForPanel(lessonSession, panelNode?.id);

  useEffect(() => {
    if (lessonSession.status !== "success" || !panelNode) return;
    if (lessonSession.nodeId !== panelNode.id) return;

    setActiveRunner({
      session: lessonSession.result.session,
      nodeTitle: panelNode.title,
      nodeId: panelNode.id,
    });
  }, [lessonSession.status, lessonSession.nodeId, lessonSession.result, panelNode]);

  const handleStartLesson = useCallback(() => {
    if (!panelNode || !canStartLessonFromNode(panelNode)) return;
    lessonSession.start(panelNode.id);
  }, [panelNode, lessonSession]);

  const handleRetrySession = useCallback(() => {
    if (!panelSession.showRetry) return;
    lessonSession.retry();
  }, [panelSession.showRetry, lessonSession]);

  const handleCloseRunner = useCallback(() => {
    setActiveRunner(null);
    path.retry();
  }, [path]);

  const sharedPanelProps = {
    onStartLesson: handleStartLesson,
    isStartingLesson: panelSession.isStartingLesson,
    startLessonDisabled: !canStartLesson,
    sessionError: panelSession.sessionError,
    onRetrySession: panelSession.showRetry ? handleRetrySession : undefined,
  };

  const renderSidePanel = (compact?: boolean) => {
    if (isLoading) {
      return (
        <ActiveNodePanel
          compact={compact}
          eyebrow="Próxima práctica"
          title="Cargando lección…"
          typeLabel="Conectando con tu camino"
          description="Estamos preparando el detalle de tu próximo paso."
          isLoading
          startLessonDisabled
          onStartLesson={() => {}}
        />
      );
    }

    if (viewModel?.isComplete) {
      return <CompletedPathPanel compact={compact} />;
    }

    if (!panelNode) {
      return (
        <ActiveNodePanel
          compact={compact}
          eyebrow="Próxima práctica"
          title="Sin paso seleccionado"
          typeLabel="Selecciona un nodo desbloqueado"
          description="Elige un paso activo o desbloqueado en el mapa para ver su detalle."
          {...sharedPanelProps}
        />
      );
    }

    return (
      <ActiveNodePanel
        compact={compact}
        eyebrow={panelEyebrow(panelNode)}
        title={panelNode.title}
        typeLabel={panelNode.typeLabel ?? panelNode.type}
        description={panelNode.description ?? ""}
        {...sharedPanelProps}
      />
    );
  };

  return (
    <div className="min-h-screen" style={{ background: GM_BG, color: GM_TEXT }}>
      <GmusicInternalHeader
        activeNav="camino"
        userName={headerIdentity.userName}
        userSubtitle={headerIdentity.userSubtitle}
        setPage={setPage}
        onPlaceholder={openNavPlaceholder}
      />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 lg:py-12">
        <PathPageIntro
          badge={viewModel?.badge ?? { instrument: "…", month: "…", level: "…" }}
          completedSteps={viewModel?.completedSteps ?? 0}
          totalSteps={viewModel?.totalSteps ?? 0}
          isLoading={isLoading}
        />

        {path.status === "error" && (
          <div className="mb-6">
            <DashboardErrorBanner message={path.message} onRetry={path.retry} />
          </div>
        )}

        {path.status === "success" && viewModel?.isEmpty && (
          <div
            className="rounded-lg border px-5 py-8 text-center"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: GM_TEXT_SEC }}
          >
            <p className="text-sm leading-relaxed">
              Tu camino todavía no tiene módulos publicados. Vuelve más tarde para ver tu ruta.
            </p>
          </div>
        )}

        {path.status !== "error" && !viewModel?.isEmpty && (
          <>
            <div className="lg:hidden mb-6">{renderSidePanel(true)}</div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-7">
                {isLoading ? (
                  <div
                    className="max-w-lg mx-auto px-4 py-16 text-center text-sm"
                    style={{ color: GM_TEXT_SEC }}
                  >
                    Cargando mapa del camino…
                  </div>
                ) : (
                  <SerpentinePathMap
                    modules={viewModel?.modules ?? []}
                    activeNodeId={viewModel?.activeNodeId ?? null}
                    selectedNodeId={selectedNodeId}
                    onLevelingChallenge={() => setModal("leveling")}
                    onNodeSelect={handleNodeSelect}
                  />
                )}
              </div>

              <div className="hidden lg:block lg:col-span-5">{renderSidePanel()}</div>
            </div>
          </>
        )}
      </main>

      <GmusicPlaceholderModal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={mp.title}
        subtitle={mp.subtitle}
        footer={mp.footer}
      />

      {activeRunner && (
        <PathLessonRunner
          key={activeRunner.session.sessionId}
          session={activeRunner.session}
          nodeTitle={activeRunner.nodeTitle}
          onExit={handleCloseRunner}
          onSessionCompleted={path.retry}
        />
      )}
    </div>
  );
}
