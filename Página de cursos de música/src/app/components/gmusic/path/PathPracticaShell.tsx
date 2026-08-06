import { useEffect, type ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock";
import { GM_BORDER, GM_GOLD_MATT, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";
import { PathPracticaLayoutProvider } from "./path-practica-layout";

export interface PathPracticaShellProps {
  completedCount: number;
  totalExercises: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  children: ReactNode;
}

function PracticaToolbar({
  completedCount,
  totalExercises,
  isFullscreen,
  onToggleFullscreen,
  immersive = false,
}: {
  completedCount: number;
  totalExercises: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  immersive?: boolean;
}) {
  const progressRatio =
    totalExercises > 0 ? Math.min(1, completedCount / totalExercises) : 0;

  if (immersive) {
    return (
      <div className="path-practica-immersive-hud pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
        <div className="pointer-events-auto">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
            style={{ color: GM_TEXT }}
            aria-label="Salir de pantalla completa"
            aria-pressed={isFullscreen}
          >
            <Minimize2 className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div
          className="pointer-events-auto flex min-w-[9rem] max-w-[12rem] flex-1 items-center gap-3 rounded-full px-4 py-2"
          style={{ background: "rgba(255, 255, 255, 0.12)" }}
          aria-live="polite"
          aria-atomic="true"
        >
          <div
            className="h-2 flex-1 overflow-hidden rounded-full"
            style={{ background: "rgba(255, 255, 255, 0.18)" }}
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={totalExercises}
            aria-label="Progreso de la práctica"
          >
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${progressRatio * 100}%`,
                background: "rgba(255, 255, 255, 0.92)",
              }}
            />
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: GM_TEXT }}>
            {completedCount}/{totalExercises}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex shrink-0 items-center justify-end gap-2 border-b px-4 py-3"
      style={{ borderColor: GM_BORDER }}
    >
      <span
        className="text-sm font-semibold tabular-nums tracking-wide"
        style={{ color: GM_TEXT }}
        aria-live="polite"
        aria-atomic="true"
      >
        {completedCount} de {totalExercises}
      </span>
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition-colors hover:bg-white/[0.04]"
        style={{ borderColor: GM_BORDER, color: GM_TEXT_SEC }}
        aria-label="Pantalla completa"
        aria-pressed={isFullscreen}
      >
        <Maximize2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function PathPracticaShell({
  completedCount,
  totalExercises,
  isFullscreen,
  onToggleFullscreen,
  children,
}: PathPracticaShellProps) {
  useBodyScrollLock(isFullscreen);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onToggleFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  if (isFullscreen) {
    return (
      <div
        className="path-practica-immersive-stage fixed inset-0 z-[100] flex flex-col overflow-hidden"
        style={{ background: "#0a0908", color: GM_TEXT }}
        role="dialog"
        aria-modal="true"
        aria-label="Práctica a pantalla completa"
      >
        <PracticaToolbar
          completedCount={completedCount}
          totalExercises={totalExercises}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          immersive
        />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <PathPracticaLayoutProvider mode="immersive">{children}</PathPracticaLayoutProvider>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-w-0">
      <div
        className="relative w-full overflow-hidden rounded-2xl border"
        style={{ borderColor: GM_GOLD_MATT, background: GM_SURFACE }}
      >
        <PracticaToolbar
          completedCount={completedCount}
          totalExercises={totalExercises}
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
        <div className="px-4 py-5 md:px-6 md:py-6">
          <PathPracticaLayoutProvider mode="inline">{children}</PathPracticaLayoutProvider>
        </div>
      </div>
    </div>
  );
}
