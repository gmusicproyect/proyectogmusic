import type { ReactNode } from "react";
import {
  PATH_LESSON_TAB_DEFINITIONS,
  type PathLessonTabId,
} from "./path-lesson-tab-ids";
import { GM_BORDER, GM_GOLD, GM_SURFACE, GM_TEXT_SEC } from "../tokens";

export interface PathLessonTabsShellProps {
  activeTab: PathLessonTabId;
  onTabChange: (tab: PathLessonTabId) => void;
  tarjetasPanel: ReactNode;
  practicaPanel: ReactNode;
  resumenPdfPanel: ReactNode;
}

export function PathLessonTabsShell({
  activeTab,
  onTabChange,
  tarjetasPanel,
  practicaPanel,
  resumenPdfPanel,
}: PathLessonTabsShellProps) {
  const panels: Record<PathLessonTabId, ReactNode> = {
    tarjetas: tarjetasPanel,
    practica: practicaPanel,
    "resumen-pdf": resumenPdfPanel,
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      <div
        className="flex flex-col gap-1 rounded-lg border p-1 sm:flex-row"
        role="tablist"
        aria-label="Experiencia de lección"
        style={{ borderColor: GM_BORDER, background: GM_SURFACE }}
      >
        {PATH_LESSON_TAB_DEFINITIONS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`path-lesson-panel-${tab.id}`}
              id={`path-lesson-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="min-h-[44px] flex-1 rounded-md px-3 text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors"
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

      <div
        role="tabpanel"
        id={`path-lesson-panel-${activeTab}`}
        aria-labelledby={`path-lesson-tab-${activeTab}`}
        className="w-full min-w-0"
      >
        {panels[activeTab]}
      </div>
    </div>
  );
}
