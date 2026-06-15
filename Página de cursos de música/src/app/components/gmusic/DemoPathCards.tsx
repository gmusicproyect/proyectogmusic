import { useState, useRef, useEffect, type CSSProperties } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import type { PathNodeData } from "../../data/gmusic-path-types";
import { DEMO_LESSONS } from "../../data/demo-lessons";

const WHITE_WARM = "#F5F0E8";
const GOLD = "#C9A84C";
const SURFACE_CARD = "#161616";

const CARD_GRADIENTS: Record<number, string> = {
  1: "linear-gradient(145deg, #3d2a08 0%, #7a5810 45%, #C9A84C 100%)",
  2: "linear-gradient(145deg, #0a1628 0%, #1a3a6a 55%, #2a5a9a 100%)",
  3: "linear-gradient(145deg, #0a2018 0%, #1a4a32 55%, #2a7a52 100%)",
  4: "linear-gradient(145deg, #1a0a32 0%, #3a1a6a 55%, #5a2a9a 100%)",
  5: "linear-gradient(145deg, #4a3010 0%, #9a7010 50%, #e6c060 100%)",
};

function getLessonNumber(nodeId: string): number {
  const m = /^demo-node-(\d)$/.exec(nodeId);
  return m && m[1] ? parseInt(m[1], 10) : 1;
}

function getLessonMeta(lessonNum: number) {
  return DEMO_LESSONS.find((l) => l.lessonNumber === lessonNum);
}

function StarRating({ filled, dimmed }: { filled: number; dimmed?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {Array.from({ length: 3 }, (_, i) => {
        const isFilled = i < filled;
        return (
          <Star
            key={i}
            size={14}
            fill={isFilled ? GOLD : "transparent"}
            stroke={isFilled ? GOLD : dimmed ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.28)"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
}

export interface DemoPathCardsProps {
  nodes: PathNodeData[];
  allowLockedSelection?: boolean;
  onStartLesson: (lessonNumber: number) => void;
  onLockedClick: (title: string) => void;
}

export function DemoPathCards({
  nodes,
  allowLockedSelection = false,
  onStartLesson,
  onLockedClick,
}: DemoPathCardsProps) {
  const initialFocus = Math.max(
    0,
    nodes.findIndex((n) => n.status === "active"),
    nodes.every((n) => n.status === "completed") ? nodes.length - 1 : -1
  );
  const [focusedIdx, setFocusedIdx] = useState(initialFocus);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const card = cardRefs.current[focusedIdx];
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [focusedIdx]);

  const goTo = (idx: number) => setFocusedIdx(Math.max(0, Math.min(nodes.length - 1, idx)));

  const carouselItems = nodes.map((node, i) => {
    const lessonNum = getLessonNumber(node.id);
    const meta = getLessonMeta(lessonNum);
    const isFocused = i === focusedIdx;
    const isCompleted = node.status === "completed";
    const isActive = node.status === "active";
    const isLocked = node.status === "locked";
    const gradient = CARD_GRADIENTS[lessonNum] ?? CARD_GRADIENTS[1];
    const categoryLabel = meta?.subtitle ?? node.typeLabel ?? "Lección";
    const starsFilled = isCompleted ? 3 : 0;

    return (
      <motion.div
        key={node.id}
        ref={(el) => {
          cardRefs.current[i] = el;
        }}
        animate={{
          scale: isFocused ? 1 : 0.88,
          opacity: isFocused ? 1 : isLocked ? 0.35 : 0.55,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={() => {
          if (!isFocused) {
            goTo(i);
            return;
          }
          if (isLocked) {
            if (allowLockedSelection) onLockedClick(node.title);
            return;
          }
          onStartLesson(lessonNum);
        }}
        style={{
          flexShrink: 0,
          width: 240,
          borderRadius: 14,
          background: SURFACE_CARD,
          border: isFocused
            ? isActive
              ? `2px solid ${GOLD}`
              : isCompleted
              ? `2px solid rgba(201,168,76,0.45)`
              : `2px solid rgba(255,255,255,0.12)`
            : "2px solid rgba(255,255,255,0.06)",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          scrollSnapAlign: "center",
          overflow: "hidden",
          boxShadow: isFocused && isActive
            ? "0 0 28px rgba(201,168,76,0.28), 0 16px 40px rgba(0,0,0,0.45)"
            : isFocused
            ? "0 16px 40px rgba(0,0,0,0.4)"
            : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        {/* Thumbnail */}
        <div
          style={{
            height: 120,
            background: gradient,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
          <span
            style={{
              position: "absolute",
              bottom: 10,
              left: 12,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
              color: "rgba(255,255,255,0.85)",
              background: "rgba(0,0,0,0.35)",
              padding: "3px 8px",
              borderRadius: 4,
            }}
          >
            {categoryLabel}
          </span>
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 12,
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 600,
              color: "rgba(255,255,255,0.12)",
              lineHeight: 1,
            }}
          >
            {lessonNum}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: "14px 14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
          <h3
            style={{
              margin: "0 0 8px",
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 17,
              fontWeight: 500,
              lineHeight: 1.25,
              color: isLocked ? "rgba(255,255,255,0.45)" : WHITE_WARM,
            }}
          >
            {node.title}
          </h3>

          <StarRating filled={starsFilled} dimmed={isLocked} />

          {meta?.videoDuration && !isLocked && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {meta.videoDuration}
            </p>
          )}

          {isLocked && (
            <p
              style={{
                margin: "8px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "rgba(255,255,255,0.28)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              <Lock size={11} />
              Completa la clase anterior
            </p>
          )}

          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{ marginTop: 14 }}
            >
              {isLocked ? (
                <button
                  type="button"
                  disabled
                  style={ctaButtonStyle(true)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Lock size={14} style={{ marginRight: 6 }} />
                  Bloqueada
                </button>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartLesson(lessonNum);
                  }}
                  style={ctaButtonStyle(false, isCompleted)}
                >
                  {isCompleted ? "Repetir" : "Continuar"}
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  });

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {focusedIdx > 0 && (
        <button
          type="button"
          onClick={() => goTo(focusedIdx - 1)}
          aria-label="Clase anterior"
          style={arrowButtonStyle("left")}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div
        className="gmusic-carousel"
        style={{
          display: "flex",
          gap: 12,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          padding: "12px 56px 16px",
          alignItems: "stretch",
        }}
      >
        <style>{`.gmusic-carousel::-webkit-scrollbar { display: none; }`}</style>
        {carouselItems}
      </div>

      {focusedIdx < nodes.length - 1 && (
        <button
          type="button"
          onClick={() => goTo(focusedIdx + 1)}
          aria-label="Clase siguiente"
          style={arrowButtonStyle("right")}
        >
          <ChevronRight size={22} />
        </button>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginTop: 4,
        }}
      >
        {nodes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ir a clase ${i + 1}`}
            style={{
              width: i === focusedIdx ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: i === focusedIdx ? GOLD : "rgba(255,255,255,0.15)",
              border: "none",
              cursor: "pointer",
              transition: "all 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ctaButtonStyle(locked: boolean, completed?: boolean): CSSProperties {
  if (locked) {
    return {
      width: "100%",
      height: 40,
      borderRadius: 8,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.28)",
      fontSize: 12,
      fontWeight: 600,
      fontFamily: "Inter, sans-serif",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      cursor: "not-allowed",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  }

  return {
    width: "100%",
    height: 40,
    borderRadius: 8,
    background: completed ? "transparent" : GOLD,
    border: completed ? `1px solid ${GOLD}` : "none",
    color: completed ? GOLD : "#0A0A0A",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "Inter, sans-serif",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    boxShadow: completed ? "none" : "0 4px 0 rgba(140,100,20,0.6)",
    transition: "transform 80ms ease",
  };
}

function arrowButtonStyle(side: "left" | "right"): CSSProperties {
  return {
    position: "absolute",
    [side]: 8,
    top: "42%",
    transform: "translateY(-50%)",
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(18,18,18,0.92)",
    border: "1px solid rgba(255,255,255,0.10)",
    color: "rgba(255,255,255,0.55)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  };
}
