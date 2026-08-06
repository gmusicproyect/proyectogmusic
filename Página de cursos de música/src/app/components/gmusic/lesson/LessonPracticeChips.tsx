import { Lock, Play } from "lucide-react";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export type LessonPracticeChipState = "done" | "current" | "locked";

export interface LessonPracticeChipItem {
  label: string;
  state: LessonPracticeChipState;
}

export interface LessonPracticeChipsProps {
  items: LessonPracticeChipItem[];
}

function chipIcon(state: LessonPracticeChipState) {
  if (state === "done") return "✓";
  if (state === "current") return <Play className="h-3 w-3 shrink-0" aria-hidden="true" />;
  return <Lock className="h-3 w-3 shrink-0 opacity-60" aria-hidden="true" />;
}

export function buildLessonPracticeChipItems(
  total: number,
  currentIndex: number,
  finished = false
): LessonPracticeChipItem[] {
  if (total <= 0) return [];

  return Array.from({ length: total }, (_, index) => {
    let state: LessonPracticeChipState = "locked";
    if (finished || index < currentIndex) {
      state = "done";
    } else if (index === currentIndex) {
      state = "current";
    }

    return {
      label: `Ejercicio ${index + 1}`,
      state,
    };
  });
}

export function LessonPracticeChips({ items }: LessonPracticeChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3" role="list" aria-label="Progreso de ejercicios">
      {items.map((item) => {
        const isCurrent = item.state === "current";
        const isDone = item.state === "done";
        const isLocked = item.state === "locked";

        return (
          <div
            key={item.label}
            role="listitem"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
            style={{
              borderColor: isCurrent ? "rgba(201, 168, 76, 0.35)" : GM_BORDER,
              background: isCurrent ? "rgba(201, 168, 76, 0.08)" : GM_SURFACE,
              color: isCurrent ? GM_GOLD : isDone ? GM_TEXT_SEC : GM_TEXT_SEC,
              opacity: isLocked ? 0.6 : 1,
            }}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span
              className="inline-flex items-center justify-center text-[11px]"
              style={{ color: isDone ? "#4ADE80" : undefined }}
              aria-hidden="true"
            >
              {chipIcon(item.state)}
            </span>
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
