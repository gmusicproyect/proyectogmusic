import { useState, useCallback, useEffect } from "react";
import { GmusicInternalHeader, isLockedNav, LOCKED_NAV_MODAL } from "../components/gmusic/GmusicInternalHeader";
import { GmusicPlaceholderModal } from "../components/gmusic/GmusicPlaceholderModal";
import { DashboardErrorBanner } from "../components/gmusic/dashboard";
import { PathPageIntro } from "../components/gmusic/path/PathPageIntro";
import { SerpentinePathMap } from "../components/gmusic/path/SerpentinePathMap";
import { ActiveNodePanel } from "../components/gmusic/path/ActiveNodePanel";
import { CompletedPathPanel } from "../components/gmusic/path/CompletedPathPanel";
import { GM_BG, GM_TEXT, GM_TEXT_SEC } from "../components/gmusic/tokens";
import { usePath } from "../hooks/usePath";
import { findPathNodeById } from "../services/gmusic-api/map-path";
import type { PathNodeData } from "../data/gmusic-path-types";

interface GmusicPathProps {
  setPage: (page: string) => void;
}

type ModalKind = "lesson" | "leveling" | "locked" | null;

function panelEyebrow(node: PathNodeData | null): string {
  if (!node) return "Próxima práctica";
  if (node.status === "available") return "Paso desbloqueado";
  return "Próxima práctica";
}

export function GmusicPath({ setPage }: GmusicPathProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const path = usePath();

  const viewModel = path.status === "success" ? path.viewModel : null;

  useEffect(() => {
    if (path.status === "success") {
      setSelectedNodeId(path.viewModel.defaultPanelNodeId);
    }
  }, [path.status, path.viewModel?.defaultPanelNodeId]);

  const openNavPlaceholder = useCallback((key: string) => {
    if (isLockedNav(key)) setModal("locked");
  }, []);

  const handleNodeSelect = useCallback((node: PathNodeData) => {
    if (node.status === "completed" || node.status === "locked") return;
    setSelectedNodeId(node.id);
  }, []);

  const modalProps = () => {
    switch (modal) {
      case "lesson":
        return {
          title: "Próximamente — lección interactiva",
          subtitle: "Esta lección estará disponible en la siguiente fase del camino.",
        };
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
  const panelNode = viewModel ? findPathNodeById(viewModel.modules, selectedNodeId) : null;

  const renderSidePanel = (compact?: boolean) => {
    if (isLoading) {
      return (
        <ActiveNodePanel
          compact={compact}
          eyebrow="Próxima práctica"
          title="Cargando lección…"
          typeLabel="Conectando con tu camino"
          description="Estamos preparando el detalle de tu próximo paso."
          onStartLesson={() => setModal("lesson")}
          isLoading
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
          onStartLesson={() => setModal("lesson")}
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
        onStartLesson={() => setModal("lesson")}
      />
    );
  };

  return (
    <div className="min-h-screen" style={{ background: GM_BG, color: GM_TEXT }}>
      <GmusicInternalHeader
        activeNav="camino"
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
    </div>
  );
}
