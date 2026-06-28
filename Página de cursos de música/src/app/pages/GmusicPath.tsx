import { useState, useCallback, useEffect, useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { GmusicInternalHeader, isLockedNav, LOCKED_NAV_MODAL } from "../components/gmusic/GmusicInternalHeader";
import { GmusicPlaceholderModal } from "../components/gmusic/GmusicPlaceholderModal";
import { DemoPathLevelBar } from "../components/gmusic/DemoPathLevelBar";
import { PathCarouselCards } from "../components/gmusic/PathCarouselCards";
import {
  buildSubscriberPathCardModels,
  flattenPathNodes,
  resolveCarouselActiveClass,
  resolveCarouselFocusIndex,
} from "../components/gmusic/subscriber-path-carousel";
import { DashboardErrorBanner } from "../components/gmusic/dashboard";
import { PathPageIntro } from "../components/gmusic/path/PathPageIntro";
import { CompletedPathPanel } from "../components/gmusic/path/CompletedPathPanel";
import { PathLessonRunner } from "../components/gmusic/path/PathLessonRunner";
import { canStartLessonFromNode } from "../components/gmusic/path/path-lesson-start";
import { GM_BG, GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "../components/gmusic/tokens";
import { usePath } from "../hooks/usePath";
import { useStartLessonSession } from "../hooks/useStartLessonSession";
import { findPathNodeById } from "../services/gmusic-api/map-path";
import type { LessonSessionResponse } from "../services/gmusic-api/types";
import { derivePathHeaderIdentity } from "../utils/student-zone-identity";
import { useAuth } from "../hooks/useAuth";

interface ActivePathRunner {
  session: LessonSessionResponse;
  nodeTitle: string;
  nodeId: string;
}

interface GmusicPathProps {
  setPage: (page: string) => void;
}

type ModalKind = "leveling" | "locked" | null;

export function GmusicPath({ setPage }: GmusicPathProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [activeRunner, setActiveRunner] = useState<ActivePathRunner | null>(null);
  const path = usePath();
  const lessonSession = useStartLessonSession();
  const { session } = useAuth();
  const sessionStudentName =
    session.status === "authenticated" ? session.user.name : undefined;

  const viewModel = path.status === "success" ? path.viewModel : null;
  const pathNodes = useMemo(
    () => (viewModel ? flattenPathNodes(viewModel.modules) : []),
    [viewModel]
  );
  const initialFocusIndex = useMemo(
    () => resolveCarouselFocusIndex(pathNodes, viewModel?.activeNodeId ?? null),
    [pathNodes, viewModel?.activeNodeId]
  );
  const activeClass = useMemo(
    () => resolveCarouselActiveClass(pathNodes, viewModel?.activeNodeId ?? null),
    [pathNodes, viewModel?.activeNodeId]
  );

  const openNavPlaceholder = useCallback((key: string) => {
    if (isLockedNav(key)) setModal("locked");
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
  const headerIdentity = derivePathHeaderIdentity(
    viewModel?.badge,
    isLoading,
    sessionStudentName
  );

  useEffect(() => {
    if (lessonSession.status !== "success") return;
    const node = findPathNodeById(viewModel?.modules ?? [], lessonSession.nodeId);
    if (!node) return;

    setActiveRunner({
      session: lessonSession.result.session,
      nodeTitle: node.title,
      nodeId: node.id,
    });
  }, [lessonSession, viewModel?.modules]);

  const handleStartNode = useCallback(
    (nodeId: string) => {
      const node = findPathNodeById(viewModel?.modules ?? [], nodeId);
      if (!node || !canStartLessonFromNode(node)) return;
      lessonSession.start(nodeId);
    },
    [viewModel?.modules, lessonSession]
  );

  const handleRetrySession = useCallback(() => {
    if (lessonSession.status === "error") {
      lessonSession.retry();
    }
  }, [lessonSession]);

  const handleCloseRunner = useCallback(() => {
    setActiveRunner(null);
    path.retry();
  }, [path]);

  const buildCardModels = useCallback(
    (focusedIdx: number, goTo: (idx: number) => void) =>
      buildSubscriberPathCardModels(pathNodes, focusedIdx, goTo, handleStartNode),
    [pathNodes, handleStartNode]
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: GM_BG, color: GM_TEXT }}>
      <GmusicInternalHeader
        activeNav="camino"
        userName={headerIdentity.userName}
        userSubtitle={headerIdentity.userSubtitle}
        setPage={setPage}
        onPlaceholder={openNavPlaceholder}
      />

      {!isLoading && viewModel && !viewModel.isEmpty && (
        <div
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(8,8,8,0.6)",
          }}
        >
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 py-3 md:py-4">
            <DemoPathLevelBar
              completedCount={viewModel.completedSteps}
              activeClass={activeClass}
              levelLabel={viewModel.badge.level}
              totalClasses={viewModel.totalSteps}
              variant="rail"
            />
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col w-full">
        <header className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 pt-6 md:pt-8 pb-2 md:pb-4">
          <PathPageIntro
            badge={viewModel?.badge ?? { instrument: "…", month: "…", level: "…" }}
            completedSteps={viewModel?.completedSteps ?? 0}
            totalSteps={viewModel?.totalSteps ?? 0}
            isLoading={isLoading}
          />
        </header>

        {path.status === "error" && (
          <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 mb-4">
            <DashboardErrorBanner message={path.message} onRetry={path.retry} />
          </div>
        )}

        {path.status === "success" && viewModel?.isEmpty && (
          <div
            className="max-w-[1400px] mx-auto w-full px-4 md:px-8 lg:px-12 rounded-lg border px-5 py-8 text-center"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: GM_TEXT_SEC }}
          >
            <p className="text-sm leading-relaxed">
              Tu camino todavía no tiene módulos publicados. Vuelve más tarde para ver tu ruta.
            </p>
          </div>
        )}

        {path.status === "success" && viewModel?.isComplete && (
          <div className="max-w-[600px] mx-auto w-full px-4 pb-8">
            <CompletedPathPanel />
          </div>
        )}

        {isLoading && (
          <div
            className="flex-1 flex items-center justify-center py-16 text-sm"
            style={{ color: GM_TEXT_SEC }}
          >
            Cargando mapa del camino…
          </div>
        )}

        {path.status === "success" && viewModel && !viewModel.isEmpty && !viewModel.isComplete && (
          <>
            {lessonSession.status === "error" && (
              <div className="max-w-[600px] mx-auto w-full px-4 mb-4">
                <div
                  className="rounded-lg border px-4 py-3 flex flex-col gap-2"
                  style={{
                    borderColor: "rgba(248, 113, 113, 0.25)",
                    background: "rgba(40, 18, 18, 0.55)",
                  }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: GM_TEXT_SEC }}>
                    {lessonSession.message}
                  </p>
                  <button
                    type="button"
                    onClick={handleRetrySession}
                    className="inline-flex items-center justify-center gap-1.5 self-start px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.08em] transition-colors hover:bg-[#C9A84C]/20 cursor-pointer"
                    style={{
                      color: GM_GOLD,
                      border: "1px solid rgba(201, 168, 76, 0.35)",
                      background: "rgba(201, 168, 76, 0.08)",
                    }}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            <section className="flex-1 flex flex-col justify-center w-full py-6 md:py-10 lg:py-12 min-h-[320px]">
              <PathCarouselCards
                nodes={pathNodes}
                buildCardModels={buildCardModels}
                initialFocusIndex={initialFocusIndex}
                fullBleed
                hintText="Desliza tu camino · completa cada paso para avanzar"
                buildFooterText={(focusedIdx, nodes) =>
                  nodes.length <= 12
                    ? null
                    : `Paso ${focusedIdx + 1} de ${nodes.length}`
                }
                useDotFooter={pathNodes.length <= 12}
              />
            </section>
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
