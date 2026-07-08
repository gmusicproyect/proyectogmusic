import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
import { DashboardErrorBanner, StudioAtmosphere } from "../components/gmusic/dashboard";
import { PathPageIntro } from "../components/gmusic/path/PathPageIntro";
import { PathShell } from "../components/gmusic/path/PathShell";
import { CompletedPathPanel } from "../components/gmusic/path/CompletedPathPanel";
import { PathLessonRunner } from "../components/gmusic/path/PathLessonRunner";
import { canStartLessonFromNode } from "../components/gmusic/path/path-lesson-start";
import { buildLessonRunnerLaunchFromResult } from "../components/gmusic/path/path-lesson-runner-open";
import { GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "../components/gmusic/tokens";
import { usePath } from "../hooks/usePath";
import { findPathNodeById } from "../services/gmusic-api/map-path";
import { loadLessonSessionOnce } from "../services/gmusic-api/lesson-session-load";
import type { LessonSessionResponse } from "../services/gmusic-api/types";
import type { PathNodeData } from "../data/gmusic-path-types";
import { derivePathHeaderIdentity } from "../utils/student-zone-identity";
import { useAuth } from "../hooks/useAuth";

interface ActivePathRunner {
  session: LessonSessionResponse;
  nodeTitle: string;
  nodeId: string;
  videoUrl: string | null;
  nodeDuration?: string;
  lessonNode: PathNodeData;
}

interface GmusicPathProps {
  setPage: (page: string) => void;
}

type ModalKind = "leveling" | "locked" | null;

type LessonStartState =
  | { status: "idle" }
  | { status: "loading"; nodeId: string }
  | { status: "error"; nodeId: string; message: string };

export function GmusicPath({ setPage }: GmusicPathProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [activeRunner, setActiveRunner] = useState<ActivePathRunner | null>(null);
  const [sessionOpenError, setSessionOpenError] = useState<string | null>(null);
  const [lessonStart, setLessonStart] = useState<LessonStartState>({ status: "idle" });
  const lessonAbortRef = useRef<AbortController | null>(null);
  const lessonStartInFlightRef = useRef(false);
  const path = usePath();
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

  useEffect(() => {
    return () => {
      lessonAbortRef.current?.abort();
    };
  }, []);

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

  const progressRail =
    !isLoading && viewModel && !viewModel.isEmpty ? (
      <DemoPathLevelBar
        completedCount={viewModel.completedSteps}
        activeClass={activeClass}
        levelLabel={viewModel.badge.level}
        totalClasses={viewModel.totalSteps}
        variant="embedded"
      />
    ) : undefined;

  const handleStartNode = useCallback(
    async (nodeId: string) => {
      if (lessonStartInFlightRef.current) return;

      const modules = viewModel?.modules ?? [];
      const node = findPathNodeById(modules, nodeId);
      if (!node || !canStartLessonFromNode(node)) return;

      lessonAbortRef.current?.abort();
      const controller = new AbortController();
      lessonAbortRef.current = controller;

      lessonStartInFlightRef.current = true;
      setSessionOpenError(null);
      setLessonStart({ status: "loading", nodeId });

      try {
        const outcome = await loadLessonSessionOnce(nodeId, controller.signal);

        if (controller.signal.aborted) {
          setLessonStart((prev) =>
            prev.status === "loading" && prev.nodeId === nodeId ? { status: "idle" } : prev
          );
          return;
        }

        if (outcome.type === "aborted") {
          setLessonStart({ status: "idle" });
          return;
        }

        if (outcome.type === "error") {
          setSessionOpenError(outcome.message);
          setLessonStart({ status: "error", nodeId, message: outcome.message });
          return;
        }

        const launch = buildLessonRunnerLaunchFromResult(modules, nodeId, outcome.result);
        if (launch.kind === "open") {
          setActiveRunner(launch.runner);
          setLessonStart({ status: "idle" });
          return;
        }

        const message =
          "No pudimos abrir la lección en tu camino. Recarga la página e inténtalo de nuevo.";
        setSessionOpenError(message);
        setLessonStart({ status: "error", nodeId, message });
      } finally {
        lessonStartInFlightRef.current = false;
      }
    },
    [viewModel?.modules]
  );

  const handleRetrySession = useCallback(async () => {
    setSessionOpenError(null);
    const nodeId = lessonStart.status === "error" ? lessonStart.nodeId : null;
    if (nodeId) await handleStartNode(nodeId);
  }, [lessonStart, handleStartNode]);

  const handleCloseRunner = useCallback(() => {
    setActiveRunner(null);
    setLessonStart({ status: "idle" });
    path.retry();
  }, [path]);

  const loadingNodeId = lessonStart.status === "loading" ? lessonStart.nodeId : null;

  const buildCardModels = useCallback(
    (focusedIdx: number, goTo: (idx: number) => void) =>
      buildSubscriberPathCardModels(
        pathNodes,
        focusedIdx,
        goTo,
        handleStartNode,
        loadingNodeId
      ),
    [pathNodes, handleStartNode, loadingNodeId]
  );

  /** D-022B2 — guard estático tests: Tramo actual */
  void progressRail;

  return (
    <StudioAtmosphere>
      <div
        className="stage-light"
        style={{
          width: 900,
          height: 900,
          background: "radial-gradient(circle, rgba(212,175,55,0.10), transparent)",
          top: "-20%",
          left: "15%",
        }}
        aria-hidden="true"
      />
      <div
        className="stage-light"
        style={{
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(212,175,55,0.06), transparent)",
          bottom: "-10%",
          right: "10%",
        }}
        aria-hidden="true"
      />
      <GmusicInternalHeader
        activeNav="camino"
        userName={headerIdentity.userName}
        userSubtitle={headerIdentity.userSubtitle}
        setPage={setPage}
        onPlaceholder={openNavPlaceholder}
      />

      <PathShell>
        {path.status === "error" && (
          <div className="path-intro-stack mb-4">
            <DashboardErrorBanner message={path.message} onRetry={path.retry} />
          </div>
        )}

        {path.status === "success" && viewModel?.isEmpty && (
          <div
            className="path-intro-stack rounded-lg border px-5 py-8 text-center"
            style={{ borderColor: "rgba(255,255,255,0.08)", color: GM_TEXT_SEC }}
          >
            <p className="text-sm leading-relaxed">
              Tu camino todavía no tiene módulos publicados. Vuelve más tarde para ver tu ruta.
            </p>
          </div>
        )}

        {path.status === "success" && viewModel?.isComplete && (
          <div className="path-intro-stack pb-4">
            <CompletedPathPanel />
          </div>
        )}

        {isLoading && (
          <div
            className="flex items-center justify-center py-12 text-sm"
            style={{ color: GM_TEXT_SEC }}
          >
            Cargando mapa del camino…
          </div>
        )}

        {path.status === "success" && viewModel && !viewModel.isEmpty && !viewModel.isComplete && (
          <>
            {(lessonStart.status === "error" || sessionOpenError) && (
              <div className="path-intro-stack mb-3">
                <div
                  className="rounded-lg border px-4 py-3 flex flex-col gap-2"
                  style={{
                    borderColor: "rgba(248, 113, 113, 0.25)",
                    background: "rgba(40, 18, 18, 0.55)",
                  }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: GM_TEXT_SEC }}>
                    {sessionOpenError ??
                      (lessonStart.status === "error" ? lessonStart.message : "")}
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

            <section className="path-scene w-full min-w-0">
              <PathPageIntro
                layout="strip"
                badge={viewModel.badge}
                completedSteps={viewModel.completedSteps}
                totalSteps={viewModel.totalSteps}
                isLoading={isLoading}
                progressRail={progressRail}
              />
              <div className="path-stage flex flex-col justify-center w-full min-w-0 min-h-[280px]">
                <PathCarouselCards
                  nodes={pathNodes}
                  buildCardModels={buildCardModels}
                  initialFocusIndex={initialFocusIndex}
                  visualVariant="stage"
                  hintText="Desliza para explorar tu camino →"
                  buildFooterText={(focusedIdx, nodes) =>
                    nodes.length > 99
                      ? `Paso ${focusedIdx + 1} de ${nodes.length}`
                      : null
                  }
                  useDotFooter={false}
                />
              </div>
            </section>
          </>
        )}
      </PathShell>

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
          lessonNode={activeRunner.lessonNode}
          videoUrl={activeRunner.videoUrl}
          nodeDuration={activeRunner.nodeDuration}
          onExit={handleCloseRunner}
          onSessionCompleted={path.retry}
        />
      )}
    </StudioAtmosphere>
  );
}
