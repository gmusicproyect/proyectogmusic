import { useState, useRef, useEffect, type CSSProperties } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, Star } from "lucide-react";
import type { PathNodeData } from "../../data/gmusic-path-types";
import {
  DEMO_ACADEMY_MORE_COUNT,
  DEMO_ACADEMY_TEASER_NODE_ID,
  getDemoPathEntry,
  isSubscriptionLockedLesson,
} from "../../data/demo-path-catalog";

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

const LOCKED_GRADIENT =
  "linear-gradient(145deg, #1c1c1c 0%, #141414 45%, #0c0c0c 100%)";

const ACADEMY_TEASER_GRADIENT =
  "linear-gradient(145deg, #2a1f08 0%, #5a4010 40%, #C9A84C 100%)";

function getLessonNumber(nodeId: string): number | null {
  const m = /^demo-node-(\d+)$/.exec(nodeId);
  if (!m || !m[1]) return null;
  return parseInt(m[1], 10);
}

function isAcademyTeaserNode(nodeId: string): boolean {
  return nodeId === DEMO_ACADEMY_TEASER_NODE_ID;
}

function getLessonMeta(lessonNum: number | null) {
  if (lessonNum == null) return undefined;
  return getDemoPathEntry(lessonNum);
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
  /** Carrusel a ancho de página, sin caja contenedora */
  fullBleed?: boolean;
  /** All lessons done — brighter carousel for review mode */
  reviewCompleted?: boolean;
  allowLockedSelection?: boolean;
  hintText?: string;
  onStartLesson: (lessonNumber: number) => void;
  onLockedClick: (title: string, lessonNumber: number) => void;
  onAcademyTeaserClick?: () => void;
}

export function DemoPathCards({
  nodes,
  fullBleed = false,
  reviewCompleted = false,
  allowLockedSelection = false,
  hintText,
  onStartLesson,
  onLockedClick,
  onAcademyTeaserClick,
}: DemoPathCardsProps) {
  const initialFocus = (() => {
    const activeIdx = nodes.findIndex((n) => n.status === "active");
    if (activeIdx >= 0) return activeIdx;
    const completedCount = nodes.filter((n) => n.status === "completed").length;
    if (completedCount >= 5) {
      const teaserIdx = nodes.findIndex((n) => isAcademyTeaserNode(n.id));
      if (teaserIdx >= 0) return teaserIdx;
    }
    return 0;
  })();
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
    const isTeaserCard = isAcademyTeaserNode(node.id);
    const lessonNum = getLessonNumber(node.id);
    const meta = getLessonMeta(lessonNum);
    const isFocused = i === focusedIdx;
    const isCompleted = node.status === "completed";
    const isActive = node.status === "active";
    const isLocked = node.status === "locked";
    const isSubscriptionLock =
      lessonNum != null && isSubscriptionLockedLesson(lessonNum);
    const gradient = isTeaserCard
      ? ACADEMY_TEASER_GRADIENT
      : isSubscriptionLock || (isLocked && lessonNum != null && lessonNum > 5)
      ? LOCKED_GRADIENT
      : lessonNum != null
      ? CARD_GRADIENTS[lessonNum] ?? LOCKED_GRADIENT
      : LOCKED_GRADIENT;
    const categoryLabel = meta?.subtitle ?? node.typeLabel ?? "Lección";
    const starsFilled = isCompleted ? 3 : 0;

    const handleCardClick = () => {
      if (isTeaserCard) {
        if (!isFocused) {
          goTo(i);
          return;
        }
        onAcademyTeaserClick?.();
        return;
      }

      if (!isFocused) {
        goTo(i);
        if (isLocked && isSubscriptionLock && allowLockedSelection && lessonNum != null) {
          onLockedClick(node.title, lessonNum);
        }
        return;
      }

      if (isLocked) {
        if (allowLockedSelection && lessonNum != null) {
          onLockedClick(node.title, lessonNum);
        }
        return;
      }

      if (lessonNum != null) {
        onStartLesson(lessonNum);
      }
    };

    return (
      <motion.div
        key={node.id}
        ref={(el) => {
          cardRefs.current[i] = el;
        }}
        animate={{
          scale: isFocused ? 1 : reviewCompleted && isCompleted ? 0.94 : 0.88,
          opacity: isFocused
            ? 1
            : isTeaserCard
            ? 0.72
            : isLocked
            ? 0.45
            : reviewCompleted && isCompleted
            ? 0.82
            : 0.55,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={handleCardClick}
        style={{
          flexShrink: 0,
          width: 240,
          borderRadius: 14,
          background: SURFACE_CARD,
          border: isFocused
            ? isTeaserCard
              ? `2px solid ${GOLD}`
              : isActive
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
          boxShadow: isFocused && (isTeaserCard || isActive || (reviewCompleted && isCompleted))
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
          {isTeaserCard && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 42,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.92)",
                  lineHeight: 1,
                  textShadow: "0 2px 12px rgba(0,0,0,0.45)",
                }}
              >
                60+
              </span>
            </div>
          )}
          {isSubscriptionLock && !isTeaserCard && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.35)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock size={20} color="rgba(255,255,255,0.45)" strokeWidth={1.75} />
              </div>
            </div>
          )}
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
          {isCompleted && (
            <span
              style={{
                position: "absolute",
                top: 10,
                left: 12,
                fontSize: 8,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                color: "#0A0A0A",
                background: GOLD,
                padding: "3px 7px",
                borderRadius: 4,
              }}
            >
              Completada
            </span>
          )}
          {lessonNum != null && (
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
          )}
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
              color: isLocked && !isTeaserCard ? "rgba(255,255,255,0.45)" : WHITE_WARM,
            }}
          >
            {node.title}
          </h3>

          {!isTeaserCard && <StarRating filled={starsFilled} dimmed={isLocked} />}

          {isTeaserCard && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 11,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.45,
              }}
            >
              Desbloquea el camino completo con un plan de academia.
            </p>
          )}

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
              {isSubscriptionLock ? "Requiere plan de academia" : "Completa la clase anterior"}
            </p>
          )}

          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{ marginTop: 14 }}
            >
              {isTeaserCard ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcademyTeaserClick?.();
                  }}
                  style={ctaButtonStyle(false, false)}
                >
                  Elegir plan
                </button>
              ) : isLocked ? (
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
                    if (lessonNum == null) return;
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
        {isCompleted && (
          <div
            style={{
              height: 3,
              background: `linear-gradient(90deg, ${GOLD} 0%, rgba(201,168,76,0.35) 100%)`,
            }}
          />
        )}
      </motion.div>
    );
  });

  const carouselPadding = fullBleed ? "12px max(5vw, 40px) 16px" : "12px 56px 16px";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flex: 1,
      }}
    >
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
          padding: carouselPadding,
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
          alignItems: "center",
          gap: 6,
          marginTop: hintText ? 8 : 4,
          flexWrap: "wrap",
        }}
      >
        {hintText && (
          <span
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "rgba(201,168,76,0.4)",
              fontFamily: "Inter, sans-serif",
              marginBottom: 2,
            }}
          >
            {hintText}
          </span>
        )}
        {nodes.length <= 12 ? (
          nodes.map((_, i) => (
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
          ))
        ) : (
          <span
            style={{
              fontSize: 11,
              letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {isAcademyTeaserNode(nodes[focusedIdx]?.id ?? "")
              ? `Más de ${DEMO_ACADEMY_MORE_COUNT} clases · camino completo`
              : `Clase ${getLessonNumber(nodes[focusedIdx]?.id ?? "") ?? focusedIdx + 1} de ${
                  nodes.filter((n) => !isAcademyTeaserNode(n.id)).length
                }`}
          </span>
        )}
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
