import { lessonStageLabelForSlot } from "./lesson-stage";
import { GM_GOLD, GM_TEXT_SEC } from "../tokens";

export interface LessonStageIndicatorProps {
  activeSlot: number;
}

export function LessonStageIndicator({ activeSlot }: LessonStageIndicatorProps) {
  const safeSlot = Math.max(1, Math.min(5, activeSlot));
  const stageLabel = lessonStageLabelForSlot(safeSlot);

  return (
    <div className="w-full space-y-2" aria-label={`Etapa ${safeSlot} de 5`}>
      <div className="flex items-center justify-between gap-3">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ color: "rgba(201, 168, 76, 0.75)" }}
        >
          Etapa {safeSlot} de 5
        </p>
        <p className="text-[11px] font-medium" style={{ color: GM_TEXT_SEC }}>
          {stageLabel}
        </p>
      </div>
      <div className="grid grid-cols-5 gap-1.5" role="list">
        {Array.from({ length: 5 }, (_, index) => {
          const slot = index + 1;
          const isActive = slot === safeSlot;
          const isPast = slot < safeSlot;
          return (
            <div
              key={slot}
              role="listitem"
              aria-current={isActive ? "step" : undefined}
              className="h-1.5 rounded-full transition-colors"
              style={{
                background: isActive
                  ? GM_GOLD
                  : isPast
                    ? "rgba(201, 168, 76, 0.45)"
                    : "rgba(255, 255, 255, 0.08)",
                boxShadow: isActive ? "0 0 12px rgba(201, 168, 76, 0.35)" : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
