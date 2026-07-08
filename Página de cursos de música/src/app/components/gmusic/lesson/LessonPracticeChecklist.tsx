import { useState } from "react";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "../tokens";

export interface LessonPracticeChecklistProps {
  items: readonly string[];
}

export function LessonPracticeChecklist({ items }: LessonPracticeChecklistProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  return (
    <section
      className="rounded-lg border p-4 md:p-5"
      style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
      aria-labelledby="lesson-practice-checklist-title"
    >
      <h3
        id="lesson-practice-checklist-title"
        className="text-sm font-semibold uppercase tracking-[0.12em]"
        style={{ color: GM_GOLD }}
      >
        Tu práctica de hoy
      </h3>
      <p className="mt-1 text-xs leading-relaxed" style={{ color: GM_TEXT_SEC }}>
        Marca cada microacción cuando la completes. Este checklist es solo visual en esta fase.
      </p>
      <ul className="mt-4 space-y-3">
        {items.map((item, index) => {
          const isChecked = Boolean(checked[index]);
          return (
            <li key={index}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() =>
                    setChecked((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-[#C9A84C]"
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{
                    color: isChecked ? GM_TEXT_SEC : GM_TEXT,
                    textDecoration: isChecked ? "line-through" : "none",
                  }}
                >
                  {item}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
