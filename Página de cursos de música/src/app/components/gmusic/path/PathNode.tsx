import { Check, Lock, Guitar, BookOpen } from "lucide-react";
import type { PathNodeData } from "../../../data/gmusic-path-types";
import { NODE_TYPE_LABELS } from "../../../data/gmusic-path-types";
import {
  GM_GOLD,
  GM_GOLD_GLOW,
  GM_SURFACE,
  GM_SURFACE_ALT,
  GM_TEXT,
  GM_TEXT_SEC,
  GM_BORDER,
} from "../tokens";

interface PathNodeProps {
  node: PathNodeData;
  stepIndex: number;
  isSelected?: boolean;
  onSelect?: (node: PathNodeData) => void;
}

function NodeMarker({ node }: { node: PathNodeData }) {
  const { status, type } = node;
  const isLocked = status === "locked";
  const isActive = status === "active";
  const isAvailable = status === "available";
  const isCompleted = status === "completed";

  if (isCompleted) {
    return (
      <div
        className="flex items-center justify-center rounded-md shrink-0"
        style={{
          width: 44,
          height: 44,
          background: "rgba(212, 175, 55, 0.12)",
          border: `1px solid rgba(212, 175, 55, 0.45)`,
        }}
      >
        <Check className="w-4 h-4" style={{ color: GM_GOLD }} strokeWidth={2.5} />
      </div>
    );
  }

  if (isActive) {
    return (
      <div
        className="flex items-center justify-center rounded-md shrink-0"
        style={{
          width: 44,
          height: 44,
          background: GM_SURFACE_ALT,
          border: `1.5px solid ${GM_GOLD}`,
          boxShadow: `0 0 20px ${GM_GOLD_GLOW}`,
        }}
      >
        <Guitar className="w-4 h-4" style={{ color: GM_GOLD }} />
      </div>
    );
  }

  if (isAvailable) {
    return (
      <div
        className="flex items-center justify-center rounded-md shrink-0"
        style={{
          width: 44,
          height: 44,
          background: GM_SURFACE,
          border: `1px solid rgba(212, 175, 55, 0.35)`,
        }}
      >
        <Guitar className="w-4 h-4" style={{ color: "rgba(212, 175, 55, 0.75)" }} />
      </div>
    );
  }

  if (isLocked && type === "reward") {
    return (
      <div
        className="flex items-center justify-center rounded-md shrink-0 opacity-40"
        style={{
          width: 44,
          height: 44,
          background: GM_SURFACE,
          border: `1px solid ${GM_BORDER}`,
        }}
      >
        <BookOpen className="w-4 h-4" style={{ color: "#666" }} />
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-md shrink-0 opacity-40"
      style={{
        width: 44,
        height: 44,
        background: GM_SURFACE,
        border: `1px solid ${GM_BORDER}`,
      }}
    >
      <Lock className="w-3.5 h-3.5" style={{ color: "#666" }} />
    </div>
  );
}

export function PathNode({ node, stepIndex, isSelected = false, onSelect }: PathNodeProps) {
  const { status, lane, title, type, duration } = node;
  const isLocked = status === "locked";
  const isActive = status === "active";
  const isAvailable = status === "available";
  const isCompleted = status === "completed";
  const isSelectable = isActive || isAvailable;
  const typeLabel = NODE_TYPE_LABELS[type];

  const justify =
    lane === "left" ? "flex-start" : lane === "right" ? "flex-end" : "center";

  const cardAlign =
    lane === "left" ? "items-start text-left" : lane === "right" ? "items-end text-right" : "items-center text-center";

  const handleClick = () => {
    if (isSelectable && onSelect) onSelect(node);
  };

  const flexDirection =
    lane === "center" ? "column" : lane === "right" ? "row-reverse" : "row";

  return (
    <div
      className="relative flex flex-col"
      style={{
        justifyContent: justify,
        alignItems: lane === "left" ? "flex-start" : lane === "right" ? "flex-end" : "center",
        marginBottom: 40,
      }}
    >
      {isActive && (
        <span
          className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase"
          style={{ color: GM_GOLD, opacity: 0.85 }}
        >
          Lección en curso
        </span>
      )}

      {isAvailable && !isActive && (
        <span
          className="mb-2 text-[10px] font-medium tracking-[0.2em] uppercase"
          style={{ color: "rgba(212, 175, 55, 0.55)" }}
        >
          Paso desbloqueado
        </span>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={!isSelectable}
        className={`flex gap-3 max-w-[280px] transition-opacity ${cardAlign}`}
        style={{
          flexDirection,
          cursor: isSelectable ? "pointer" : "default",
          opacity: isLocked ? 0.55 : 1,
          background: "none",
          border: "none",
          borderRadius: 12,
          padding: 0,
          boxShadow:
            isSelected && isSelectable
              ? "inset 0 0 0 1px rgba(212, 175, 55, 0.35)"
              : "none",
          textAlign: lane === "right" ? "right" : lane === "left" ? "left" : "center",
        }}
      >
        <NodeMarker node={node} />

        <div className={`flex flex-col min-w-0 ${lane === "center" ? "items-center" : ""}`}>
          <span
            className="text-[10px] tracking-widest uppercase mb-0.5"
            style={{
              color: isActive || isAvailable ? GM_GOLD : "rgba(160,160,165,0.7)",
            }}
          >
            {String(stepIndex).padStart(2, "0")} · {typeLabel}
            {duration ? ` · ${duration}` : ""}
          </span>
          <span
            className="text-sm font-medium leading-snug"
            style={{
              color: isActive ? GM_TEXT : isAvailable ? GM_TEXT_SEC : isCompleted ? GM_TEXT_SEC : "#666",
            }}
          >
            {title}
          </span>
          {isCompleted && (
            <span className="text-[10px] mt-1 tracking-wide" style={{ color: "rgba(212,175,55,0.5)" }}>
              Completada
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
