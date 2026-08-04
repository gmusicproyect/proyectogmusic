import { useState } from "react";
import { VideoPlayerLesson } from "../../dashboard/VideoPlayerLesson";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export type LessonMaterialTabId = "video" | "tablature" | "pdf";

export interface LessonMaterialTabsProps {
  nodeTitle: string;
  nodeDescription?: string | null;
  stageLabel: string;
  durationLabel?: string | null;
  videoUrl?: string | null;
  embedUrl?: string | null;
  nativeVideoSrc?: string | null;
  videoLoading?: boolean;
  guidePdfUrl?: string | null;
  pdfLoading?: boolean;
  onVideoPlaybackComplete?: () => void;
}

const TABS: Array<{ id: LessonMaterialTabId; label: string }> = [
  { id: "video", label: "Video" },
  { id: "tablature", label: "Tablatura" },
  { id: "pdf", label: "Guía PDF" },
];

export function LessonMaterialTabs({
  nodeTitle,
  nodeDescription,
  stageLabel,
  durationLabel,
  videoUrl,
  embedUrl,
  nativeVideoSrc,
  videoLoading = false,
  guidePdfUrl,
  pdfLoading = false,
  onVideoPlaybackComplete,
}: LessonMaterialTabsProps) {
  const [activeTab, setActiveTab] = useState<LessonMaterialTabId>("video");
  const hasVideoPlayer = Boolean(embedUrl || nativeVideoSrc);

  return (
    <div className="space-y-4">
      <div
        className="flex gap-1 rounded-lg border p-1"
        role="tablist"
        aria-label="Materiales de la lección"
        style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className="min-h-[40px] flex-1 rounded-md px-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors"
              style={{
                color: isActive ? "#0A0A0A" : GM_TEXT_SEC,
                background: isActive ? GM_GOLD : "transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "video" ? (
        <div role="tabpanel" className="space-y-4">
          {videoLoading ? (
            <div
              className="rounded-lg border px-4 py-10 text-center"
              style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
            >
              <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
                Preparando el video protegido…
              </p>
            </div>
          ) : hasVideoPlayer ? (
            <VideoPlayerLesson
              title={nodeTitle}
              subtitle={nodeDescription?.trim() || "Mira la lección antes de practicar"}
              duration={durationLabel?.trim() || "Lección"}
              lessonLabel={stageLabel}
              videoUrl={embedUrl ?? undefined}
              nativeVideoSrc={nativeVideoSrc ?? undefined}
              onPlaybackComplete={onVideoPlaybackComplete}
            />
          ) : (
            <div
              className="rounded-lg border px-4 py-10 text-center"
              style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
            >
              <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
                Esta etapa aún no tiene video publicado.
              </p>
            </div>
          )}
          <div className="space-y-1">
            <h2
              className="text-xl font-medium leading-snug"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: GM_TEXT }}
            >
              {nodeTitle}
            </h2>
            {nodeDescription?.trim() ? (
              <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
                {nodeDescription.trim()}
              </p>
            ) : null}
          </div>
          {guidePdfUrl && !pdfLoading ? (
            <div
              className="rounded-lg border px-4 py-4"
              style={{ borderColor: GM_BORDER, background: "rgba(212, 175, 55, 0.06)" }}
            >
              <p className="mb-3 text-sm" style={{ color: GM_TEXT_SEC }}>
                También tienes la guía PDF de esta clase.
              </p>
              <a
                href={guidePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-md px-5 text-xs font-semibold uppercase tracking-[0.1em]"
                style={{ background: GM_GOLD, color: "#0A0A0A" }}
              >
                Ver guía PDF
              </a>
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === "tablature" ? (
        <div
          role="tabpanel"
          className="rounded-lg border px-4 py-10 text-center"
          style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
        >
          <p className="text-sm font-medium" style={{ color: GM_TEXT }}>
            Próximamente
          </p>
          <p className="mt-2 text-xs leading-relaxed" style={{ color: GM_TEXT_SEC }}>
            La tablatura interactiva estará disponible en una fase posterior.
          </p>
        </div>
      ) : null}

      {activeTab === "pdf" ? (
        <div
          role="tabpanel"
          className="rounded-lg border px-4 py-8"
          style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
        >
          {pdfLoading ? (
            <p className="text-center text-sm" style={{ color: GM_TEXT_SEC }}>
              Preparando la guía PDF…
            </p>
          ) : guidePdfUrl ? (
            <div className="space-y-4">
              <iframe
                title={`Guía PDF — ${nodeTitle}`}
                src={guidePdfUrl}
                className="h-[min(70vh,520px)] w-full rounded-md border-0 bg-white"
                style={{ border: `1px solid ${GM_BORDER}` }}
              />
              <div className="space-y-3 text-center">
                <p className="text-sm" style={{ color: GM_TEXT_SEC }}>
                  Si no se ve arriba, abre la guía en una pestaña nueva.
                </p>
                <a
                  href={guidePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-md px-5 text-xs font-semibold uppercase tracking-[0.1em]"
                  style={{ background: GM_GOLD, color: "#0A0A0A" }}
                >
                  Abrir PDF en pestaña nueva
                </a>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm" style={{ color: GM_TEXT_SEC }}>
              No hay guía PDF para esta etapa todavía.
            </p>
          )}
        </div>
      ) : null}

      {videoUrl ? null : (
        <span className="sr-only">Pestaña video sin URL configurada</span>
      )}
    </div>
  );
}
