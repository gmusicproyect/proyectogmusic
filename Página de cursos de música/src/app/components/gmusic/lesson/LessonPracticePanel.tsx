import type { ReactNode } from "react";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface LessonPracticePanelProps {
  title: string;
  prompt?: string | null;
  visualPoints?: number;
  visualCombo?: number;
  showScore?: boolean;
  hideTitle?: boolean;
  className?: string;
  footLabel?: string | null;
  children: ReactNode;
}

export function LessonPracticePanel({
  title,
  prompt,
  visualPoints = 0,
  visualCombo = 0,
  showScore = true,
  hideTitle = false,
  className = "",
  footLabel,
  children,
}: LessonPracticePanelProps) {
  return (
    <div
      className={`lesson-practice-panel rounded-2xl border px-5 py-5 md:px-6 md:py-6 space-y-5 ${className}`.trim()}
      style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          {!hideTitle ? (
            <h2 className="text-lg font-bold leading-snug" style={{ color: GM_TEXT }}>
              {title}
            </h2>
          ) : null}
          {prompt ? (
            <p className="text-sm leading-relaxed" style={{ color: GM_TEXT_SEC }}>
              {prompt}
            </p>
          ) : null}
        </div>

        {showScore ? (
          <div className="flex shrink-0 gap-5 text-right">
            <div>
              <div className="text-xl font-extrabold tabular-nums" style={{ color: GM_GOLD }}>
                {visualPoints}
              </div>
              <div
                className="mt-0.5 max-w-[7.5rem] text-[11px] leading-snug"
                style={{ color: GM_TEXT_SEC }}
              >
                Puntos · feedback visual
              </div>
            </div>
            <div>
              <div className="text-xl font-extrabold tabular-nums" style={{ color: "#4ADE80" }}>
                {visualCombo}
              </div>
              <div
                className="mt-0.5 max-w-[7.5rem] text-[11px] leading-snug"
                style={{ color: GM_TEXT_SEC }}
              >
                Combo · feedback visual
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col items-start justify-start gap-4">{children}</div>

      {footLabel ? (
        <div
          className="flex items-center justify-between gap-3 border-t pt-4"
          style={{ borderColor: GM_BORDER }}
        >
          <p className="text-[11px]" style={{ color: GM_TEXT_SEC }}>
            {footLabel}
          </p>
        </div>
      ) : null}
    </div>
  );
}
