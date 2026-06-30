import type { ReactNode } from "react";
import { Guitar } from "lucide-react";
import { PremiumCard } from "../dashboard/PremiumCard";
import { STUDIO_PANEL_SHELL_STYLE } from "../dashboard/studio-panel-shell";
import { GM_TEXT, GM_TEXT_SEC, GM_GOLD, GM_GOLD_MATT, GM_BORDER } from "../tokens";
import type { PathBadgeData } from "../../../data/gmusic-path-types";

export interface PathPageIntroProps {
  badge: PathBadgeData;
  completedSteps: number;
  totalSteps: number;
  isLoading?: boolean;
  /** Override heading (e.g. demo welcome panel) */
  title?: string;
  /** Override body copy */
  description?: string;
  /** Tighter spacing when nested in a sidebar */
  compact?: boolean;
  /** Rail de progreso integrado (DemoPathLevelBar) — suscriptor D-022A */
  progressRail?: ReactNode;
  /** panel = tarjeta premium; strip = hero Canva centrado (D-022B2) */
  layout?: "panel" | "strip";
}

export function PathPageIntro({
  badge,
  completedSteps,
  totalSteps,
  isLoading = false,
  title = "Mi Camino",
  description = "Tu ruta de guitarra, paso a paso. Cada módulo construye técnica, oído y continuidad en la práctica.",
  compact = false,
  progressRail,
  layout = "panel",
}: PathPageIntroProps) {
  const isStrip = layout === "strip";
  const isStudio = !compact && !isStrip;

  if (isStrip) {
    const percent =
      totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

    return (
      <div className="path-scene-intro path-scene-intro--canva w-full text-center">
        <p className="path-scene-intro__eyebrow">
          RUTA DE GUITARRA · {badge.level} · {badge.month}
        </p>
        <h1 className="path-scene-intro__title">Mi Camino</h1>
        <p className="path-scene-intro__subtitle">
          Avanza paso a paso por tu entrenamiento de guitarra
        </p>
        <div className="path-scene-intro__progress-bar">
          <div className="path-scene-intro__progress-meta">
            <span className="path-scene-intro__progress-count">
              {isLoading
                ? "Cargando progreso…"
                : `${completedSteps} de ${totalSteps} etapas completadas`}
            </span>
            {!isLoading && (
              <span className="path-scene-intro__progress-percent">{percent}%</span>
            )}
          </div>
          <div
            className="path-scene-intro__progress-track"
            role="progressbar"
            aria-valuenow={completedSteps}
            aria-valuemin={0}
            aria-valuemax={totalSteps}
          >
            <div
              className="path-scene-intro__progress-fill"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <p
        className={
          isStudio
            ? "mb-2.5 text-[10px] font-bold uppercase tracking-[0.22em]"
            : "text-[11px] font-medium tracking-[0.2em] uppercase mb-3"
        }
        style={{ color: isStudio ? "rgba(201, 168, 76, 0.72)" : "rgba(212, 175, 55, 0.55)" }}
      >
        Ruta de guitarra · {badge.level}
      </p>
      <h1
        className={`${
          compact
            ? "text-xl md:text-2xl"
            : "text-2xl md:text-[32px] lg:text-[34px]"
        } font-semibold mb-1 tracking-tight leading-tight`}
        style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h1>
      <p
        className={`${
          compact
            ? "text-sm md:text-base"
            : "text-sm md:text-base lg:text-[17px]"
        } mb-2 max-w-xl leading-snug ${isStudio ? "mx-auto" : ""}`}
        style={{ color: GM_TEXT_SEC }}
      >
        {description}
      </p>
      <div
        className={`flex flex-wrap items-center gap-3 ${isStudio ? "justify-center" : ""}`}
      >
        <div
          className="inline-flex items-center gap-2 rounded px-3 py-1.5 text-xs border"
          style={{
            borderColor: GM_BORDER,
            color: GM_TEXT_SEC,
            background: "rgba(18, 18, 18, 0.5)",
          }}
        >
          <Guitar className="w-3.5 h-3.5 shrink-0" style={{ color: GM_GOLD }} />
          <span>{badge.instrument}</span>
          <span style={{ color: GM_GOLD_MATT }}>·</span>
          <span>{badge.month}</span>
        </div>
        {!progressRail && (
          <span className="text-xs" style={{ color: "rgba(160,160,165,0.7)" }}>
            {isLoading ? "Cargando progreso…" : `${completedSteps} de ${totalSteps} pasos completados`}
          </span>
        )}
      </div>
      {progressRail ? (
        <div className="path-intro-progress mt-5 pt-5 w-full">{progressRail}</div>
      ) : null}
    </>
  );

  if (compact) {
    return <div className="mb-0">{content}</div>;
  }

  return (
    <PremiumCard
      className="path-page-intro w-full"
      padding="24px 28px"
      style={STUDIO_PANEL_SHELL_STYLE}
    >
      <div className="text-center">{content}</div>
    </PremiumCard>
  );
}
